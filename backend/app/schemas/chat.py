
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageInDB(ChatMessageBase):
    id: str
    session_id: str
    timestamp: datetime

    class Config:
        orm_mode = True

class ChatMessage(ChatMessageInDB):
    pass

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionInDB(ChatSessionBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True

class ChatSession(ChatSessionInDB):
    messages: List[ChatMessage] = []

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    workflow_type: Optional[str] = "Chat Assistant"

class ChatResponse(BaseModel):
    message: str
    session_id: str
