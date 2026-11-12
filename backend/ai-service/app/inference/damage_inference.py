import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import cv2
import numpy as np
import torch
from ultralytics import YOLO

from app.config import BASE_DIR, MLConfig, settings
from app.schemas.damage import (
    BoundingBox,
    DamageDetection,
    DamageInferenceResponse,
    DamageSeverity,
    ModelStatusResponse,
    SmartRepairPlan,
)


class ModelNotReadyError(RuntimeError):
    """Raised when inference is requested but model weights are not loaded."""
    pass


def estimate_damage_severity(
    class_name: str,
    bbox: BoundingBox,
    image_width: int,
    image_height: int,
) -> DamageSeverity:
    """Responsibly estimate road defect severity based on defect category and footprint.

    Heuristic methodology:
    - Potholes (D40/pothole) pose immediate vehicle safety and tire hazard:
      High or Critical depending on visible area.
    - Alligator cracks (D20/alligator) indicate structural roadbed failure:
      High if extensive, Medium if localized.
    - Longitudinal/Transverse cracks (D00, D10):
      Medium if wide/long, Low if minor.
    - Default to LOW for minor or unclassified distress.
    """
    total_area = max(image_width * image_height, 1)
    box_area = bbox.width * bbox.height
    area_ratio = box_area / total_area

    name_lower = class_name.lower()

    if "pothole" in name_lower or "d40" in name_lower:
        return DamageSeverity.CRITICAL if area_ratio > 0.04 else DamageSeverity.HIGH

    if "alligator" in name_lower or "d20" in name_lower:
        return DamageSeverity.HIGH if area_ratio > 0.05 else DamageSeverity.MEDIUM

    if "transverse" in name_lower or "d10" in name_lower:
        return DamageSeverity.MEDIUM if area_ratio > 0.03 else DamageSeverity.LOW

    if "longitudinal" in name_lower or "d00" in name_lower:
        return DamageSeverity.MEDIUM if area_ratio > 0.04 else DamageSeverity.LOW

    # Fallback heuristic based strictly on relative defect size
    if area_ratio > 0.08:
        return DamageSeverity.HIGH
    elif area_ratio > 0.02:
        return DamageSeverity.MEDIUM
    return DamageSeverity.LOW


