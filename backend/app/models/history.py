
from sqlalchemy import Boolean, Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class StatusEnum(str, enum.Enum):
    completed = "completed"
    failed = "failed"
    processing = "processing"

class HistoryItem(Base):
    __tablename__ = "history_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    title = Column(String, nullable=False)
    workflow_type = Column(String, nullable=False)
    icon_name = Column(String, default="MessageSquare")
    status = Column(Enum(StatusEnum), default=StatusEnum.processing)
    content = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    workflow = relationship("Workflow")
