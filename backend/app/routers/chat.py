from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from openai import AzureOpenAI
import json
import logging
import traceback
from .web_search import perform_search

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None

class ChatChoice(BaseModel):
    message: ChatMessage
    finish_reason: Optional[str] = None
    index: Optional[int] = 0

class ChatUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 800
    file_ids: Optional[List[str]] = None

class ChatResponse(BaseModel):
    id: str
    choices: List[ChatChoice]
    usage: ChatUsage

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_API_KEY"),
    api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_ENDPOINT")
)

# Define available tools
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information about a topic. IMPORTANT: Do not add any extra information to the search query that wasn't explicitly provided by the user. For example, if the user asks for 'latest IPL results', do not add '2023' or any other year unless the user specifically mentioned it. After receiving search results, analyze them thoroughly and provide a comprehensive summary of the information found, rather than just listing links. Extract and present the most relevant facts, figures, and details from the search results.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find current information. Use exactly what the user asked for without adding any extra context or years."
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "file_search",
            "description": "Search through uploaded files for relevant information. After receiving search results, analyze them thoroughly and provide a comprehensive summary of the information found. Extract and present the most relevant facts, figures, and details from the files.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to find information in the uploaded files."
                    },
                    "file_ids": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "List of specific file IDs to search within. If not provided, searches all files."
                    }
                },
                "required": ["query", "file_ids"]
            }
        }
    }
]

def convert_openai_response_to_dict(response) -> dict:
    """
    Convert OpenAI response object to a dictionary format that matches our models.
    """
    return {
        "id": response.id,
        "choices": [{
            "message": {
                "role": choice.message.role,
                "content": choice.message.content,
                "tool_calls": [
                    {
                        "id": tool_call.id,
                        "type": tool_call.type,
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments
                        }
                    } for tool_call in (choice.message.tool_calls or [])
                ] if choice.message.tool_calls else None
            },
            "finish_reason": choice.finish_reason,
            "index": choice.index
        } for choice in response.choices],
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    }

