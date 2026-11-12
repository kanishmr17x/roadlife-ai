from app.database.base import Base
from sqlalchemy import Column, String
class Role(Base):
    __tablename__ = "roles"
    id = Column(String, primary_key=True)
