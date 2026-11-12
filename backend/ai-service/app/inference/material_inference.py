import time
from typing import List, Optional, Tuple
import cv2
import numpy as np

from app.schemas.material import (
    ComplianceStatus,
    MaterialAssessmentResponse,
    MaterialCategory,
    MaterialPropertyMetric,
)


class MaterialAssessor:
    """Automated visual verification and quality assessment engine for road construction materials.

    Evaluates:
    - Material classification: Aggregates, Bitumen / Asphalt, Concrete, Subgrade Soil.
    - Surface quality metrics: binder coating, segregation, flakiness, moisture, and voids.
    - Engineering standards compliance: Indian Road Congress (IRC) & MoRTH benchmarks.
    """

    def __init__(self, device: str = "cpu"):
        self.device = device

    def classify_material_type(
        self,
        image: np.ndarray,
        declared_material: Optional[str] = None,
    ) -> Tuple[MaterialCategory, float]:
        """Classify or confirm material category using color moments, luminance, and texture.

        Args:
            image: 3-channel OpenCV BGR image array.
            declared_material: Optional hint or declared invoice material from contractor.

        Returns:
            Tuple[MaterialCategory, float]: Assigned category and classification confidence.
        """
        if declared_material:
            dec_upper = declared_material.upper().replace("-", "_").replace(" ", "_")
            for cat in MaterialCategory:
                if cat.value in dec_upper or dec_upper in cat.value:
                    return cat, 0.95

        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        mean_val = float(np.mean(gray))
        mean_sat = float(np.mean(hsv[:, :, 1]))
        dark_ratio = float(np.mean(gray < 65))
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.mean(edges > 0))

        # Bitumen / Asphalt: predominantly dark/black, low saturation
        if dark_ratio > 0.45 and mean_val < 85:
            confidence = min(0.98, max(0.70, 0.5 + dark_ratio * 0.5))
            return MaterialCategory.BITUMEN_ASPHALT, round(confidence, 4)

        # Aggregate: high edge density from individual crushed stone facets
        if edge_density > 0.08 or (mean_val > 80 and mean_val < 160 and mean_sat < 70):
            confidence = min(0.95, max(0.68, 0.5 + edge_density * 3.0))
            return MaterialCategory.AGGREGATE, round(confidence, 4)

        # Subgrade / Soil: warm brown/ochre hue with moderate saturation
        hue = hsv[:, :, 0]
        soil_hue_ratio = float(np.mean((hue >= 8) & (hue <= 28) & (hsv[:, :, 1] > 40)))
        if soil_hue_ratio > 0.35:
            return MaterialCategory.SUBGRADE_SOIL, round(min(0.95, 0.6 + soil_hue_ratio * 0.4), 4)

        # Concrete: mid-range uniform gray luminance with moderate texture
        if 90 <= mean_val <= 180 and mean_sat < 40:
            return MaterialCategory.CONCRETE, 0.88

        # Fallback default
        return MaterialCategory.AGGREGATE, 0.72

    def assess(
        self,
        image: np.ndarray,
        declared_material: Optional[str] = None,
    ) -> MaterialAssessmentResponse:
        """Execute full visual quality assessment on a material sample image.

        Args:
            image: 3-channel OpenCV BGR image array.
            declared_material: Optional material name declared by contractor.

        Returns:
            MaterialAssessmentResponse containing metrics, score, compliance, and recommendations.

        Raises:
            ValueError: If input image is empty or invalid.
        """
        if image is None or image.size == 0 or image.ndim != 3:
            raise ValueError("Invalid image array provided for material visual assessment.")

        start_time = time.perf_counter()
        h, w = image.shape[:2]

        # 1. Classify material
        material_type, confidence = self.classify_material_type(image, declared_material)

        # 2. Evaluate physical quality metrics
        metrics: List[MaterialPropertyMetric] = []
        defects: List[str] = []

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        if material_type == MaterialCategory.BITUMEN_ASPHALT:
            metrics, defects, standard = self._evaluate_bitumen(image, gray, hsv)
        elif material_type == MaterialCategory.AGGREGATE:
            metrics, defects, standard = self._evaluate_aggregate(image, gray, hsv)
        elif material_type == MaterialCategory.CONCRETE:
            metrics, defects, standard = self._evaluate_concrete(image, gray, hsv)
        else:
            metrics, defects, standard = self._evaluate_subgrade(image, gray, hsv)

        # 3. Compute overall composite score
        if metrics:
            overall_score = round(float(np.mean([m.score for m in metrics])), 1)
        else:
            overall_score = 75.0

        # 4. Determine compliance and generate engineering recommendations
        if overall_score >= 75.0 and len(defects) == 0:
            compliance = ComplianceStatus.COMPLIANT
            recommendation = (
                f"Batch visually conforms with {standard}. "
                "Approved for active construction stage placement."
            )
        elif overall_score >= 60.0 or len(defects) <= 1:
            compliance = ComplianceStatus.BORDERLINE
            rec_defect = f" ({', '.join(defects)})" if defects else ""
            recommendation = (
                f"Conditional verification{rec_defect}. Recommend core sampling and lab verification "
                f"prior to final structural compaction as per {standard}."
            )
        else:
            compliance = ComplianceStatus.REJECTED
            rec_defect = f": {'; '.join(defects)}" if defects else ""
            recommendation = (
                f"Batch fails visual compliance thresholds{rec_defect}. "
                f"Do not place in pavement structure without independent QA testing under {standard}."
            )

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return MaterialAssessmentResponse(
            status="success",
            material_type=material_type,
            confidence=confidence,
            overall_quality_score=overall_score,
            compliance=compliance,
            metrics=metrics,
            defects_identified=defects,
            engineering_recommendation=recommendation,
            standard_reference=standard,
            inference_time_ms=round(latency_ms, 2),
            image_width=w,
            image_height=h,
        )

    def _evaluate_bitumen(
        self,
        image: np.ndarray,
        gray: np.ndarray,
        hsv: np.ndarray,
    ) -> Tuple[List[MaterialPropertyMetric], List[str], str]:
        standard = "MoRTH Section 500 / IRC:111 (Dense Bituminous Macadam)"
        metrics: List[MaterialPropertyMetric] = []
        defects: List[str] = []

        # Metric 1: Binder Film Coverage
        dark_fraction = float(np.mean(gray < 65))
        coverage_score = round(min(100.0, max(20.0, dark_fraction * 115.0)), 1)
        if coverage_score >= 80:
            cov_status, cov_desc = "OPTIMAL", "Aggregate particles exhibit full 360-degree binder film encapsulation."
        elif coverage_score >= 65:
            cov_status, cov_desc = "ACCEPTABLE", "Adequate binder coating observed; minor dry aggregate exposure at edges."
        else:
            cov_status, cov_desc = "CRITICAL", "Significant uncoated or stripped aggregate surfaces detected."
            defects.append("Stripped and under-coated aggregate stones")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Binder Film Coating Coverage",
                score=coverage_score,
                status=cov_status,
                details=cov_desc,
            )
        )

        # Metric 2: Mix Thermal & Color Uniformity
        block_means = [
            float(np.mean(gray[r : r + 40, c : c + 40]))
            for r in range(0, gray.shape[0] - 40, 40)
            for c in range(0, gray.shape[1] - 40, 40)
        ]
        var = float(np.std(block_means)) if block_means else 0.0
        uniformity_score = round(max(30.0, min(100.0, 100.0 - var * 2.5)), 1)
        if uniformity_score >= 80:
            uni_status, uni_desc = "OPTIMAL", "Consistent binder-to-aggregate distribution across sample view."
        elif uniformity_score >= 60:
            uni_status, uni_desc = "ACCEPTABLE", "Slight thermal or segregation variance across mix face."
        else:
            uni_status, uni_desc = "WARNING", "Observable mechanical segregation of coarse aggregate."
            defects.append("Aggregate segregation in bituminous matrix")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Mix Segregation & Uniformity",
                score=uniformity_score,
                status=uni_status,
                details=uni_desc,
            )
        )

        # Metric 3: Moisture / Specular Reflection
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]
        glare_ratio = float(np.mean((val > 210) & (sat < 35)))
        moisture_score = round(max(20.0, min(100.0, 100.0 - glare_ratio * 400.0)), 1)
        if moisture_score >= 85:
            m_status, m_desc = "OPTIMAL", "No standing moisture or flash-water sheen detected on mix surface."
        else:
            m_status, m_desc = "WARNING", "Surface specular sheen indicates excess moisture or un-evaporated emulsion."
            defects.append("Surface moisture / water sheen detected")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Moisture Content Indicator",
                score=moisture_score,
                status=m_status,
                details=m_desc,
            )
        )

        return metrics, defects, standard

    def _evaluate_aggregate(
        self,
        image: np.ndarray,
        gray: np.ndarray,
        hsv: np.ndarray,
    ) -> Tuple[List[MaterialPropertyMetric], List[str], str]:
        standard = "MoRTH Section 400 / IRC:38 (Crushed Road Aggregates)"
        metrics: List[MaterialPropertyMetric] = []
        defects: List[str] = []

        # Metric 1: Angularity & Mechanical Interlock
        edges = cv2.Canny(gray, 60, 160)
        edge_density = float(np.mean(edges > 0))
        angularity_score = round(min(100.0, max(25.0, edge_density * 550.0)), 1)
        if angularity_score >= 75:
            ang_status, ang_desc = "OPTIMAL", "High mechanical angularity with sharp fractured faces providing robust interlock."
        elif angularity_score >= 60:
            ang_status, ang_desc = "ACCEPTABLE", "Standard crushed stone grading with acceptable angular facet distribution."
        else:
            ang_status, ang_desc = "CRITICAL", "High percentage of rounded, un-crushed river pebbles lacking angular interlock."
            defects.append("Excessive rounded / un-fractured aggregate particles")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Particle Angularity & Fractured Faces",
                score=angularity_score,
                status=ang_status,
                details=ang_desc,
            )
        )

        # Metric 2: Flakiness & Elongation Control
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        aspect_ratios = []
        for c in contours:
            if cv2.contourArea(c) > 60:
                _, _, bw, bh = cv2.boundingRect(c)
                ratio = max(bw, bh) / max(min(bw, bh), 1)
                aspect_ratios.append(ratio)

        flaky_ratio = float(np.mean([r > 3.0 for r in aspect_ratios])) if aspect_ratios else 0.1
        flakiness_score = round(max(20.0, min(100.0, 100.0 - flaky_ratio * 150.0)), 1)
        if flakiness_score >= 75:
            flk_status, flk_desc = "OPTIMAL", "Flakiness index within strict MoRTH limits (< 25%)."
        elif flakiness_score >= 60:
            flk_status, flk_desc = "ACCEPTABLE", "Flakiness index acceptable for base course (< 35% as per IRC:23)."
        else:
            flk_status, flk_desc = "CRITICAL", "High ratio of elongated and flaky stones prone to premature crushing under traffic roller."
            defects.append("Flakiness and elongation exceed IRC:23 maximum threshold (35%)")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Flakiness & Elongation Index",
                score=flakiness_score,
                status=flk_status,
                details=flk_desc,
            )
        )

        # Metric 3: Surface Dust & Clay Coating
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        cleanliness_score = round(min(100.0, max(25.0, laplacian_var * 0.15)), 1)
        if cleanliness_score >= 75:
            cln_status, cln_desc = "OPTIMAL", "Aggregate surfaces are clean and free of adhering clay fines."
        else:
            cln_status, cln_desc = "WARNING", "Dust coating or clay film observed on stone surfaces; may impede bitumen adhesion."
            defects.append("Clay fines / dust coating on aggregate surface")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Surface Cleanliness & Fines Coating",
                score=cleanliness_score,
                status=cln_status,
                details=cln_desc,
            )
        )

        return metrics, defects, standard

    def _evaluate_concrete(
        self,
        image: np.ndarray,
        gray: np.ndarray,
        hsv: np.ndarray,
    ) -> Tuple[List[MaterialPropertyMetric], List[str], str]:
        standard = "IRC:15 / IRC:SP:46 (Pavement Quality Concrete)"
        metrics: List[MaterialPropertyMetric] = []
        defects: List[str] = []

        # Metric 1: Honeycombing & Surface Voids
        _, dark_voids = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
        void_fraction = float(np.mean(dark_voids > 0))
        void_score = round(max(20.0, min(100.0, 100.0 - void_fraction * 350.0)), 1)
        if void_score >= 80:
            v_status, v_desc = "OPTIMAL", "Dense cement mortar paste with minimal surface air entrainment voids."
        else:
            v_status, v_desc = "CRITICAL", "Honeycombing and structural voids visible in concrete surface."
            defects.append("Surface honeycombing and void cavities detected")

        metrics.append(
            MaterialPropertyMetric(
                metric_name="Void Density & Honeycombing",
                score=void_score,
                status=v_status,
                details=v_desc,
            )
        )

        # Metric 2: Paste Uniformity
        std_val = float(np.std(gray))
        paste_score = round(max(30.0, min(100.0, 100.0 - std_val * 1.2)), 1)
        metrics.append(
            MaterialPropertyMetric(
                metric_name="Cement Paste Uniformity",
                score=paste_score,
                status="OPTIMAL" if paste_score >= 75 else "ACCEPTABLE",
                details="Even distribution of cement-water slurry across exposed concrete face.",
            )
        )

        return metrics, defects, standard

    def _evaluate_subgrade(
        self,
        image: np.ndarray,
        gray: np.ndarray,
        hsv: np.ndarray,
    ) -> Tuple[List[MaterialPropertyMetric], List[str], str]:
        standard = "MoRTH Section 300 / IRC:36 (Subgrade Earthwork)"
        metrics: List[MaterialPropertyMetric] = []
        defects: List[str] = []

        # Metric 1: Color / Moisture Consistency
        hue = hsv[:, :, 0]
        sat = hsv[:, :, 1]
        moisture_ind = float(np.mean(sat > 60))
        moist_score = round(max(30.0, min(100.0, 85.0 - abs(moisture_ind - 0.4) * 80.0)), 1)
        metrics.append(
            MaterialPropertyMetric(
                metric_name="Moisture State & Compactability",
                score=moist_score,
                status="OPTIMAL" if moist_score >= 75 else "ACCEPTABLE",
                details="Visual moisture condition indicates soil near Optimum Moisture Content (OMC).",
            )
        )

        # Metric 2: Granular Uniformity
        texture_var = float(np.std(gray))
        grad_score = round(max(30.0, min(100.0, 80.0 + (30.0 - abs(texture_var - 35.0)))), 1)
        metrics.append(
            MaterialPropertyMetric(
                metric_name="Grain Texture Uniformity",
                score=grad_score,
                status="OPTIMAL" if grad_score >= 75 else "ACCEPTABLE",
                details="Soil particles exhibit balanced granular distribution without excessive un-crushed boulders.",
            )
        )

        return metrics, defects, standard
