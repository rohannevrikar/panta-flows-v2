from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from azure.cosmos import CosmosClient, PartitionKey

router = APIRouter()

class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str
    content: str
    timestamp: Optional[str] = None
    workflowId: Optional[str] = None
    workflowTitle: Optional[str] = None
    userId: Optional[str] = None

class ChatSession(BaseModel):
    id: Optional[str] = None
    workflowId: str
    workflowTitle: str
    userId: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    messages: List[ChatMessage] = []

# Initialize CosmosDB client
client = CosmosClient(
    os.getenv("COSMOS_ENDPOINT"),
    os.getenv("COSMOS_KEY")
)
database = client.get_database_client(os.getenv("COSMOS_DATABASE", "chatview-db"))
container = database.get_container_client(os.getenv("COSMOS_CONTAINER", "chat-history"))

@router.post("/sessions", response_model=ChatSession)
async def create_session(session: ChatSession):
    try:
        # Generate ID if not provided
        if not session.id:
            session.id = f"session-{datetime.now().timestamp()}-{os.urandom(4).hex()}"
        
        # Set timestamps if not provided
        if not session.createdAt:
            session.createdAt = datetime.now().isoformat()
        if not session.updatedAt:
            session.updatedAt = datetime.now().isoformat()
        
        # Ensure messages is a list
        if not session.messages:
            session.messages = []
        
        # Convert to dict for Cosmos DB
        session_dict = session.dict()
        
        # Create the session in Cosmos DB
        container.create_item(body=session_dict)
        return session
    except Exception as e:
        print(f"Error creating session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{user_id}", response_model=List[ChatSession])
async def get_chat_history(user_id: str, limit: int = 20):
    try:
        query = f"SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC OFFSET 0 LIMIT @limit"
        parameters = [
            {"name": "@userId", "value": user_id},
            {"name": "@limit", "value": limit}
        ]
        
        items = list(container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/{user_id}", response_model=ChatSession)
async def get_session(session_id: str, user_id: str):
    try:
        item = container.read_item(item=session_id, partition_key=user_id)
        return item
    except Exception as e:
        raise HTTPException(status_code=404, detail="Session not found")

@router.post("/sessions/{session_id}/{user_id}/messages", response_model=ChatMessage)
async def add_message(session_id: str, user_id: str, message: ChatMessage):
    try:
        session = container.read_item(item=session_id, partition_key=user_id)
        message.id = f"msg-{datetime.now().timestamp()}-{os.urandom(4).hex()}"
        message.timestamp = datetime.now().isoformat()
        
        session["messages"].append(message.dict())
        session["updatedAt"] = datetime.now().isoformat()
        
        container.replace_item(item=session_id, body=session)
        return message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 