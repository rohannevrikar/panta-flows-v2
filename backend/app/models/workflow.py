
from sqlalchemy import Boolean, Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String, default="MessageSquare")
    color = Column(String, nullable=True)
    translation_key = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)  # Whether this workflow is available to all client users
    assigned_user_ids = Column(JSON, default=[])  # List of specific user IDs that can access this workflow
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
    client = relationship("Client")
