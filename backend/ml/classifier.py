from transformers import pipeline
from typing import List

# Use BART-large-MNLI for zero-shot classification
# This model is robust for classifying text into arbitrary labels without fine-tuning
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Define the candidate labels based on the project requirements
CANDIDATE_LABELS = [
    "sanitation",
    "roads_infra",
    "water",
    "electricity",
    "safety",
    "traffic",
    "other"
]

def classify_complaint(text: str) -> dict:
    """
    Classifies the complaint text into one of the predefined categories.
    Returns a dictionary with the label and confidence score.
    """
    try:
        # Perform classification
        result = classifier(text, CANDIDATE_LABELS)
        
        # Extract the top prediction (labels and scores are sorted by confidence)
        top_label = result["labels"][0]
        confidence = result["scores"][0]
        
        return {
            "category": top_label,
            "confidence": confidence
        }
    except Exception as e:
        print(f"Error during classification: {e}")
        # Fallback to 'other' if classification fails
        return {
            "category": "other",
            "confidence": 0.0
        }
