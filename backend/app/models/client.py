
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)  # A unique code/slug for the client
    primary_color = Column(String, nullable=False)
    secondary_color = Column(String, nullable=True)
    accent_color = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    tagline = Column(String, nullable=True)
    api_keys = Column(JSON, default={})  # Store API keys (e.g., Azure OpenAI)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
