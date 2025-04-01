
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WorkflowBase(BaseModel):
    title: str
    description: Optional[str] = None
    icon_name: Optional[str] = "MessageSquare"
    color: Optional[str] = None
    translation_key: Optional[str] = None
    is_favorite: Optional[bool] = False
    is_public: Optional[bool] = True
    assigned_user_ids: Optional[List[str]] = []

class WorkflowCreate(WorkflowBase):
    client_id: str

class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None
    color: Optional[str] = None
    translation_key: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_public: Optional[bool] = None
    assigned_user_ids: Optional[List[str]] = None

class WorkflowInDB(WorkflowBase):
    id: str
    user_id: str
    client_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Workflow(WorkflowInDB):
    pass

class WorkflowFavorite(BaseModel):
    is_favorite: bool
