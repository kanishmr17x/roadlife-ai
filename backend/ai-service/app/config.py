import os
from pathlib import Path
from typing import Optional
import torch

# Base directory for the ml-service (relative to this file, not CWD)
BASE_DIR: Path = Path(__file__).resolve().parent.parent


def get_default_device() -> str:
    """Select CUDA if available, otherwise fall back to CPU."""
    configured = os.getenv("ML_DEVICE")
    if configured:
        return configured
    if torch.cuda.is_available():
        return "cuda:0"
    return "cpu"


class MLConfig:
    """Configuration for RoadLife AI ML microservice."""

    def __init__(
        self,
        model_path: Optional[Path] = None,
        confidence_threshold: Optional[float] = None,
        iou_threshold: Optional[float] = None,
        image_size: Optional[int] = None,
        device: Optional[str] = None,
        max_upload_size_bytes: Optional[int] = None,
    ):
        # Resolve model path relative to ml-service root
        env_model_path = os.getenv("ROAD_DAMAGE_MODEL_PATH")
        if model_path is not None:
            self.model_path = Path(model_path).resolve()
        elif env_model_path:
            self.model_path = Path(env_model_path).resolve()
        else:
            self.model_path = (
                BASE_DIR / "app" / "models" / "road_damage" / "weights" / "best.pt"
            ).resolve()

        # Thresholds & parameters
        self.confidence_threshold: float = (
            confidence_threshold
            if confidence_threshold is not None
            else float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
        )
        self.iou_threshold: float = (
            iou_threshold
            if iou_threshold is not None
            else float(os.getenv("IOU_THRESHOLD", "0.45"))
        )
        self.image_size: int = (
            image_size
            if image_size is not None
            else int(os.getenv("IMAGE_SIZE", "640"))
        )

        # Device selection with CUDA priority and CPU fallback
        self.device: str = device or get_default_device()

        # Upload limits
        self.max_upload_size_bytes: int = (
            max_upload_size_bytes
            if max_upload_size_bytes is not None
            else int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))
        )

        # Service meta
        self.service_name: str = os.getenv(
            "SERVICE_NAME", "RoadLife AI - ML Microservice"
        )
        self.port: int = int(os.getenv("PORT", "8001"))

    @property
    def model_exists(self) -> bool:
        """Check if the configured model weights file exists on disk."""
        return self.model_path.is_file()


# Singleton default configuration
settings = MLConfig()
