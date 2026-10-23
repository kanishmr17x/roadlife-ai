from app.database.base import Base
from sqlalchemy import Column, String
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
