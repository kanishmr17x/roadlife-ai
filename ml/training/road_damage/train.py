import argparse
import logging
import os
from pathlib import Path
import shutil
import sys
from typing import Any, Dict
import yaml

# Resolve ml-service base directory
ML_SERVICE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ML_SERVICE_DIR))

from app.config import get_default_device

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("road_damage_train")


def validate_dataset_yaml(yaml_path: Path) -> Dict[str, Any]:
    """Validate that the dataset YAML exists and contains necessary YOLO dataset keys.

    Args:
        yaml_path: Path to dataset YAML configuration.

    Returns:
        Dict[str, Any]: Parsed YAML content.

    Raises:
        FileNotFoundError: If the YAML file does not exist.
        ValueError: If YAML is missing required YOLO fields ('names', 'nc', 'train', 'val').
    """
    if not yaml_path.is_file():
        raise FileNotFoundError(f"Dataset configuration YAML not found at: {yaml_path}")

    with open(yaml_path, "r", encoding="utf-8") as f:
        data_cfg = yaml.safe_load(f)

    if not isinstance(data_cfg, dict):
        raise ValueError(f"Invalid YAML structure in: {yaml_path}. Expected dictionary.")

    required_keys = ["train", "val", "names"]
    missing = [k for k in required_keys if k not in data_cfg]
    if missing:
        raise ValueError(
            f"Dataset YAML '{yaml_path.name}' is missing required keys: {missing}. "
            "YOLO dataset config must specify 'train', 'val', and 'names'."
        )

    return data_cfg


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for road damage YOLO model training."""
    parser = argparse.ArgumentParser(
        description="RoadSense / RoadLife AI — Road Damage YOLOv8 Training Pipeline",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    default_yaml = ML_SERVICE_DIR / "datasets" / "road_damage" / "data.yaml"
    default_project = ML_SERVICE_DIR / "runs" / "road_damage"
    default_dest = (
        ML_SERVICE_DIR / "app" / "models" / "road_damage" / "weights" / "best.pt"
    )

    parser.add_argument(
        "--data",
        type=str,
        default=str(default_yaml),
        help="Path to dataset configuration data.yaml file.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolov8n.pt",
        help="Base pretrained YOLO model or checkpoint to fine-tune from.",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Total training epochs.",
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size (conservative 16 suitable for 6GB RTX 4050 VRAM).",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Input image resolution in pixels.",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=get_default_device(),
        help="Compute device ('0', 'cuda:0', or 'cpu').",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=2,
        help="DataLoader worker processes (safe default for Windows).",
    )
    parser.add_argument(
        "--project",
        type=str,
        default=str(default_project),
        help="Project directory where training artifacts and checkpoints are saved.",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="train",
        help="Run identifier directory name.",
    )
    parser.add_argument(
        "--weights-dest",
        type=str,
        default=str(default_dest),
        help="Target location to place the resulting best.pt model weights.",
    )
    parser.add_argument(
        "--overwrite-weights",
        action="store_true",
        help="Permit overwriting an existing weights file at weights-dest if present.",
    )

    return parser.parse_args()


def train_road_damage_model(args: argparse.Namespace) -> Path:
    """Execute YOLOv8 training and safely preserve the best checkpoint.

    Args:
        args: Parsed command-line arguments.

    Returns:
        Path: Final saved best checkpoint file path.
    """
    yaml_path = Path(args.data).resolve()
    dest_path = Path(args.weights_dest).resolve()
    project_dir = Path(args.project).resolve()

    logger.info("Validating dataset configuration: %s", yaml_path)
    validate_dataset_yaml(yaml_path)

    # Delay import of YOLO until after parameter validation
    from ultralytics import YOLO

    logger.info("Initializing base YOLO model: %s", args.model)
    model = YOLO(args.model)

    # Safety check: Prevent overwriting existing model weights unless explicitly requested
    if dest_path.exists() and not args.overwrite_weights:
        logger.warning(
            "Existing weights found at destination '%s'. Overwriting is prohibited unless --overwrite-weights is passed.",
            dest_path,
        )

    logger.info("Starting YOLOv8 training on device: %s", args.device)
    logger.info(
        "Parameters: epochs=%d, batch=%d, imgsz=%d, workers=%d",
        args.epochs,
        args.batch,
        args.imgsz,
        args.workers,
    )

    results = model.train(
        data=str(yaml_path),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=args.device,
        workers=args.workers,
        project=str(project_dir),
        name=args.name,
        save=True,
        exist_ok=False,
    )

    # Locate generated best checkpoint
    save_dir = Path(results.save_dir)
    trained_best = save_dir / "weights" / "best.pt"

    if not trained_best.is_file():
        raise FileNotFoundError(
            f"Expected trained weights file not found at: {trained_best}"
        )

    logger.info("Training complete. Best checkpoint saved at: %s", trained_best)

    # Copy to target destination with safety checks
    final_dest = dest_path
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    if dest_path.exists() and not args.overwrite_weights:
        timestamp = Path(save_dir).name
        final_dest = dest_path.parent / f"best_{timestamp}.pt"
        logger.warning(
            "Existing weights preserved. Saving new weights to alternative path: %s",
            final_dest,
        )

    shutil.copy2(str(trained_best), str(final_dest))
    logger.info("Successfully deployed best model weights to: %s", final_dest)

    return final_dest


def main() -> None:
    args = parse_args()
    try:
        train_road_damage_model(args)
    except Exception as exc:
        logger.error("Training pipeline aborted: %s", exc)
        sys.exit(1)


if __name__ == "__main__":
    main()
