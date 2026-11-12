from app.database.base import Base
from sqlalchemy import Column, String
class RepairPlan(Base):
    __tablename__ = "repair_plans"
    id = Column(String, primary_key=True)
