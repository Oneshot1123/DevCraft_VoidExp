from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from ml.voice import transcribe_audio

router = APIRouter(prefix="/voice", tags=["Voice"])

UPLOAD_DIR = "temp_audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/transcribe")
async def transcribe_endpoint(file: UploadFile = File(...)):
    """
    Recieve an audio file, transcribe it to text, and return the result.
    """
    # Check if audio file
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio recording")
        
    # Generate unique filename to avoid collisions
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".wav"
    temp_filename = f"{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        # Save file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Transcribe
        text = transcribe_audio(temp_path)
        
        if text is None:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio")
            
        return {"text": text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
