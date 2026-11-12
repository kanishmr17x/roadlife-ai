from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    auth, users, roads, construction, materials, reports,
    damage, repairs, weather, contractors, performance,
    notifications, analytics, audit_logs
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="RoadLife AI API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
app.include_router(roads.router, prefix=f"{settings.API_V1_STR}/roads", tags=["Roads"])
app.include_router(construction.router, prefix=f"{settings.API_V1_STR}/construction", tags=["Construction"])
app.include_router(materials.router, prefix=f"{settings.API_V1_STR}/materials", tags=["Materials"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])
app.include_router(damage.router, prefix=f"{settings.API_V1_STR}/damage", tags=["Damage"])
app.include_router(repairs.router, prefix=f"{settings.API_V1_STR}/repairs", tags=["Repairs"])
app.include_router(weather.router, prefix=f"{settings.API_V1_STR}/weather", tags=["Weather"])
app.include_router(contractors.router, prefix=f"{settings.API_V1_STR}/contractors", tags=["Contractors"])
app.include_router(performance.router, prefix=f"{settings.API_V1_STR}/performance", tags=["Performance"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["Notifications"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(audit_logs.router, prefix=f"{settings.API_V1_STR}/audit-logs", tags=["Audit Logs"])

@app.get("/")
def root():
    return {"service": settings.PROJECT_NAME, "status": "online"}