def generate_smart_repair_plan(
    detections: List[DamageDetection],
    image_width: int,
    image_height: int,
) -> SmartRepairPlan:
    """Generate an automated data-driven repair strategy and cost estimate based on detected defects.

    Calculates:
    - Pavement Condition Index (PCI, 0-100)
    - Maintenance urgency (IMMEDIATE, SCHEDULED, MONITORING)
    - Conforming IRC / MoRTH material specification
    - Realistic expenditure estimate in Indian Rupees (INR)
    - Labor hours and material volume requirements
    """
    if not detections:
        return SmartRepairPlan(
            pavement_condition_index=95,
            priority_level="MONITORING",
            recommended_action="Pavement surface in satisfactory condition; maintain routine quarterly inspection cycle.",
            recommended_material="Preventative fog seal or micro-surfacing emulsion (IRC:SP:81).",
            estimated_cost_inr=0,
            estimated_labor_hours=0.0,
            estimated_material_quantity_kg=0.0,
        )

    # Count defect distress types
    potholes = [d for d in detections if "pothole" in d.class_name.lower() or "d40" in d.class_name.lower()]
    alligators = [d for d in detections if "alligator" in d.class_name.lower() or "d20" in d.class_name.lower()]
    cracks = [d for d in detections if "crack" in d.class_name.lower() or "d00" in d.class_name.lower() or "d10" in d.class_name.lower()]
    critical_count = sum(1 for d in detections if d.severity == DamageSeverity.CRITICAL)
    high_count = sum(1 for d in detections if d.severity == DamageSeverity.HIGH)

    # Calculate Pavement Condition Index (PCI)
    pci = 100
    pci -= critical_count * 25
    pci -= high_count * 15
    pci -= len(alligators) * 12
    pci -= len(cracks) * 6
    pci = max(15, min(100, pci))

    # Priority determination
    if pci < 45 or critical_count > 0:
        priority = "IMMEDIATE"
    elif pci < 70 or high_count > 0 or len(alligators) > 0:
        priority = "SCHEDULED"
    else:
        priority = "MONITORING"

    # Cost, labor, and materials calculation
    base_mobilization_inr = 3500
    pothole_cost = sum(
        4500 if d.severity == DamageSeverity.CRITICAL else (2800 if d.severity == DamageSeverity.HIGH else 1800)
        for d in potholes
    )
    alligator_cost = len(alligators) * 3800
    crack_cost = len(cracks) * 1200
    total_cost = base_mobilization_inr + pothole_cost + alligator_cost + crack_cost

    labor_hours = round(2.0 + len(potholes) * 1.5 + len(alligators) * 2.0 + len(cracks) * 0.75, 1)
    material_kg = round(
        sum(80.0 if d.severity == DamageSeverity.CRITICAL else 45.0 for d in potholes)
        + len(alligators) * 60.0
        + len(cracks) * 15.0,
        1,
    )

    # Actionable engineering recommendations
    if potholes:
        rec_action = (
            "Square-cut cavity edges to vertical faces, clean dust with compressed air, "
            "apply rapid-setting emulsion tack coat (RS-1), and compact asphalt patch in 50mm lifts (IRC:SP:100)."
        )
        rec_material = "Cold Mix Asphalt (CMA) or Hot Mix Asphalt (VG-30 grade) conforming to MoRTH Section 500."
    elif alligators:
        rec_action = (
            "Mill out fatigued asphalt layer down to granular base, apply paving geotextile, "
            "and lay Dense Bituminous Macadam (DBM) with roller compaction (IRC:111)."
        )
        rec_material = "Dense Bituminous Macadam (DBM) Grade 2 with VG-30 Bitumen binder."
    else:
        rec_action = (
            "Rout cracks to 10mm width, clean debris, and inject hot-poured elastomeric "
            "crack sealant flush with road surface (IRC:SP:83)."
        )
        rec_material = "Hot-applied polymer modified crack sealant conforming to ASTM D6690 / IRC:SP:83."

    return SmartRepairPlan(
        pavement_condition_index=pci,
        priority_level=priority,
        recommended_action=rec_action,
        recommended_material=rec_material,
        estimated_cost_inr=total_cost,
        estimated_labor_hours=labor_hours,
        estimated_material_quantity_kg=material_kg,
    )


