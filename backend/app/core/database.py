
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from app.core.config import settings

# Azure PostgreSQL may require SSL
connect_args = {}
if settings.AZURE_DEPLOYMENT:
    connect_args = {"sslmode": "require"}

engine = create_engine(str(settings.DATABASE_URL), connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
