import cv2
import numpy as np


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Safely decode raw image bytes into a 3-channel BGR numpy array.

    Does not trust file extension or declared MIME type. Validates raw magic numbers
    and decode results directly via OpenCV. Does not perform unnecessary manual resizing
    or normalization since Ultralytics YOLO models handle letterboxing and normalization
    internally during model forward pass.

    Args:
        image_bytes: Binary contents of an uploaded image file.

    Returns:
        np.ndarray: BGR image array with shape (H, W, 3).

    Raises:
        ValueError: If image bytes are empty, malformed, corrupted, or unsupported.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Image payload is empty. Please upload a valid non-empty image file.")

    # Guard against trivially small invalid payloads (e.g. fewer bytes than any valid image header)
    if len(image_bytes) < 32:
        raise ValueError("Image payload is too small to be a valid image file.")

    np_buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError(
            "Failed to decode image. Content is either corrupted, truncated, "
            "or an unsupported image format (JPEG, PNG, WebP, BMP are supported)."
        )

    if image.ndim != 3 or image.shape[0] <= 0 or image.shape[1] <= 0 or image.shape[2] != 3:
        raise ValueError("Decoded image does not contain valid 3-channel dimensions.")

    return image


def preprocess(image_bytes: bytes) -> np.ndarray:
    """Preprocess wrapper preserving backward compatibility."""
    return decode_image_bytes(image_bytes)
