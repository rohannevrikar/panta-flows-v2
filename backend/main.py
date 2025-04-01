
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.api.routes import auth, workflows, history, chat
from app.core.config import settings

app = FastAPI(
    title="Panta Backend API",
    description="Backend services for the Panta application",
    version="1.0.0",
    root_path=settings.ROOT_PATH,  # For Azure deployment behind proxy
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["Workflows"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "Panta API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Azure"""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
