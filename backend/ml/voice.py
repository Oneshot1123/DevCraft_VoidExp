from transformers import pipeline
import torch
from typing import Optional

# Load Whisper tiny model for fast speech-to-text
# We use 'openai/whisper-tiny' because it's lightweight and efficient for CPUs
# device="cuda:0" if torch.cuda.is_available() else "cpu"
transcriber = pipeline(
    "automatic-speech-recognition", 
    model="openai/whisper-tiny",
    device="cpu" # Forcing CPU for broader compatibility in local dev
)

def transcribe_audio(audio_path: str) -> Optional[str]:
    """
    Transcribe the given audio file using Whisper.
    Supports wav, mp3, m4a, etc.
    """
    try:
        print(f"Transcribing audio: {audio_path}...")
        result = transcriber(audio_path)
        return result.get("text", "").strip()
    except Exception as e:
        print(f"Transcription error: {e}")
        return None
