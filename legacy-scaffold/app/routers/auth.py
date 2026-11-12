from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    portalRole: Optional[str] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    fullName: str
    role: Optional[str] = "CITIZEN"
    companyName: Optional[str] = None
    licenseNumber: Optional[str] = None
    phone: Optional[str] = None

# In-memory demo fallback for FastAPI service
FASTAPI_DEMO_USERS = {
    "citizen@roadsense.local": {
        "id": "usr-cit-101",
        "email": "citizen@roadsense.local",
        "password_hash": get_password_hash("CitizenPass123!"),
        "fullName": "Priya Sharma (Citizen Inspector)",
        "role": "CITIZEN",
        "status": "ACTIVE",
        "isApproved": True
    },
    "contractor@buildinfra.in": {
        "id": "usr-con-202",
        "email": "contractor@buildinfra.in",
        "password_hash": get_password_hash("ContractorPass123!"),
        "fullName": "Vikram Patel (BuildInfra EPC)",
        "role": "CONTRACTOR",
        "status": "ACTIVE",
        "isApproved": True,
        "companyName": "BuildInfra EPC Ltd."
    },
    "officer@pwd.gov.in": {
        "id": "usr-gov-303",
        "email": "officer@pwd.gov.in",
        "password_hash": get_password_hash("GovOfficerPass123!"),
        "fullName": "Dr. Suresh Kumar (Superintending Engineer)",
        "role": "MUNICIPAL_AUTHORITY",
        "status": "ACTIVE",
        "isApproved": True,
        "department": "Public Works Department"
    },
    "kanish1@gmail.com": {
        "id": "usr-dev-kanish1",
        "email": "kanish1@gmail.com",
        "password_hash": get_password_hash("1234"),
        "fullName": "Kanish Citizen",
        "role": "CITIZEN",
        "status": "ACTIVE",
        "isApproved": True
    },
    "kanish2@gmail.com": {
        "id": "usr-dev-kanish2",
        "email": "kanish2@gmail.com",
        "password_hash": get_password_hash("1234"),
        "fullName": "Kanish Contractor",
        "role": "CONTRACTOR",
        "status": "ACTIVE",
        "isApproved": True,
        "companyName": "Kanish Road Infra Ltd."
    },
    "kanish3@gmail.com": {
        "id": "usr-dev-kanish3",
        "email": "kanish3@gmail.com",
        "password_hash": get_password_hash("1234"),
        "fullName": "Kanish Municipal Officer",
        "role": "MUNICIPAL_AUTHORITY",
        "status": "ACTIVE",
        "isApproved": True,
        "department": "Municipal Road & Infrastructure Authority"
    }
}

@router.post("/login")
def login(req: LoginRequest):
    normalized = req.email.lower()
    user = FASTAPI_DEMO_USERS.get(normalized)
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
        
    if not user.get("isApproved", True) or user.get("status") == "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your contractor account is currently pending municipal authority approval."
        )
        
    token = create_access_token({"id": user["id"], "email": user["email"], "role": user["role"]})
    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    
    return {
        "message": "Authentication successful",
        "token": token,
        "user": user_data
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    requested_role = (req.role or "CITIZEN").upper()
    if requested_role in ["MUNICIPAL_AUTHORITY", "GOVERNMENT", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Municipal Authority accounts cannot be created via public registration."
        )
        
    normalized = req.email.lower()
    if normalized in FASTAPI_DEMO_USERS:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered.")
        
    if requested_role == "CONTRACTOR":
        if not req.companyName or not req.licenseNumber:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company name and license required.")
        new_user = {
            "id": f"usr-con-{len(FASTAPI_DEMO_USERS)+1}",
            "email": normalized,
            "password_hash": get_password_hash(req.password),
            "fullName": req.fullName,
            "role": "CONTRACTOR",
            "status": "PENDING_APPROVAL",
            "isApproved": False,
            "companyName": req.companyName
        }
        FASTAPI_DEMO_USERS[normalized] = new_user
        return {"message": "Contractor application submitted", "status": "PENDING_APPROVAL"}
        
    new_user = {
        "id": f"usr-cit-{len(FASTAPI_DEMO_USERS)+1}",
        "email": normalized,
        "password_hash": get_password_hash(req.password),
        "fullName": req.fullName,
        "role": "CITIZEN",
        "status": "ACTIVE",
        "isApproved": True
    }
    FASTAPI_DEMO_USERS[normalized] = new_user
    token = create_access_token({"id": new_user["id"], "email": new_user["email"], "role": new_user["role"]})
    return {"message": "Registration successful", "token": token, "user": {k: v for k, v in new_user.items() if k != "password_hash"}}
