from app.database.base import Base
from sqlalchemy import Column, String
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
