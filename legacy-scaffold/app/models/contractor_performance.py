from app.database.base import Base
from sqlalchemy import Column, String
class ContractorPerformance(Base):
    __tablename__ = "contractor_performances"
    id = Column(String, primary_key=True)
