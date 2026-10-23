from app.database.base import Base
from sqlalchemy import Column, String
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
