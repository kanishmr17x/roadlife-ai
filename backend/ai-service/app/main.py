import email
from email.policy import default
import logging
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.config import settings
from app.inference.damage_inference import DamageDetector, ModelNotReadyError
from app.inference.material_inference import MaterialAssessor
from app.preprocessing.image_preprocessing import decode_image_bytes
from app.schemas.damage import DamageInferenceResponse
from app.schemas.material import MaterialAssessmentResponse

logger = logging.getLogger("ml_service")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title=settings.service_name,
    description="RoadLife AI - Computer Vision Microservice for Road Damage Detection & Material Assessment",
    version="1.0.0",
)

# Initialize detector and material assessor instances
detector = DamageDetector(config=settings)
material_assessor = MaterialAssessor(device=settings.device)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Safely handle unexpected exceptions without leaking internal filesystem paths or traces."""
    logger.error("Unhandled error processing request %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": "An internal processing error occurred."},
    )


@app.get("/", summary="Root Health & Readiness")
def health() -> Dict[str, Any]:
    """Root health and status endpoint reporting model readiness."""
    model_status = detector.get_status()
    return {
        "service": settings.service_name,
        "status": "ready" if model_status.model_ready else "degraded",
        "model_ready": model_status.model_ready,
        "material_assessor_ready": True,
        "device": model_status.device,
    }


@app.get("/health", summary="Detailed Health Check")
def detailed_health() -> Dict[str, Any]:
    """Detailed health check reporting model readiness and device configuration."""
    status_dict = detector.get_status().model_dump()
    status_dict["material_assessor_ready"] = True
    return status_dict


async def extract_image_bytes(request: Request, max_bytes: int) -> bytes:
    """Extract raw image bytes from multipart/form-data or binary payload.

    Handles standard multipart/form-data (both via Starlette form parsing and standard-library
    fallback when python-multipart is absent) as well as direct binary image uploads.
    """
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Upload payload exceeds maximum limit of {max_bytes // (1024 * 1024)} MB.",
        )

    content_type = request.headers.get("content-type", "")

    # 1. Try Starlette form parsing (if python-multipart is present in the environment)
    if "multipart/form-data" in content_type:
        try:
            form = await request.form()
            for key in ("file", "image", "upload"):
                if key in form and hasattr(form[key], "read"):
                    data = await form[key].read()
                    if len(data) > max_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="Uploaded file exceeds maximum allowed size.",
                        )
                    return data
            for val in form.values():
                if hasattr(val, "read"):
                    data = await val.read()
                    if len(data) > max_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="Uploaded file exceeds maximum allowed size.",
                        )
                    return data
        except HTTPException:
            raise
        except Exception:
            pass  # Fallback to raw stream and stdlib parser below

    # 2. Read raw stream safely with chunk-based size enforcement
    body_chunks = bytearray()
    async for chunk in request.stream():
        body_chunks.extend(chunk)
        if len(body_chunks) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Upload payload exceeds maximum limit of {max_bytes // (1024 * 1024)} MB.",
            )

    body = bytes(body_chunks)
    if not body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image payload is empty. Please provide a valid image.",
        )

    # 3. If multipart, parse using standard-library email parser
    if "multipart/form-data" in content_type:
        try:
            header = f"Content-Type: {content_type}\r\n\r\n".encode("latin-1")
            msg = email.message_from_bytes(header + body, policy=default)
            for part in msg.iter_parts():
                payload = part.get_payload(decode=True)
                if payload:
                    return payload
        except Exception as parse_err:
            logger.warning("Failed stdlib multipart extraction: %s", parse_err)

    return body


@app.post(
    "/predict/damage",
    response_model=DamageInferenceResponse,
    summary="Detect Road Damage",
    responses={
        200: {"description": "Successful inference with damage detections."},
        400: {"description": "Invalid, corrupted, or empty image payload."},
        413: {"description": "Payload exceeds maximum allowed upload size."},
        503: {"description": "Model weights not deployed or service unavailable."},
    },
)
async def detect_damage(request: Request) -> DamageInferenceResponse:
    """Analyze an uploaded road image and detect damage distresses.

    Extracts bounding boxes, categories, confidence scores, and estimated severity.
    Returns HTTP 503 if trained model weights are not loaded on the server.
    """
    # Check for optional computer vision fallback flag safely across all ASGI scopes
    raw_qs = request.scope.get("query_string", b"")
    qs = raw_qs.decode("latin-1", errors="ignore").lower() if isinstance(raw_qs, bytes) else str(raw_qs).lower()
    allow_fallback = "allow_fallback=true" in qs or "allow_fallback=1" in qs

    # 1. Check model readiness first before reading full image
    if not detector.is_ready() and not allow_fallback:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Road damage detection model weights are not deployed or ready.",
        )

    # 2. Extract image bytes with payload size guard
    image_bytes = await extract_image_bytes(request, max_bytes=settings.max_upload_size_bytes)

    # 3. Decode image bytes with OpenCV
    try:
        image = decode_image_bytes(image_bytes)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )

    # 4. Perform YOLO model inference (with automated CV fallback when requested)
    try:
        response = detector.predict(image, allow_fallback=allow_fallback)
        return response
    except ModelNotReadyError as mr_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(mr_err),
        )
    except Exception as exc:
        logger.error("Inference failure on image: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference execution failed on the provided image.",
        )


@app.post(
    "/predict/material",
    response_model=MaterialAssessmentResponse,
    summary="Assess Construction Material Quality",
    responses={
        200: {"description": "Successful material quality verification."},
        400: {"description": "Invalid, corrupted, or empty image payload."},
        413: {"description": "Payload exceeds maximum allowed upload size."},
    },
)
async def assess_material(request: Request) -> MaterialAssessmentResponse:
    """Analyze an uploaded construction material image (aggregate, bitumen, concrete, subgrade).

    Evaluates binder coating, segregation, flakiness index, and voids against IRC/MoRTH standards.
    """
    image_bytes = await extract_image_bytes(request, max_bytes=settings.max_upload_size_bytes)
    try:
        image = decode_image_bytes(image_bytes)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )

    raw_qs = request.scope.get("query_string", b"")
    qs = raw_qs.decode("latin-1", errors="ignore") if isinstance(raw_qs, bytes) else str(raw_qs)
    import urllib.parse
    parsed = urllib.parse.parse_qs(qs)
    declared = parsed.get("material", [None])[0]
    try:
        response = material_assessor.assess(image, declared_material=declared)
        return response
    except Exception as exc:
        logger.error("Material assessment failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Material quality visual assessment failed on the provided image.",
        )
