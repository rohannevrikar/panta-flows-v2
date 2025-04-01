
# Backend Services

This folder contains the FastAPI backend services for the application. It includes API endpoints for authentication, workflows, history management and chat functionality using LangChain.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Set up environment variables in `.env` file (create this file in the backend directory)

3. Run the application:
```
uvicorn main:app --reload
```

## API Documentation

Once running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
