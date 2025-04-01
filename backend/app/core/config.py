
from pydantic import BaseSettings, PostgresDsn
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Panta Backend"
    
    # Database
    DATABASE_URL: PostgresDsn = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/yourdb")
    
    # Azure specific configuration
    AZURE_DEPLOYMENT: bool = os.getenv("AZURE_DEPLOYMENT", "false").lower() == "true"
    ROOT_PATH: str = os.getenv("ROOT_PATH", "")
    
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # In production, replace with specific origins
    ALLOWED_HOSTS: List[str] = ["*"]  # For Azure App Service

    class Config:
        case_sensitive = True

settings = Settings()