def analyze_road_pavement_cv(
    image: np.ndarray,
    min_confidence: float = 0.50,
) -> List[DamageDetection]:
    """Analyze road pavement using OpenCV contour and gradient algorithms.

    Extracts:
    - Potholes (dark localized cavity depressions with contrast variance)
    - Cracks (directional high-gradient edge contours)
    """
    h, w = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)

    detections: List[DamageDetection] = []

    # 1. Pothole / Depressive Defect Detection via Local Relative Contrast
    k_size = max(15, (min(w, h) // 20) * 2 + 1)
    local_mean = cv2.boxFilter(blurred, ddepth=-1, ksize=(k_size, k_size))
    diff = cv2.subtract(local_mean, blurred)
    _, dark_spots = cv2.threshold(diff, 20, 255, cv2.THRESH_BINARY)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(dark_spots, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

    min_area = (w * h) * 0.003
    max_area = (w * h) * 0.35

    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        area = cv2.contourArea(c)
        if min_area <= area <= max_area:
            bx, by, bw, bh = cv2.boundingRect(c)
            aspect = bw / max(bh, 1)
            if 0.3 <= aspect <= 3.3:
                conf = min(0.92, max(0.60, 0.55 + (area / (w * h)) * 5.0))
                bbox = BoundingBox(
                    x_min=float(bx),
                    y_min=float(by),
                    x_max=float(bx + bw),
                    y_max=float(by + bh),
                    width=float(bw),
                    height=float(bh),
                    x_min_norm=round(bx / w, 4),
                    y_min_norm=round(by / h, 4),
                    x_max_norm=round((bx + bw) / w, 4),
                    y_max_norm=round((by + bh) / h, 4),
                )
                severity = estimate_damage_severity("pothole", bbox, w, h)
                detections.append(
                    DamageDetection(
                        class_id=0,
                        class_name="pothole",
                        confidence=round(conf, 4),
                        bbox=bbox,
                        severity=severity,
                    )
                )

    # 2. Crack Detection via Canny Edge Tracing
    edges = cv2.Canny(blurred, 40, 120)
    dilated = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 5)), iterations=1)
    crack_contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for c in crack_contours:
        cx, cy, cw, ch = cv2.boundingRect(c)
        diag = np.sqrt(cw**2 + ch**2)
        if diag > min(w, h) * 0.18:
            aspect = ch / max(cw, 1)
            # Differentiate longitudinal vs transverse vs alligator
            if aspect > 2.2:
                cls_name = "longitudinal_crack"
                cls_id = 1
            elif aspect < 0.45:
                cls_name = "transverse_crack"
                cls_id = 2
            else:
                cls_name = "alligator_crack"
                cls_id = 3

            conf = min(0.88, max(0.55, 0.50 + (diag / max(w, h)) * 0.5))
            bbox = BoundingBox(
                x_min=float(cx),
                y_min=float(cy),
                x_max=float(cx + cw),
                y_max=float(cy + ch),
                width=float(cw),
                height=float(ch),
                x_min_norm=round(cx / w, 4),
                y_min_norm=round(cy / h, 4),
                x_max_norm=round((cx + cw) / w, 4),
                y_max_norm=round((cy + ch) / h, 4),
            )
            severity = estimate_damage_severity(cls_name, bbox, w, h)
            detections.append(
                DamageDetection(
                    class_id=cls_id,
                    class_name=cls_name,
                    confidence=round(conf, 4),
                    bbox=bbox,
                    severity=severity,
                )
            )

    return detections


