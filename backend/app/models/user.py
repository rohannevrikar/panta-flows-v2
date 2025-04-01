
from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    CLIENT_ADMIN = "client_admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    client_id = Column(String, nullable=True)  # To associate with a specific client
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
