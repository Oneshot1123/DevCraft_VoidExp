from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes import auth, complaints, voice

load_dotenv()

app = FastAPI(
    title="CivicSense API",
    description="AI-Driven Municipal Issue Triage & Prioritization System",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default port
    "*" # Allow all for development easier
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(voice.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "CivicSense API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
