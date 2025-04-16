from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from azure.cosmos import CosmosClient, PartitionKey
import asyncio

router = APIRouter()

class Workflow(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    system_prompt: str
    icon_name: str
    color: str
    user_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    conversation_starters: List[dict]
    is_default: bool = False

class WorkflowConfig(BaseModel):
    id: str
    title: str
    description: str
    icon_name: str
    color: str
    conversation_starters: List[dict]
    system_prompt: str
    created_at: datetime
    updated_at: datetime

# Initialize CosmosDB client
client = CosmosClient(
    os.getenv("COSMOS_ENDPOINT"),
    os.getenv("COSMOS_KEY")
)
database = client.get_database_client(os.getenv("COSMOS_DATABASE", "chatview-db"))

# Create workflows container if it doesn't exist
try:
    database.create_container_if_not_exists(
        id="workflows",
        partition_key=PartitionKey(path="/user_id"),
        offer_throughput=400
    )
    print("Workflows container created or already exists")
except Exception as e:
    print(f"Error creating workflows container: {str(e)}")

workflow_container = database.get_container_client("workflows")

# Default workflows
DEFAULT_WORKFLOWS = [
    {
        "id": "chat",
        "title": "Chat Assistant",
        "description": "General purpose AI chat assistant",
        "system_prompt": "You are a helpful AI assistant that can answer questions and help with various tasks.",
        "icon_name": "Chat",
        "color": "#3B82F6",
        "user_id": "default-user",
        "conversation_starters": [
            {"id": "starter-1", "text": "What can you help me with?"},
            {"id": "starter-2", "text": "Tell me about yourself"},
            {"id": "starter-3", "text": "How do I get started?"}
        ],
        "is_default": True
    },
    {
        "id": "code",
        "title": "Code Assistant",
        "description": "AI assistant specialized in coding and programming",
        "system_prompt": "You are an expert programming assistant that helps with coding tasks, debugging, and explaining code.",
        "icon_name": "Code",
        "color": "#10B981",
        "user_id": "default-user",
        "conversation_starters": [
            {"id": "starter-1", "text": "Help me debug this code"},
            {"id": "starter-2", "text": "Explain this programming concept"},
            {"id": "starter-3", "text": "Suggest best practices"}
        ],
        "is_default": False
    }
]

async def create_default_workflows():
    try:
        # Check if default workflows already exist
        query = f"SELECT * FROM c WHERE c.user_id = @userId AND c.is_default = true"
        parameters = [{"name": "@userId", "value": "default-user"}]
        
        existing_workflows = list(workflow_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if not existing_workflows:
            print("Creating default workflows...")
            # Create default workflows
            for workflow in DEFAULT_WORKFLOWS:
                workflow["created_at"] = datetime.now().isoformat()
                workflow["updated_at"] = workflow["created_at"]
                try:
                    workflow_container.create_item(body=workflow)
                    print(f"Created default workflow: {workflow['title']}")
                except Exception as e:
                    print(f"Error creating workflow {workflow['title']}: {str(e)}")
            print("Default workflows creation completed")
        else:
            print("Default workflows already exist")
    except Exception as e:
        print(f"Error in create_default_workflows: {str(e)}")

# Create default workflows when the router is initialized
asyncio.create_task(create_default_workflows())

# Default workflow configurations
DEFAULT_CONFIGS = {
    "chat": {
        "id": "chat",
        "title": "Chat Assistant",
        "description": "General purpose AI assistant",
        "icon_name": "message-square",
        "color": "#000000",
        "conversation_starters": [
            {"id": "1", "text": "Generate a marketing strategy for my business"},
            {"id": "2", "text": "Help me draft an email to a client"},
            {"id": "3", "text": "Summarize this article for me"},
            {"id": "4", "text": "Create a to-do list for my project"}
        ],
        "system_prompt": "You are a helpful AI assistant that can answer questions and help with various tasks."
    },
    "code": {
        "id": "code",
        "title": "Code Helper",
        "description": "AI assistant for programming and code-related tasks",
        "icon_name": "code",
        "color": "#000000",
        "conversation_starters": [
            {"id": "1", "text": "Help me debug this code"},
            {"id": "2", "text": "Explain this programming concept"},
            {"id": "3", "text": "Generate a function to..."},
            {"id": "4", "text": "Suggest best practices for..."}
        ],
        "system_prompt": "You are an expert programming assistant. Help users with coding tasks, debugging, and explaining programming concepts."
    }
}

@router.post("/workflows", response_model=Workflow)
async def create_workflow(workflow: Workflow):
    try:
        # Generate ID if not provided
        if not workflow.id:
            workflow.id = f"workflow-{datetime.now().timestamp()}-{os.urandom(4).hex()}"
        
        # Set timestamps
        workflow.created_at = datetime.now().isoformat()
        workflow.updated_at = workflow.created_at
        
        # Create the workflow in Cosmos DB
        workflow_dict = workflow.dict()
        workflow_container.create_item(body=workflow_dict)
        return workflow
    except Exception as e:
        print(f"Error creating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflows", response_model=List[Workflow])
async def get_workflows(user_id: str):
    try:
        query = f"SELECT * FROM c WHERE c.user_id = @userId"
        parameters = [{"name": "@userId", "value": user_id}]
        
        items = list(workflow_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str, user_id: str):
    try:
        query = f"SELECT * FROM c WHERE c.id = @id AND c.user_id = @userId"
        parameters = [
            {"name": "@id", "value": workflow_id},
            {"name": "@userId", "value": user_id}
        ]
        
        items = list(workflow_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if not items:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        return items[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow_update: dict, user_id: str):
    try:
        # Get existing workflow
        existing = await get_workflow(workflow_id, user_id)
        
        # Create a new workflow object with existing data
        updated_workflow = Workflow(
            id=workflow_id,
            title=workflow_update.get('title', existing['title']),
            description=workflow_update.get('description', existing['description']),
            system_prompt=workflow_update.get('system_prompt', existing['system_prompt']),
            icon_name=workflow_update.get('icon_name', existing['icon_name']),
            color=workflow_update.get('color', existing['color']),
            user_id=user_id,
            conversation_starters=workflow_update.get('conversation_starters', existing['conversation_starters']),
            is_default=workflow_update.get('is_default', existing['is_default']),
            created_at=existing['created_at'],  # Always preserve original creation time
            updated_at=datetime.now().isoformat()  # Update the modification time
        )
        
        # Update in Cosmos DB
        workflow_dict = updated_workflow.dict()
        workflow_container.replace_item(item=workflow_id, body=workflow_dict)
        return updated_workflow
    except Exception as e:
        print(f"Error updating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, user_id: str):
    try:
        # Verify workflow exists and belongs to user
        await get_workflow(workflow_id, user_id)
        
        # Delete from Cosmos DB
        workflow_container.delete_item(item=workflow_id, partition_key=user_id)
        return {"message": "Workflow deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/configs/{workflow_id}")
async def get_workflow_config(workflow_id: str):
    """Get specific workflow configuration"""
    try:
        # First check if it's a default config
        if workflow_id in DEFAULT_CONFIGS:
            config = DEFAULT_CONFIGS[workflow_id]
            config["created_at"] = datetime.utcnow()
            config["updated_at"] = datetime.utcnow()
            return config
            
        # If not a default config, try to get from database
        query = f"SELECT * FROM c WHERE c.id = @workflow_id"
        parameters = [{"name": "@workflow_id", "value": workflow_id}]
        configs = list(workflow_container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        if not configs:
            # If no config found, return a default config
            default_config = {
                "id": workflow_id,
                "title": "Chat Assistant",
                "description": "General purpose AI assistant",
                "icon_name": "message-square",
                "color": "#3B82F6",  # Default blue color
                "conversation_starters": [
                    {"id": "1", "text": "What can you help me with?"},
                    {"id": "2", "text": "Tell me about yourself"},
                    {"id": "3", "text": "How do I get started?"}
                ],
                "system_prompt": "You are a helpful AI assistant that can answer questions and help with various tasks.",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            return default_config
            
        return configs[0]
    except Exception as e:
        print(f"Error in get_workflow_config: {str(e)}")
        # Return a default config on error
        default_config = {
            "id": workflow_id,
            "title": "Chat Assistant",
            "description": "General purpose AI assistant",
            "icon_name": "message-square",
            "color": "#3B82F6",  # Default blue color
            "conversation_starters": [
                {"id": "1", "text": "What can you help me with?"},
                {"id": "2", "text": "Tell me about yourself"},
                {"id": "3", "text": "How do I get started?"}
            ],
            "system_prompt": "You are a helpful AI assistant that can answer questions and help with various tasks.",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        return default_config

@router.get("/configs")
async def get_workflow_configs():
    """Get all available workflow configurations"""
    try:
        # Start with default configs
        configs = list(DEFAULT_CONFIGS.values())
        
        # Add any custom configs from database
        query = "SELECT * FROM c WHERE c.type = 'workflow_config'"
        custom_configs = list(workflow_container.query_items(
            query=query,
            enable_cross_partition_query=True
        ))
        
        configs.extend(custom_configs)
        return configs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/configs")
async def create_workflow_config(config: WorkflowConfig):
    """Create a new workflow configuration"""
    try:
        # Add type and timestamps
        config_dict = config.dict()
        config_dict["type"] = "workflow_config"
        config_dict["created_at"] = datetime.utcnow()
        config_dict["updated_at"] = datetime.utcnow()
        
        # Store in CosmosDB
        workflow_container.create_item(body=config_dict)
        return config_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 