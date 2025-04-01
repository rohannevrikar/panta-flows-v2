
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    CLIENT_ADMIN = "client_admin"
    USER = "user"

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.USER
    client_id: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    role: Optional[UserRole] = None
    client_id: Optional[str] = None

class UserInDB(UserBase):
    id: str
    avatar: Optional[str] = None
    role: UserRole
    client_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class TokenPayload(BaseModel):
    sub: Optional[str] = None
