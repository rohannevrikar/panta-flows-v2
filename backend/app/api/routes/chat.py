
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.api.deps import get_current_user
from app.schemas.chat import ChatSession as ChatSessionSchema, ChatMessage as ChatMessageSchema
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.langchain_service import generate_chat_response

router = APIRouter()

@router.get("/sessions", response_model=List[ChatSessionSchema])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all chat sessions for current user
    """
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionSchema)
def get_chat_session(
    *,
    db: Session = Depends(get_db),
    session_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a specific chat session with messages
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Fetch messages for this session
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.timestamp).all()
    
    session.messages = messages
    return session

@router.post("/message", response_model=ChatResponse)
async def send_message(
    *,
    db: Session = Depends(get_db),
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Send a message to the chat and get a response
    """
    session_id = chat_request.session_id
    
    # Create a new session if one doesn't exist
    if not session_id:
        new_session = ChatSession(
            user_id=current_user.id,
            title=f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.id
    else:
        # Verify session exists and belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    
    # Save user message
    user_message = ChatMessage(
        session_id=session_id,
        role="user",
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    # Generate response using LangChain
    response_text = await generate_chat_response(
        chat_request.message,
        workflow_type=chat_request.workflow_type
    )
    
    # Save assistant response
    assistant_message = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=response_text
    )
    db.add(assistant_message)
    db.commit()
    
    return {
        "message": response_text,
        "session_id": session_id
    }

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_session(
    *,
    db: Session = Depends(get_db),
    session_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a chat session and its messages
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    # Delete all messages in this session
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    
    # Delete the session
    db.delete(session)
    db.commit()
    
    return None
