from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_weather():
    return {"message": "Router placeholder for weather"}
