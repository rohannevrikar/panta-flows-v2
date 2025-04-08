from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import uuid
import asyncio
import logging
from openai import AzureOpenAI
from io import BytesIO
import time
import traceback
import json
from pathlib import Path
import tempfile
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress unnecessary logs from httpcore and other libraries
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("azure").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
# Add these new lines to suppress additional logs
logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)

router = APIRouter()

# Azure OpenAI configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API_KEY"),
    api_version="2024-05-01-preview",
    azure_endpoint=os.getenv("AZURE_ENDPOINT")
)

# Store vector store ID
vector_store_id = None

# Helper function to get or create vector store
def get_or_create_vector_store():
    global vector_store_id
    if vector_store_id:
        return vector_store_id
    
    try:
        # List existing vector stores
        vector_stores = client.vector_stores.list()
        for store in vector_stores:
            if store.name == "File Search Vector Store":
                vector_store_id = store.id
                logger.info(f"Using existing vector store: {vector_store_id}")
                return vector_store_id
        
        # Create a new vector store if none exists
        vector_store = client.vector_stores.create(
            name="File Search Vector Store"
        )
        vector_store_id = vector_store.id
        logger.info(f"Created new vector store: {vector_store_id}")
        return vector_store_id
    except Exception as e:
        logger.error(f"Error getting or creating vector store: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting or creating vector store: {str(e)}"
        )

# Helper function to wait for run completion
async def wait_for_run_completion(thread_id: str, run_id: str, max_attempts: int = 10):
    for attempt in range(max_attempts):
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        if run.status == "completed":
            return run
        elif run.status in ["failed", "cancelled", "expired"]:
            raise HTTPException(
                status_code=500,
                detail=f"Run failed with status: {run.status}"
            )
        await asyncio.sleep(1)
    
    raise HTTPException(
        status_code=500,
        detail=f"Run timed out after {max_attempts} attempts"
    )

class FileInfo(BaseModel):
    id: str
    size: int
    content_type: str
    url: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    file_ids: Optional[List[str]] = None
    max_results: Optional[int] = 5

class SearchResult(BaseModel):
    content: str
    file_references: List[str]

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...)
):
    try:
        # Create a temporary file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Upload to OpenAI
            try:
                with open(temp_file.name, 'rb') as f:
                    openai_file = client.files.create(
                        file=f,
                        purpose="assistants"
                    )
                logger.info(f"Successfully uploaded file to OpenAI: {openai_file.id}")
            except Exception as e:
                logger.error(f"Failed to upload file to OpenAI: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload file to OpenAI: {str(e)}"
                )
            
            # Add file to vector store
            try:
                vector_store_id = get_or_create_vector_store()
                file_batch = client.vector_stores.file_batches.create_and_poll(
                    vector_store_id=vector_store_id,
                    file_ids=[openai_file.id]
                )
                logger.info(f"Added file to vector store: {vector_store_id}")
            except Exception as e:
                logger.error(f"Failed to add file to vector store: {str(e)}")
                # Continue even if vector store addition fails
            
            return {
                "file_id": openai_file.id,
                "filename": file.filename
            }
    except Exception as e:
        logger.error(f"Error in file upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error in file upload: {str(e)}"
        )
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file.name)
        except Exception as e:
            logger.error(f"Failed to clean up temporary file: {str(e)}")

@router.get("/list", response_model=List[FileInfo])
async def list_files():
    try:
        # List all files from OpenAI
        files = []
        openai_files = client.files.list()
        
        for file in openai_files:
            files.append(FileInfo(
                id=file.id,
                size=file.bytes,
                content_type=file.purpose
            ))
        
        return files
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_files(request: SearchRequest):
    try:
        logger.info(f"Received search request - Query: {request.query}, File IDs: {request.file_ids}")
        
        # Get vector store ID
        vector_store_id = get_or_create_vector_store()
        logger.info(f"Using vector store ID: {vector_store_id}")
        
        # Create an assistant with file search capabilities
        assistant = client.beta.assistants.create(
            name="File Search Assistant",
            instructions="""You are a helpful assistant that can search through files to answer questions. 
            When a user asks a question:
            1. If files are provided, use the file_search tool to find relevant information in those files
            2. If no files are provided or if the file search doesn't yield relevant results, respond based on your general knowledge
            3. Always prioritize information from the files when available
            4. If you find relevant information in the files, explicitly mention which file(s) the information came from""",
            model="gpt-4o",
            tools=[{"type": "file_search"}],
            tool_resources={
                "file_search": {
                    "vector_store_ids": [vector_store_id]
                }
            }
        )
        logger.info(f"Created assistant with ID: {assistant.id}")
        
        # Create a thread
        thread = client.beta.threads.create()
        logger.info(f"Created thread with ID: {thread.id}")
        
        # Add the user's message to the thread
        message = client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=request.query
        )
        
        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant.id
        )
        
        # Wait for the run to complete
        while True:
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )
            if run.status == "completed":
                break
            elif run.status in ["failed", "cancelled", "expired"]:
                raise HTTPException(status_code=500, detail=f"Run failed with status: {run.status}")
            await asyncio.sleep(1)
        
        # Get the assistant's response
        messages = client.beta.threads.messages.list(
            thread_id=thread.id
        )
        
        # Get the latest assistant message
        assistant_message = next(
            (msg for msg in messages.data if msg.role == "assistant"),
            None
        )
        
        if not assistant_message:
            raise HTTPException(status_code=500, detail="No response from assistant")
        
        # Format the response
        response = {
            "content": assistant_message.content[0].text.value,
            "file_references": []
        }
        
        # Extract file references from the message
        for content in assistant_message.content:
            if content.type == "text":
                # Look for file references in the text
                file_refs = re.findall(r'file[s]?\s+([^.,]+)', content.text.value, re.IGNORECASE)
                response["file_references"].extend(file_refs)
        
        return response
        
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    try:
        # Delete from OpenAI
        try:
            client.files.delete(file_id)
            logger.info(f"Deleted file from OpenAI: {file_id}")
        except Exception as e:
            logger.error(f"Failed to delete file from OpenAI: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file from OpenAI: {str(e)}"
            )
        
        return {"message": f"File {file_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}", response_model=FileInfo)
async def get_file_info(file_id: str):
    """
    Get information about a specific file by ID.
    """
    try:
        logger.info(f"Getting file info for ID: {file_id}")
        
        # Get vector store ID
        vector_store_id = get_or_create_vector_store()
        
        # Get file information from the vector store
        file_info = client.vector_stores.files.retrieve(
            vector_store_id=vector_store_id,
            file_id=file_id
        )
        
        # Convert to our FileInfo model
        return FileInfo(
            id=file_info.id,
            size=getattr(file_info, 'size', 0),
            content_type=getattr(file_info, 'content_type', 'application/octet-stream'),
            url=getattr(file_info, 'url', None)
        )
    except Exception as e:
        logger.error(f"Error getting file info: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}") 