FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Ensure the model cache directory is persistent/correct
ENV HF_HOME=/tmp/huggingface_cache

# Set the working directory
WORKDIR /app

# Install system dependencies for OpenCV, FFmpeg (Whisper), and YOLOv8
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Pre-download ML models during build to avoid slow first-run
# This caches the weights in the image layer
RUN mkdir -p /tmp/huggingface_cache && \
    python -c "from transformers import pipeline; \
    pipeline('zero-shot-classification', model='facebook/bart-large-mnli'); \
    pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english'); \
    pipeline('automatic-speech-recognition', model='openai/whisper-tiny')" && \
    python -c "from sentence_transformers import SentenceTransformer; \
    SentenceTransformer('all-MiniLM-L6-v2')"

# Ensure yolov8n.pt is available (it should be copied, but let's be safe)
# ultralytics will download it if not present

# Hugging Face Spaces runs as a specific user, we should ensure permissions
RUN chmod -R 777 /app /tmp/huggingface_cache

# HF Spaces expects port 7860
EXPOSE 7860

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
