from app.database.base import Base
from sqlalchemy import Column, String
class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(String, primary_key=True)
