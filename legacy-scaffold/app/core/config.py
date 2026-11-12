from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RoadLife AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-jwt-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "postgresql://roadlife_user:roadlife_password@localhost:5432/roadlife_db"
    ML_SERVICE_URL: str = "http://localhost:8001"
    WEATHER_API_KEY: str = "placeholder"

    class Config:
        env_file = ".env"

settings = Settings()
