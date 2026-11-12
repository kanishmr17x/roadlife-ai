from app.database.base import Base
from sqlalchemy import Column, String
class MaterialEvidence(Base):
    __tablename__ = "material_evidences"
    id = Column(String, primary_key=True)
