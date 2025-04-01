
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("Error: DATABASE_URL not set in .env file")
    sys.exit(1)

try:
    # Create engine
    engine = create_engine(database_url)
    
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        print(f"Created database")
    
    # Import and create all tables from models
    from app.core.database import Base
    from app.models.user import User, UserRole
    from app.models.client import Client
    from app.models.workflow import Workflow
    from app.models.history import HistoryItem
    from app.models.chat import ChatSession, ChatMessage
    
    Base.metadata.create_all(bind=engine)
    print("Successfully created all database tables")
    
except Exception as e:
    print(f"Error initializing database: {e}")
    sys.exit(1)
