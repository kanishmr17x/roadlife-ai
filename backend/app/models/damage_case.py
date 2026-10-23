from app.database.base import Base
from sqlalchemy import Column, String
class DamageCase(Base):
    __tablename__ = "damage_cases"
    id = Column(String, primary_key=True)
