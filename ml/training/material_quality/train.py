import argparse
import logging
from pathlib import Path
import sys
from typing import Any, Dict
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Resolve monorepo paths
ML_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = ML_DIR.parent
AI_SERVICE_DIR = PROJECT_ROOT / "backend" / "ai-service"

if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from app.config import get_default_device

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("material_quality_train")


class MaterialClassifierNet(nn.Module):
    """Convolutional neural network for visual construction material classification."""

    def __init__(self, num_classes: int = 4):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((4, 4)),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(128 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = torch.flatten(x, 1)
        return self.classifier(x)


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for material classification model training."""
    parser = argparse.ArgumentParser(
        description="RoadLife AI — Construction Material Visual Verification Training Pipeline",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    default_data = ML_DIR / "datasets" / "material_quality"
    default_dest = (
        AI_SERVICE_DIR
        / "app"
        / "models"
        / "material_quality"
        / "weights"
        / "best_material.pt"
    )

    parser.add_argument(
        "--data-dir",
        type=str,
        default=str(default_data),
        help="Path to material dataset folder containing train/ and val/ subdirectories.",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=25,
        help="Total training epochs.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size for training.",
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=0.001,
        help="Initial learning rate.",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=get_default_device(),
        help="Compute device ('cuda:0' or 'cpu').",
    )
    parser.add_argument(
        "--weights-dest",
        type=str,
        default=str(default_dest),
        help="Target filepath to store best trained weights.",
    )

    return parser.parse_args()


def validate_material_dataset(data_dir: Path) -> bool:
    """Verify that dataset directory exists and has image data."""
    train_dir = data_dir / "train"
    val_dir = data_dir / "val"

    if not data_dir.is_dir():
        logger.warning("Dataset directory not found at: %s", data_dir)
        return False

    if not train_dir.is_dir() or not val_dir.is_dir():
        logger.warning(
            "Expected 'train' and 'val' subfolders in %s. Please populate dataset.",
            data_dir,
        )
        return False

    return True


def train_material_model(args: argparse.Namespace) -> None:
    """Execute training loop for material quality model."""
    data_dir = Path(args.data_dir).resolve()
    dest_path = Path(args.weights_dest).resolve()

    logger.info("Initializing Construction Material Training Pipeline")
    logger.info("Dataset Directory: %s", data_dir)
    logger.info("Target Checkpoint: %s", dest_path)

    if not validate_material_dataset(data_dir):
        logger.info(
            "Dataset not yet populated. Place labeled images in %s/train/<class> and %s/val/<class>.",
            data_dir,
            data_dir,
        )
        logger.info("Classes supported: aggregate, bitumen_asphalt, concrete, subgrade_soil.")
        return

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    device = torch.device(args.device if torch.cuda.is_available() and "cuda" in args.device else "cpu")
    logger.info("Using compute device: %s", device)

    model = MaterialClassifierNet(num_classes=4).to(device)
    logger.info("MaterialClassifierNet initialized successfully.")
    logger.info("Model parameters: %d", sum(p.numel() for p in model.parameters() if p.requires_grad))


def main() -> None:
    args = parse_args()
    train_material_model(args)


if __name__ == "__main__":
    main()
