from app.database.base import Base
from sqlalchemy import Column, String
class ConstructionStage(Base):
    __tablename__ = "construction_stages"
    id = Column(String, primary_key=True)
