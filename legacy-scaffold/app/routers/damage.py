from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_damage():
    return {"message": "Router placeholder for damage"}
