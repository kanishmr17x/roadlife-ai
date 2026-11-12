from app.database.base import Base
from sqlalchemy import Column, String
class Road(Base):
    __tablename__ = "roads"
    id = Column(String, primary_key=True)
