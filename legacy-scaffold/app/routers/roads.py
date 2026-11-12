from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_roads():
    return {"message": "Router placeholder for roads"}
