
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class StatusEnum(str, Enum):
    completed = "completed"
    failed = "failed"
    processing = "processing"

class HistoryItemBase(BaseModel):
    title: str
    workflow_type: str
    workflow_id: str
    icon_name: Optional[str] = "MessageSquare"
    status: Optional[StatusEnum] = StatusEnum.processing
    content: Optional[str] = None
    is_favorite: Optional[bool] = False

class HistoryItemCreate(HistoryItemBase):
    pass

class HistoryItemUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[StatusEnum] = None
    content: Optional[str] = None
    is_favorite: Optional[bool] = None

class HistoryItemInDB(HistoryItemBase):
    id: str
    user_id: str
    timestamp: datetime

    class Config:
        orm_mode = True

class HistoryItem(HistoryItemInDB):
    pass

class HistoryItemFavorite(BaseModel):
    is_favorite: bool
