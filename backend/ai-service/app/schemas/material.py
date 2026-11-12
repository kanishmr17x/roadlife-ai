from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MaterialCategory(str, Enum):
    """Classified construction material category."""
    AGGREGATE = "AGGREGATE"
    BITUMEN_ASPHALT = "BITUMEN_ASPHALT"
    CONCRETE = "CONCRETE"
    SUBGRADE_SOIL = "SUBGRADE_SOIL"
    UNKNOWN = "UNKNOWN"


class ComplianceStatus(str, Enum):
    """Regulatory and structural compliance status."""
    COMPLIANT = "COMPLIANT"
    BORDERLINE = "BORDERLINE"
    REJECTED = "REJECTED"


class MaterialPropertyMetric(BaseModel):
    """Individual visual metric evaluated for material quality verification."""
    metric_name: str = Field(..., description="Name of the physical/visual metric (e.g., 'Binder Coating Uniformity')")
    score: float = Field(..., ge=0.0, le=100.0, description="Evaluated score from 0.0 to 100.0")
    status: str = Field(..., description="Rating: 'OPTIMAL', 'ACCEPTABLE', 'WARNING', or 'CRITICAL'")
    details: str = Field(..., description="Detailed engineering observation")


class MaterialAssessmentResponse(BaseModel):
    """Full visual assessment response for construction material verification."""
    model_config = {"protected_namespaces": ()}

    status: str = Field("success", description="Inference status: 'success' or 'error'")
    material_type: MaterialCategory = Field(..., description="Identified or validated construction material")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Classification confidence (0.0 to 1.0)")
    overall_quality_score: float = Field(..., ge=0.0, le=100.0, description="Composite visual quality index (0-100)")
    compliance: ComplianceStatus = Field(..., description="Pass/fail compliance against standard road specifications")
    metrics: List[MaterialPropertyMetric] = Field(default_factory=list, description="Granular quality metrics")
    defects_identified: List[str] = Field(default_factory=list, description="List of observed defects or irregularities")
    engineering_recommendation: str = Field(..., description="Actionable recommendation for project inspectors")
    standard_reference: str = Field(..., description="Relevant IRC / MoRTH specification reference")
    inference_time_ms: float = Field(..., ge=0.0, description="Inference latency in milliseconds")
    image_width: int = Field(..., gt=0, description="Width of the inspected image")
    image_height: int = Field(..., gt=0, description="Height of the inspected image")


# Backward compatibility alias
MaterialSchema = MaterialAssessmentResponse
