from app.database.base import Base
from sqlalchemy import Column, String
class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"
    id = Column(String, primary_key=True)
