
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    code: str
    primary_color: str
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo: Optional[str] = None
    tagline: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo: Optional[str] = None
    tagline: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None

class ClientInDB(ClientBase):
    id: str
    api_keys: Dict[str, str] = {}
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Client(ClientInDB):
    pass

class ClientApiKeys(BaseModel):
    azure_openai: Optional[str] = None
    # Add other API keys as needed