async def process_tool_calls(tool_calls: List[Dict[str, Any]], file_ids: Optional[List[str]] = None) -> List[ChatMessage]:
    """
    Process tool calls and return results as chat messages.
    """
    try:
        logger.debug(f"Processing tool calls: {json.dumps(tool_calls, indent=2)}")
        logger.debug(f"File IDs for search: {file_ids}")
        tool_messages = []
        
        for tool_call in tool_calls:
            logger.debug(f"Processing tool call: {json.dumps(tool_call, indent=2)}")
            
            if tool_call["function"]["name"] == "web_search":
                try:
                    args = json.loads(tool_call["function"]["arguments"])
                    query = args["query"]
                    max_results = args.get("max_results", 5)
                    
                    logger.debug(f"Performing web search with query: {query}, max_results: {max_results}")
                    
                    # Perform web search asynchronously
                    search_results = await perform_search(query, max_results)
                    logger.debug(f"Search results: {json.dumps(search_results, indent=2)}")
                    
                    if search_results:
                        # Format the results with clear instructions for the LLM
                        results_text = "Here are the search results. Please analyze these thoroughly and provide a comprehensive summary of the information found, rather than just listing links. Extract and present the most relevant facts, figures, and details:\n\n"
                        
                        for i, result in enumerate(search_results, 1):
                            results_text += f"Result {i}:\n"
                            results_text += f"Title: {result['title']}\n"
                            results_text += f"URL: {result['url']}\n"
                            
                            # Include content summary if available
                            if result.get('content_summary'):
                                results_text += f"Content Summary: {result['content_summary']}\n"
                            
                            # Include key points if available
                            if result.get('key_points') and len(result['key_points']) > 0:
                                results_text += "Key Points:\n"
                                for point in result['key_points']:
                                    results_text += f"- {point}\n"
                            
                            # Include snippet as fallback
                            if result.get('snippet'):
                                results_text += f"Snippet: {result['snippet']}\n"
                            
                            results_text += "\n"
                        
                        tool_messages.append(ChatMessage(
                            role="tool",
                            content=results_text,
                            name="web_search",
                            tool_call_id=tool_call["id"]
                        ))
                    else:
                        tool_messages.append(ChatMessage(
                            role="tool",
                            content="No relevant search results found.",
                            name="web_search",
                            tool_call_id=tool_call["id"]
                        ))
                except Exception as e:
                    logger.error(f"Error in web search: {str(e)}")
                    logger.error(traceback.format_exc())
                    tool_messages.append(ChatMessage(
                        role="tool",
                        content=f"Error performing web search: {str(e)}",
                        name="web_search",
                        tool_call_id=tool_call["id"]
                    ))
            elif tool_call["function"]["name"] == "file_search":
                try:
                    args = json.loads(tool_call["function"]["arguments"])
                    query = args["query"]
                    # Use file_ids from the request if available, otherwise use any provided in the tool call
                    search_file_ids = file_ids if file_ids is not None else args.get("file_ids", [])
                    
                    logger.debug(f"Performing file search with query: {query}, file_ids: {search_file_ids}")
                    
                    # Import the search_files function from files router
                    from .files import search_files
                    from .files import SearchRequest
                    
                    # Create search request
                    search_request = SearchRequest(query=query, file_ids=search_file_ids if search_file_ids else None)
                    
                    # Perform file search
                    search_results = await search_files(search_request)
                    logger.debug(f"File search results: {json.dumps(search_results, indent=2)}")
                    
                    if search_results and search_results.get("content"):
                        # Format the results with clear instructions for the LLM
                        results_text = "Here are the search results from the uploaded files. Please analyze these thoroughly and provide a comprehensive summary of the information found:\n\n"
                        
                        # Add the main response
                        results_text += f"Response: {search_results['content']}\n\n"
                        
                        # Add file citations if available
                        if search_results.get("file_citations"):
                            results_text += "File Citations:\n"
                            for citation in search_results["file_citations"]:
                                results_text += f"File ID: {citation['file_id']}\n"
                                results_text += f"Quote: {citation['quote']}\n\n"
                        
                        tool_messages.append(ChatMessage(
                            role="tool",
                            content=results_text,
                            name="file_search",
                            tool_call_id=tool_call["id"]
                        ))
                    else:
                        tool_messages.append(ChatMessage(
                            role="tool",
                            content="No relevant information found in the uploaded files.",
                            name="file_search",
                            tool_call_id=tool_call["id"]
                        ))
                except Exception as e:
                    logger.error(f"Error in file search: {str(e)}")
                    logger.error(traceback.format_exc())
                    tool_messages.append(ChatMessage(
                        role="tool",
                        content=f"Error performing file search: {str(e)}",
                        name="file_search",
                        tool_call_id=tool_call["id"]
                    ))
        
        return tool_messages
    except Exception as e:
        logger.error(f"Error in process_tool_calls: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@router.post("/completions", response_model=ChatResponse)
async def create_chat_completion(request: ChatRequest):
    try:
        logger.debug("Received chat completion request")
        logger.debug(f"Request messages: {json.dumps([msg.dict() for msg in request.messages], indent=2)}")
        logger.debug(f"File IDs: {request.file_ids}")

        # Add a system message about available files if file_ids are provided
        messages_for_openai = [{"role": msg.role, "content": msg.content} 
                             for msg in request.messages]
        
        if request.file_ids and len(request.file_ids) > 0:
            # Get file information from the database
            from .files import get_file_info
            file_infos = []
            for file_id in request.file_ids:
                try:
                    file_info = await get_file_info(file_id)
                    if file_info:
                        file_infos.append(file_info)
                except Exception as e:
                    logger.error(f"Error getting file info for {file_id}: {str(e)}")
            
            if file_infos:
                file_ids = [info.id for info in file_infos]
                file_info_message = {
                    "role": "system",
                    "content": f"The following files are available for searching: {', '.join(file_ids)}. You MUST use the file_search tool to search through these files before responding to the user's question."
                }
                messages_for_openai.insert(0, file_info_message)

        # First, let the model decide if it needs to use tools
        try:
            initial_response = client.chat.completions.create(
                model=os.getenv("AZURE_DEPLOYMENT_NAME"),
                messages=messages_for_openai,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                tools=TOOLS,
                tool_choice="auto"
            )
            logger.debug("Got initial response from OpenAI")
            logger.debug(f"Initial response: {json.dumps(initial_response.model_dump(), indent=2)}")
        except Exception as e:
            logger.error(f"Error in initial OpenAI call: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

        try:
            # Convert the initial response to our format
            response_dict = convert_openai_response_to_dict(initial_response)
            logger.debug(f"Converted response: {json.dumps(response_dict, indent=2)}")
        except Exception as e:
            logger.error(f"Error converting OpenAI response: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error processing OpenAI response: {str(e)}")

        # Check if the model wants to use any tools
        if (response_dict["choices"][0]["message"].get("tool_calls")):
            logger.debug("Tool calls detected, processing...")
            try:
                # Process tool calls asynchronously
                tool_messages = await process_tool_calls(
                    response_dict["choices"][0]["message"]["tool_calls"],
                    request.file_ids  # Pass file_ids to process_tool_calls
                )
                logger.debug(f"Tool messages: {json.dumps([msg.dict() for msg in tool_messages], indent=2)}")
                
                # Create final response with tool results
                final_messages = [
                    *[{"role": msg.role, "content": msg.content} 
                      for msg in request.messages],
                    {
                        "role": "assistant",
                        "content": response_dict["choices"][0]["message"]["content"],
                        "tool_calls": response_dict["choices"][0]["message"]["tool_calls"]
                    },
                    *[{
                        "role": msg.role,
                        "content": msg.content,
                        "name": msg.name,
                        "tool_call_id": msg.tool_call_id
                    } for msg in tool_messages],
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that provides comprehensive analysis of search results from both web searches and uploaded files. When responding to the user, do not simply list links or sources. Instead, analyze the search results thoroughly and provide a well-structured summary of the information found. Extract and present the most relevant facts, figures, and details. Organize your response in a clear, readable format with appropriate headings and bullet points where needed. When citing information, clearly indicate whether it came from web search results or uploaded files."
                    }
                ]

                logger.debug(f"Sending final messages: {json.dumps(final_messages, indent=2)}")
                
                final_response = client.chat.completions.create(
                    model=os.getenv("AZURE_DEPLOYMENT_NAME"),
                    messages=final_messages,
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                )
                
                return convert_openai_response_to_dict(final_response)
            except Exception as e:
                logger.error(f"Error processing tool calls: {str(e)}")
                logger.error(traceback.format_exc())
                raise HTTPException(status_code=500, detail=f"Error processing tool calls: {str(e)}")
        
        logger.debug("No tool calls needed, returning initial response")
        return response_dict

    except Exception as e:
        logger.error(f"Unhandled error in create_chat_completion: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))