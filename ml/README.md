# RoadLife AI — Machine Learning Research & Training

## Overview

This directory hosts machine learning model training pipelines, dataset manifests, notebooks, and model experiment artifacts for RoadLife AI.

## Directory Structure

```text
ml/
├── datasets/                   # Road damage and material quality datasets & manifests
│   ├── road_damage/            # YOLO dataset storage
│   └── material_quality/       # Material verification dataset storage
├── training/                   # Model training pipelines & scripts
│   ├── road_damage/train.py    # Ultralytics YOLOv8 training CLI
│   └── material_quality/       # Material quality training pipeline
├── notebooks/                  # Jupyter exploratory notebooks
├── configs/                    # Training hyperparameters & data.yaml configs
└── models/                     # Checkpoints and weights (best.pt)
```

## Running Model Training

To train the road damage YOLOv8 model:
```bash
python training/road_damage/train.py --data datasets/road_damage/data.yaml --epochs 50 --batch 16
```
Trained model checkpoints are placed in `backend/ai-service/app/models/road_damage/weights/best.pt`.
