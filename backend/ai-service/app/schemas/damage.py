from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class DamageSeverity(str, Enum):
    """Estimated severity level for identified road damage.

    Estimated using a documented heuristic combining the specific distress
    classification (e.g., potholes indicate direct safety/structural risk) and
    the defect's relative footprint area within the roadway view.
    """
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class BoundingBox(BaseModel):
    """Bounding box pixel and normalized coordinates.

    Coordinates follow standard computer vision conventions:
    (x_min, y_min) is the top-left corner, and (x_max, y_max) is the bottom-right corner.
    """
    x_min: float = Field(..., ge=0.0, description="Top-left X coordinate in pixels")
    y_min: float = Field(..., ge=0.0, description="Top-left Y coordinate in pixels")
    x_max: float = Field(..., ge=0.0, description="Bottom-right X coordinate in pixels")
    y_max: float = Field(..., ge=0.0, description="Bottom-right Y coordinate in pixels")
    width: float = Field(..., ge=0.0, description="Box width in pixels")
    height: float = Field(..., ge=0.0, description="Box height in pixels")
    x_min_norm: Optional[float] = Field(None, ge=0.0, le=1.0, description="Normalized x_min (0.0 to 1.0)")
    y_min_norm: Optional[float] = Field(None, ge=0.0, le=1.0, description="Normalized y_min (0.0 to 1.0)")
    x_max_norm: Optional[float] = Field(None, ge=0.0, le=1.0, description="Normalized x_max (0.0 to 1.0)")
    y_max_norm: Optional[float] = Field(None, ge=0.0, le=1.0, description="Normalized y_max (0.0 to 1.0)")

    @model_validator(mode="after")
    def validate_coordinates(self) -> "BoundingBox":
        if self.x_max < self.x_min:
            raise ValueError(f"x_max ({self.x_max}) must be greater than or equal to x_min ({self.x_min})")
        if self.y_max < self.y_min:
            raise ValueError(f"y_max ({self.y_max}) must be greater than or equal to y_min ({self.y_min})")
        return self


class DamageDetection(BaseModel):
    """Individual road damage detection result."""
    class_id: int = Field(..., ge=0, description="Zero-indexed model class identifier")
    class_name: str = Field(..., min_length=1, description="Human-readable damage category name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score (0.0 to 1.0)")
    bbox: BoundingBox = Field(..., description="Bounding box containing the detected defect")
    severity: Optional[DamageSeverity] = Field(
        None,
        description="Responsible heuristic estimate (LOW, MEDIUM, HIGH, CRITICAL) based on defect category and footprint."
    )


class SmartRepairPlan(BaseModel):
    """Automated repair plan and cost engineering estimate."""
    pavement_condition_index: int = Field(..., ge=0, le=100, description="Pavement Condition Index (PCI) score (0-100)")
    priority_level: str = Field(..., description="Maintenance urgency: 'IMMEDIATE', 'SCHEDULED', or 'MONITORING'")
    recommended_action: str = Field(..., description="Actionable road maintenance procedure")
    recommended_material: str = Field(..., description="Recommended material specification conforming to IRC standards")
    estimated_cost_inr: int = Field(..., ge=0, description="Estimated total repair expenditure in Indian Rupees (INR)")
    estimated_labor_hours: float = Field(..., ge=0.0, description="Estimated labor and equipment hours required")
    estimated_material_quantity_kg: float = Field(..., ge=0.0, description="Estimated material requirement in kilograms")


class DamageInferenceResponse(BaseModel):
    """Full inference response returned by the damage prediction endpoint."""
    model_config = {"protected_namespaces": ()}

    status: str = Field("success", description="Response status: 'success', 'unavailable', or 'error'")
    model_name: Optional[str] = Field(None, description="Filename or identifier of the active model")
    device_used: str = Field(..., description="Compute device utilized for inference (e.g., 'cuda:0', 'cpu')")
    inference_time_ms: float = Field(..., ge=0.0, description="Pure model forward pass latency in milliseconds")
    image_width: int = Field(..., gt=0, description="Input image width in pixels")
    image_height: int = Field(..., gt=0, description="Input image height in pixels")
    total_detections: int = Field(..., ge=0, description="Number of damage objects detected")
    detections: List[DamageDetection] = Field(default_factory=list, description="Array of detected damage objects")
    repair_plan: Optional[SmartRepairPlan] = Field(
        None,
        description="Automated smart repair and cost estimation recommendation generated from defect inventory."
    )


class ModelStatusResponse(BaseModel):
    """Health and model readiness status response."""
    model_config = {"protected_namespaces": ()}

    service: str = Field("ML Service", description="Service identifier")
    status: str = Field(..., description="'ready' when model is loaded, 'degraded' when model weights missing")
    model_ready: bool = Field(..., description="Whether trained model weights are currently loaded and ready")
    model_path: Optional[str] = Field(None, description="Configured relative model file location")
    device: str = Field(..., description="Configured compute device")
    confidence_threshold: float = Field(..., ge=0.0, le=1.0)
    iou_threshold: float = Field(..., ge=0.0, le=1.0)


# Backward compatibility alias
DamageSchema = DamageInferenceResponse
