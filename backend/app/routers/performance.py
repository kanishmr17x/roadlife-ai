from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_performance():
    return {"message": "Router placeholder for performance"}
