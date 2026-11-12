import time
from pathlib import Path
from typing import Any, Dict, List, Optional
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


class DamageDetector:
    """Road damage detector utilizing Ultralytics YOLOv8 architecture."""

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
            except Exception as e:
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
    ) -> DamageInferenceResponse:
        """Run YOLO damage detection inference on an input BGR image.

        Args:
            image: 3-channel OpenCV BGR numpy array.
            confidence_threshold: Optional detection confidence override.
            iou_threshold: Optional NMS IoU threshold override.

        Returns:
            DamageInferenceResponse containing detected damage boxes and confidence.

        Raises:
            ModelNotReadyError: If model weights are not loaded.
            ValueError: If input image is empty or invalid.
        """
        if not self.is_ready() or self.model is None:
            raise ModelNotReadyError(
                "Road damage model is not loaded. Trained weights are not deployed."
            )

        if image is None or image.size == 0 or image.ndim != 3:
            raise ValueError("Invalid image array provided for inference.")

        h, w = image.shape[:2]
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

        return DamageInferenceResponse(
            status="success",
            model_name=self.model_name,
            device_used=self.device,
            inference_time_ms=round(inference_time_ms, 2),
            image_width=w,
            image_height=h,
            total_detections=len(detections),
            detections=detections,
        )
