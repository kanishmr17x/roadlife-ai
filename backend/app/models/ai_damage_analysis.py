from app.database.base import Base
from sqlalchemy import Column, String
class AiDamageAnalysis(Base):
    __tablename__ = "ai_damage_analysiss"
    id = Column(String, primary_key=True)
