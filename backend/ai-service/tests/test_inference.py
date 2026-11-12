import io
from pathlib import Path
import sys
from unittest.mock import MagicMock

# Ensure ml-service root directory is in sys.path
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(ML_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(ML_SERVICE_DIR))

import cv2
import numpy as np
import pytest
import torch
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.datastructures import Headers
from starlette.requests import Request

from app.config import MLConfig
from app.inference.damage_inference import (
    DamageDetector,
    ModelNotReadyError,
    estimate_damage_severity,
)
from app.main import app, detailed_health, detect_damage, health
from app.preprocessing.image_preprocessing import decode_image_bytes
from app.schemas.damage import (
    BoundingBox,
    DamageDetection,
    DamageInferenceResponse,
    DamageSeverity,
    ModelStatusResponse,
)


# ============================================================================
# 1. Image Preprocessing & Decoding Tests
# ============================================================================

def test_decode_valid_image_bytes():
    """Verify standard valid BGR image decodes correctly."""
    dummy = np.full((120, 160, 3), 128, dtype=np.uint8)
    success, encoded = cv2.imencode(".jpg", dummy)
    assert success, "Failed to create dummy JPEG test bytes"

    decoded = decode_image_bytes(encoded.tobytes())
    assert isinstance(decoded, np.ndarray)
    assert decoded.shape == (120, 160, 3)


def test_decode_empty_bytes_raises_error():
    """Verify empty image payload raises ValueError."""
    with pytest.raises(ValueError, match="Image payload is empty"):
        decode_image_bytes(b"")


def test_decode_tiny_payload_raises_error():
    """Verify undersized payload raises ValueError."""
    with pytest.raises(ValueError, match="too small"):
        decode_image_bytes(b"short_bytes")


def test_decode_corrupted_bytes_raises_error():
    """Verify non-image bytes raise ValueError without trusting extension or headers."""
    garbage = b"X" * 128
    with pytest.raises(ValueError, match="Failed to decode image"):
        decode_image_bytes(garbage)


# ============================================================================
# 2. Pydantic Schema Validation Tests
# ============================================================================

def test_bounding_box_valid():
    """Verify BoundingBox validates coordinates and dimensions."""
    bbox = BoundingBox(
        x_min=10.0,
        y_min=20.0,
        x_max=100.0,
        y_max=150.0,
        width=90.0,
        height=130.0,
        x_min_norm=0.1,
        y_min_norm=0.2,
        x_max_norm=0.5,
        y_max_norm=0.75,
    )
    assert bbox.x_max >= bbox.x_min
    assert bbox.y_max >= bbox.y_min
    assert bbox.width == 90.0


def test_bounding_box_inverted_x_raises_validation_error():
    """Verify x_max < x_min raises ValidationError."""
    with pytest.raises(ValidationError):
        BoundingBox(
            x_min=100.0,
            y_min=20.0,
            x_max=10.0,  # Invalid: x_max < x_min
            y_max=150.0,
            width=90.0,
            height=130.0,
        )


def test_confidence_range_validation():
    """Verify confidence must reside within [0.0, 1.0]."""
    bbox = BoundingBox(x_min=0, y_min=0, x_max=10, y_max=10, width=10, height=10)

    # Valid confidence
    det = DamageDetection(class_id=0, class_name="pothole", confidence=0.75, bbox=bbox)
    assert det.confidence == 0.75

    # Out of bounds (> 1.0)
    with pytest.raises(ValidationError):
        DamageDetection(class_id=0, class_name="pothole", confidence=1.2, bbox=bbox)

    # Negative (< 0.0)
    with pytest.raises(ValidationError):
        DamageDetection(class_id=0, class_name="pothole", confidence=-0.05, bbox=bbox)


def test_severity_heuristics():
    """Verify severity estimation responsibly maps distress type and size."""
    # Small pothole
    bbox_small = BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50, width=50, height=50)
    sev_small = estimate_damage_severity("pothole", bbox_small, image_width=1000, image_height=1000)
    assert sev_small == DamageSeverity.HIGH

    # Large critical pothole (> 4% of image area)
    bbox_large = BoundingBox(x_min=0, y_min=0, x_max=300, y_max=300, width=300, height=300)
    sev_large = estimate_damage_severity("pothole", bbox_large, image_width=1000, image_height=1000)
    assert sev_large == DamageSeverity.CRITICAL

    # Minor longitudinal crack
    bbox_crack = BoundingBox(x_min=0, y_min=0, x_max=50, y_max=50, width=50, height=50)
    sev_crack = estimate_damage_severity("longitudinal_crack", bbox_crack, image_width=1000, image_height=1000)
    assert sev_crack == DamageSeverity.LOW


