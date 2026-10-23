from app.database.base import Base
from sqlalchemy import Column, String
class RepairTask(Base):
    __tablename__ = "repair_tasks"
    id = Column(String, primary_key=True)
