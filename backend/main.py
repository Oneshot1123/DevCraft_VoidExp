from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes import auth, complaints, voice
from sockets import manager

load_dotenv()

app = FastAPI(
    title="CivicSense API",
    description="AI-Driven Municipal Issue Triage & Prioritization System",
    version="0.1.0"
)

# CORS Configuration - Permissive for JWT-based auth
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False, # JWT auth doesn't need credentials/cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(voice.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "CivicSense API is running"}

@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(websocket, channel)
    try:
        while True:
            # Keep connection alive, though we mainly broadcast
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
