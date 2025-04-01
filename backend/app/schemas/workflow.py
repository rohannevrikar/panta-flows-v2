
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WorkflowBase(BaseModel):
    title: str
    description: Optional[str] = None
    icon_name: Optional[str] = "MessageSquare"
    color: Optional[str] = None
    translation_key: Optional[str] = None
    is_favorite: Optional[bool] = False

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None
    color: Optional[str] = None
    translation_key: Optional[str] = None
    is_favorite: Optional[bool] = None

class WorkflowInDB(WorkflowBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Workflow(WorkflowInDB):
    pass

class WorkflowFavorite(BaseModel):
    is_favorite: bool
