
import os
from typing import Optional
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.llms import OpenAI

# A simple in-memory cache for demonstration purposes
# In production, use a proper cache solution
conversation_memories = {}

async def generate_chat_response(
    message: str, 
    workflow_type: str = "Chat Assistant",
    session_id: Optional[str] = None
) -> str:
    """
    Generate a response using LangChain based on the workflow type
    """
    try:
        # Get API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return "Error: OpenAI API key not configured. Please contact support."
            
        # Create or retrieve conversation memory
        memory_key = session_id or "default"
        if memory_key not in conversation_memories:
            conversation_memories[memory_key] = ConversationBufferMemory()
            
        memory = conversation_memories[memory_key]
        
        # Configure LLM based on workflow type
        temperature = 0.7  # Default temperature
        
        if workflow_type == "Code Helper":
            temperature = 0.2  # More precise for code
        elif workflow_type == "Image Creator" or workflow_type == "Music Composer":
            temperature = 0.9  # More creative
            
        # Create the language model
        llm = OpenAI(
            temperature=temperature, 
            openai_api_key=api_key,
            max_tokens=1000
        )
        
        # Create the conversation chain
        conversation = ConversationChain(
            llm=llm,
            memory=memory,
            verbose=True
        )
        
        # Generate the response
        response = conversation.predict(input=message)
        
        return response
        
    except Exception as e:
        print(f"Error generating chat response: {e}")
        return f"I'm sorry, there was an error processing your request. Details: {str(e)}"
