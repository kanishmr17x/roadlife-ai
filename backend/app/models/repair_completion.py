from app.database.base import Base
from sqlalchemy import Column, String
class RepairCompletion(Base):
    __tablename__ = "repair_completions"
    id = Column(String, primary_key=True)