# ============================================================================
# 3. Model Readiness & Missing Weights Tests
# ============================================================================

def test_detector_missing_weights_status():
    """Verify detector reports degraded status and refusal to predict when weights missing."""
    cfg = MLConfig(model_path=Path("non_existent_weights.pt"))
    detector = DamageDetector(config=cfg)

    assert not detector.is_ready()
    status = detector.get_status()
    assert status.status == "degraded"
    assert status.model_ready is False

    dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
    with pytest.raises(ModelNotReadyError, match="weights are not deployed"):
        detector.predict(dummy_image)


def test_detector_mocked_inference():
    """Verify detector parses YOLO output boxes without needing actual GPU or weights."""
    mock_yolo = MagicMock()
    mock_yolo.names = {0: "pothole", 1: "alligator_crack"}

    # Mock YOLO result structure
    mock_boxes = MagicMock()
    mock_boxes.__len__.return_value = 1
    mock_boxes.xyxy = [torch.tensor([10.0, 20.0, 80.0, 90.0])]
    mock_boxes.conf = [torch.tensor([0.92])]
    mock_boxes.cls = [torch.tensor([0.0])]

    mock_result = MagicMock()
    mock_result.boxes = mock_boxes
    mock_yolo.predict.return_value = [mock_result]

    detector = DamageDetector(model_instance=mock_yolo)
    assert detector.is_ready()

    dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
    response = detector.predict(dummy_image)

    assert response.status == "success"
    assert response.total_detections == 1
    assert len(response.detections) == 1

    detection = response.detections[0]
    assert detection.class_id == 0
    assert detection.class_name == "pothole"
    assert detection.confidence == 0.92
    assert detection.bbox.x_min == 10.0
    assert detection.bbox.y_min == 20.0
    assert detection.bbox.x_max == 80.0
    assert detection.bbox.y_max == 90.0
    assert detection.bbox.width == 70.0
    assert detection.bbox.height == 70.0
    assert detection.severity == DamageSeverity.HIGH


# ============================================================================
# 4. API Endpoints & Health Check Behavior
# ============================================================================

def test_api_health():
    """Verify root health check endpoint returns expected structure."""
    result = health()
    assert "service" in result
    assert "status" in result
    assert "model_ready" in result
    assert "device" in result


def test_api_detailed_health():
    """Verify detailed health check endpoint reports configuration."""
    details = detailed_health()
    assert details["service"] == "RoadLife AI - ML Microservice"
    assert "confidence_threshold" in details
    assert "iou_threshold" in details


def _run_coro(coro):
    """Step an async coroutine synchronously without requiring OS event loop sockets."""
    try:
        while True:
            coro.send(None)
    except StopIteration as stop:
        return stop.value


def test_api_predict_damage_missing_model_returns_503():
    """Verify predict endpoint raises 503 when model weights are not loaded."""
    import app.main as main_module
    original_detector = main_module.detector

    try:
        mock_unready = MagicMock()
        mock_unready.is_ready.return_value = False
        main_module.detector = mock_unready

        scope = {
            "type": "http",
            "method": "POST",
            "path": "/predict/damage",
            "headers": [],
        }
        request = Request(scope)

        with pytest.raises(HTTPException) as exc_info:
            _run_coro(detect_damage(request))

        assert exc_info.value.status_code == 503
        assert "not deployed" in exc_info.value.detail
    finally:
        main_module.detector = original_detector


def test_api_predict_damage_with_valid_mock_inference():
    """Verify predict endpoint processes image bytes and returns DamageInferenceResponse."""
    import app.main as main_module
    original_detector = main_module.detector

    try:
        mock_detector = MagicMock()
        mock_detector.is_ready.return_value = True

        expected_response = DamageInferenceResponse(
            status="success",
            model_name="test_model.pt",
            device_used="cpu",
            inference_time_ms=15.2,
            image_width=100,
            image_height=100,
            total_detections=0,
            detections=[],
        )
        mock_detector.predict.return_value = expected_response
        main_module.detector = mock_detector

        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        _, encoded = cv2.imencode(".jpg", dummy)
        img_bytes = encoded.tobytes()

        received = False

        async def mock_receive():
            nonlocal received
            if not received:
                received = True
                return {"type": "http.request", "body": img_bytes, "more_body": False}
            return {"type": "http.request", "body": b"", "more_body": False}

        scope = {
            "type": "http",
            "method": "POST",
            "path": "/predict/damage",
            "headers": [
                (b"content-type", b"image/jpeg"),
                (b"content-length", str(len(img_bytes)).encode("latin-1")),
            ],
        }
        request = Request(scope, receive=mock_receive)

        res = _run_coro(detect_damage(request))
        assert res.status == "success"
        assert res.total_detections == 0
        assert res.image_width == 100
        assert res.image_height == 100
    finally:
        main_module.detector = original_detector


