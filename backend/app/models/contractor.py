from app.database.base import Base
from sqlalchemy import Column, String
class Contractor(Base):
    __tablename__ = "contractors"
    id = Column(String, primary_key=True)
