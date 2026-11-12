from app.database.base import Base
from sqlalchemy import Column, String
class RoadSpecification(Base):
    __tablename__ = "road_specifications"
    id = Column(String, primary_key=True)
