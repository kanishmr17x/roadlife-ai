from app.database.base import Base
from sqlalchemy import Column, String
class ConstructionProject(Base):
    __tablename__ = "construction_projects"
    id = Column(String, primary_key=True)