# ============================================================================
# 5. Smart Repair Planning & Computer Vision Fallback Tests
# ============================================================================

def test_smart_repair_plan_calculation():
    """Verify smart repair plan computes PCI, priority, and cost estimate."""
    from app.inference.damage_inference import generate_smart_repair_plan

    # Empty detections -> pristine pavement
    plan_clean = generate_smart_repair_plan([], 1000, 1000)
    assert plan_clean.pavement_condition_index >= 90
    assert plan_clean.priority_level == "MONITORING"
    assert plan_clean.estimated_cost_inr == 0

    # Critical pothole detection
    bbox = BoundingBox(x_min=100, y_min=100, x_max=400, y_max=400, width=300, height=300)
    det = DamageDetection(
        class_id=0,
        class_name="pothole",
        confidence=0.91,
        bbox=bbox,
        severity=DamageSeverity.CRITICAL,
    )
    plan_urgent = generate_smart_repair_plan([det], 1000, 1000)
    assert plan_urgent.priority_level == "IMMEDIATE"
    assert plan_urgent.pavement_condition_index < 80
    assert plan_urgent.estimated_cost_inr > 5000
    assert "Square-cut" in plan_urgent.recommended_action


def test_cv_damage_fallback_inference():
    """Verify detector with allow_fallback=True analyzes pavement image using CV."""
    detector = DamageDetector(config=MLConfig(model_path=Path("absent.pt")))
    assert not detector.is_ready()

    # Create synthetic pavement image with simulated dark pothole
    np.random.seed(42)
    road = np.full((300, 400, 3), 120, dtype=np.uint8)
    cv2.ellipse(road, (200, 150), (35, 25), 0, 0, 360, (30, 28, 25), -1)

    result = detector.predict(road, allow_fallback=True)
    assert result.status == "success"
    assert result.model_name == "cv_pavement_analyzer"
    assert result.repair_plan is not None
    assert result.image_width == 400
    assert result.image_height == 300


# ============================================================================
# 6. Material Quality Visual Assessment Tests
# ============================================================================

def test_material_assessor_classification_and_evaluation():
    """Verify material quality assessor analyzes bitumen and aggregate samples."""
    from app.inference.material_inference import MaterialAssessor
    from app.schemas.material import MaterialCategory

    assessor = MaterialAssessor()

    # 1. Dark bitumen sample
    bitumen_img = np.full((200, 200, 3), 35, dtype=np.uint8)
    res_bitumen = assessor.assess(bitumen_img, declared_material="BITUMEN_ASPHALT")
    assert res_bitumen.material_type == MaterialCategory.BITUMEN_ASPHALT
    assert res_bitumen.overall_quality_score >= 60.0
    assert len(res_bitumen.metrics) >= 2
    assert "MoRTH" in res_bitumen.standard_reference

    # 2. Crushed stone aggregate sample with high edge density
    agg_img = np.random.choice([60, 120, 180, 220], size=(200, 200, 3)).astype(np.uint8)
    res_agg = assessor.assess(agg_img, declared_material="AGGREGATE")
    assert res_agg.material_type == MaterialCategory.AGGREGATE
    assert len(res_agg.metrics) >= 2
    assert "IRC:38" in res_agg.standard_reference


def test_api_material_assessment_endpoint():
    """Verify /predict/material endpoint returns valid MaterialAssessmentResponse."""
    from app.main import assess_material

    dummy = np.full((150, 150, 3), 40, dtype=np.uint8)
    _, encoded = cv2.imencode(".jpg", dummy)
    img_bytes = encoded.tobytes()

    received = False

    async def mock_receive():
        nonlocal received
        if not received:
            received = True
            return {"type": "http.request", "body": img_bytes, "more_body": False}
        return {"type": "http.request", "body": b"", "more_body": False}

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/predict/material",
        "query_string": b"material=BITUMEN_ASPHALT",
        "headers": [
            (b"content-type", b"image/jpeg"),
            (b"content-length", str(len(img_bytes)).encode("latin-1")),
        ],
    }
    request = Request(scope, receive=mock_receive)

    res = _run_coro(assess_material(request))
    assert res.status == "success"
    assert res.overall_quality_score > 0
    assert res.standard_reference != ""

