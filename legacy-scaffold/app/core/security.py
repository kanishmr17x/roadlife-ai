import hashlib
import hmac
import base64
import json
import time
from typing import Optional, Dict, Any
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """
    Generate salted SHA-256 hash formatted as sha256$salt$hash
    """
    import os
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"sha256${salt}${hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify candidate plaintext password against hash
    """
    if not hashed_password or not plain_password:
        return False
    parts = hashed_password.split('$')
    if len(parts) != 3 or parts[0] != 'sha256':
        return False
    salt = parts[1]
    expected_hash = parts[2]
    candidate_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
    return hmac.compare_digest(candidate_hash, expected_hash)

def create_access_token(data: Dict[str, Any], expires_delta_minutes: Optional[int] = None) -> str:
    """
    Issue HMAC-SHA256 JWT compatible token
    """
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    expires = now + (expires_delta_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES) * 60
    
    payload = {**data, "iat": now, "exp": expires}
    
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode('utf-8')).decode('utf-8').rstrip('=')
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode('utf-8')).decode('utf-8').rstrip('=')
    
    signature_data = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signature_data, hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"
