from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import chat, cosmos, files, web_search

app = FastAPI(title="Panta Flows API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(cosmos.router, prefix="/api/cosmos", tags=["cosmos"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(web_search.router, prefix="/api/web-search", tags=["web-search"])

@app.get("/")
async def root():
    return {"message": "Welcome to Panta Flows API"} 