class DamageDetector:
    """Road damage detector utilizing Ultralytics YOLOv8 with Computer Vision fallback."""

    def __init__(
        self,
        config: Optional[MLConfig] = None,
        model_instance: Optional[Any] = None,
    ):
        self.config: MLConfig = config or settings
        self.device: str = self._resolve_device(self.config.device)
        self.model_name: Optional[str] = None
        self._is_ready: bool = False

        if model_instance is not None:
            # Injected model (e.g. for testing)
            self.model = model_instance
            self.model_name = "injected_model"
            self._is_ready = True
        elif self.config.model_exists:
            try:
                self.model = YOLO(str(self.config.model_path))
                self.model_name = self.config.model_path.name
                self._is_ready = True
            except Exception:
                self.model = None
                self._is_ready = False
        else:
            self.model = None
            self._is_ready = False

    def _resolve_device(self, requested: str) -> str:
        """Ensure device selection is valid and falls back gracefully to CPU."""
        if requested.startswith("cuda"):
            if not torch.cuda.is_available():
                return "cpu"
            return requested
        return "cpu"

    def is_ready(self) -> bool:
        """Return True if model is loaded and ready to serve inference."""
        return self._is_ready and self.model is not None

    def get_status(self) -> ModelStatusResponse:
        """Report microservice readiness and configuration details."""
        try:
            rel_path = (
                str(self.config.model_path.relative_to(BASE_DIR))
                if self.config.model_path.is_relative_to(BASE_DIR)
                else self.config.model_path.name
            )
        except Exception:
            rel_path = self.config.model_path.name

        return ModelStatusResponse(
            service=self.config.service_name,
            status="ready" if self.is_ready() else "degraded",
            model_ready=self.is_ready(),
            model_path=rel_path,
            device=self.device,
            confidence_threshold=self.config.confidence_threshold,
            iou_threshold=self.config.iou_threshold,
        )

    def predict(
        self,
        image: np.ndarray,
        confidence_threshold: Optional[float] = None,
        iou_threshold: Optional[float] = None,
        allow_fallback: bool = False,
    ) -> DamageInferenceResponse:
        """Run damage detection inference on an input BGR image.

        Args:
            image: 3-channel OpenCV BGR numpy array.
            confidence_threshold: Optional detection confidence override.
            iou_threshold: Optional NMS IoU threshold override.
            allow_fallback: If True, uses computer vision contour analysis when YOLO weights are missing.

        Returns:
            DamageInferenceResponse containing detected damage boxes, confidence, and repair plan.

        Raises:
            ModelNotReadyError: If model weights are not loaded and allow_fallback is False.
            ValueError: If input image is empty or invalid.
        """
        if image is None or image.size == 0 or image.ndim != 3:
            raise ValueError("Invalid image array provided for inference.")

        h, w = image.shape[:2]

        if not self.is_ready() or self.model is None:
            if not allow_fallback:
                raise ModelNotReadyError(
                    "Road damage model is not loaded. Trained weights are not deployed."
                )

            # Execute automated Computer Vision distress analysis
            start_time = time.perf_counter()
            detections = analyze_road_pavement_cv(image)
            inference_time_ms = (time.perf_counter() - start_time) * 1000.0

            repair_plan = generate_smart_repair_plan(detections, w, h)

            return DamageInferenceResponse(
                status="success",
                model_name="cv_pavement_analyzer",
                device_used=self.device,
                inference_time_ms=round(inference_time_ms, 2),
                image_width=w,
                image_height=h,
                total_detections=len(detections),
                detections=detections,
                repair_plan=repair_plan,
            )

        conf = (
            confidence_threshold
            if confidence_threshold is not None
            else self.config.confidence_threshold
        )
        iou = (
            iou_threshold
            if iou_threshold is not None
            else self.config.iou_threshold
        )

        start_time = time.perf_counter()
        results = self.model.predict(
            source=image,
            conf=conf,
            iou=iou,
            imgsz=self.config.image_size,
            device=self.device,
            verbose=False,
        )
        inference_time_ms = (time.perf_counter() - start_time) * 1000.0

        detections: List[DamageDetection] = []

        if results and len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            names = getattr(self.model, "names", {})

            for i in range(len(boxes)):
                xyxy = boxes.xyxy[i].cpu().numpy().tolist()
                score = float(boxes.conf[i].cpu().item())
                cls_id = int(boxes.cls[i].cpu().item())
                cls_name = (
                    names.get(cls_id, f"damage_class_{cls_id}")
                    if isinstance(names, dict)
                    else (
                        names[cls_id]
                        if isinstance(names, (list, tuple)) and cls_id < len(names)
                        else f"damage_class_{cls_id}"
                    )
                )

                # Clamp bounding box coordinates within image boundaries
                x_min = max(0.0, min(float(xyxy[0]), float(w)))
                y_min = max(0.0, min(float(xyxy[1]), float(h)))
                x_max = max(x_min, min(float(xyxy[2]), float(w)))
                y_max = max(y_min, min(float(xyxy[3]), float(h)))
                bw = max(0.0, x_max - x_min)
                bh = max(0.0, y_max - y_min)

                bbox = BoundingBox(
                    x_min=round(x_min, 2),
                    y_min=round(y_min, 2),
                    x_max=round(x_max, 2),
                    y_max=round(y_max, 2),
                    width=round(bw, 2),
                    height=round(bh, 2),
                    x_min_norm=round(x_min / w, 4),
                    y_min_norm=round(y_min / h, 4),
                    x_max_norm=round(x_max / w, 4),
                    y_max_norm=round(y_max / h, 4),
                )

                severity = estimate_damage_severity(cls_name, bbox, w, h)

                detections.append(
                    DamageDetection(
                        class_id=cls_id,
                        class_name=cls_name,
                        confidence=round(score, 4),
                        bbox=bbox,
                        severity=severity,
                    )
                )

        repair_plan = generate_smart_repair_plan(detections, w, h)

        return DamageInferenceResponse(
            status="success",
            model_name=self.model_name,
            device_used=self.device,
            inference_time_ms=round(inference_time_ms, 2),
            image_width=w,
            image_height=h,
            total_detections=len(detections),
            detections=detections,
            repair_plan=repair_plan,
        )
