# RoadLife AI — Machine Learning Microservice

Computer vision microservice for automated road distress detection (potholes, alligator cracking, transverse/longitudinal cracks) and construction material verification.

---

## Architecture Overview

* **Framework**: FastAPI (asynchronous REST microservice)
* **Computer Vision Engine**: Ultralytics YOLOv8 object detection
* **Deep Learning Runtime**: PyTorch 2.1.1 with CUDA 12.1 acceleration (NVIDIA RTX 4050 6GB)
* **Image Processing**: OpenCV Headless & Pillow

---

## Directory Structure

```text
ml-service/
├── app/
│   ├── config.py                  # Service configuration & device resolution
│   ├── main.py                    # FastAPI application & route endpoints
│   ├── inference/
│   │   ├── damage_inference.py    # YOLOv8 DamageDetector with severity heuristics
│   │   └── material_inference.py  # Material verification pipeline stub
│   ├── models/
│   │   └── road_damage/weights/   # Target directory for best.pt weights
│   ├── preprocessing/
│   │   ├── image_preprocessing.py # Safe OpenCV binary image decoding
│   │   └── validation.py          # Input validation helpers
│   └── schemas/
│       ├── damage.py              # Pydantic v2 bounding box & detection contracts
│       └── material.py            # Material assessment schemas
├── datasets/
│   └── road_damage/               # YOLO dataset storage (git-ignored)
├── training/
│   └── road_damage/
│       └── train.py               # Ultralytics YOLOv8 training CLI
└── tests/
    ├── conftest.py                # Pytest path and warning configuration
    └── test_inference.py          # Comprehensive test suite (decoding, schemas, API)
```

---

## API Endpoints

### 1. `GET /` — Root Status & Readiness
Returns high-level health information and model readiness.
```json
{
  "service": "RoadLife AI - ML Microservice",
  "status": "ready",
  "model_ready": true,
  "device": "cuda:0"
}
```
*(Returns `"status": "degraded"` and `"model_ready": false` if model weights are not deployed).*

### 2. `GET /health` — Detailed Health Check
Returns full operational details including confidence threshold, IoU threshold, and relative model path.

### 3. `POST /predict/damage` — Road Damage Detection
Accepts an image via multipart form upload (`file` or direct binary body) and returns detected damage bounding boxes, category names, confidence scores, and heuristic severity.

**Sample Response**:
```json
{
  "status": "success",
  "model_name": "best.pt",
  "device_used": "cuda:0",
  "inference_time_ms": 14.8,
  "image_width": 1920,
  "image_height": 1080,
  "total_detections": 2,
  "detections": [
    {
      "class_id": 0,
      "class_name": "pothole",
      "confidence": 0.915,
      "bbox": {
        "x_min": 450.0,
        "y_min": 620.0,
        "x_max": 680.0,
        "y_max": 810.0,
        "width": 230.0,
        "height": 190.0,
        "x_min_norm": 0.2344,
        "y_min_norm": 0.5741,
        "x_max_norm": 0.3542,
        "y_max_norm": 0.7500
      },
      "severity": "HIGH"
    }
  ]
}
```

**Status Codes**:
* `200 OK`: Successful detection.
* `400 Bad Request`: Empty, corrupted, or invalid image.
* `413 Payload Too Large`: Upload exceeds maximum size (default 10 MB).
* `503 Service Unavailable`: Model weights not deployed on disk.

---

## Training Pipeline

The training pipeline supports training on custom road damage datasets (e.g., RDD2020, RDD2022) with automatic CUDA detection and conservative defaults for 6GB VRAM GPUs.

```powershell
.\ml-service\.venv\Scripts\python.exe ml-service/training/road_damage/train.py `
    --data ml-service/datasets/road_damage/data.yaml `
    --model yolov8n.pt `
    --epochs 50 `
    --batch 16 `
    --imgsz 640 `
    --device 0
```

---

## Running Unit Tests

Run the test suite using the isolated Python 3.10 virtual environment:
```powershell
.\ml-service\.venv\Scripts\python.exe -m pytest ml-service/tests -v
```
