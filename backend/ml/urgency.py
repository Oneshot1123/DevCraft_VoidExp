from transformers import pipeline
import re

# Use a lightweight model for sentiment analysis to gauge negativity/stress
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Keywords that indicate high urgency or danger
# Focused on life safety, immediate hazards, and severe infrastructure failure
CRITICAL_KEYWORDS = [
    "fire", "explosion", "spark", "electric shock", "wire exposed", 
    "blood", "injury", "accident", "collapse", "drowning", "flood", 
    "gas leak", "attack", "fight", "weapon", "emergency"
]

HIGH_KEYWORDS = [
    "blocked", "stuck", "broken", "overflow", "sewage", "stench", 
    "dark", "unsafe", "robbery", "theft", "crash", "urgent", "immediate"
]

MEDIUM_KEYWORDS = [
    "pothole", "garbage", "litter", "water leak", "no water", 
    "streetlight", "sign", "traffic jam", "noise", "dirty"
]

def calculate_urgency(text: str) -> dict:
    """
    Determines the urgency level based on keyword severity and sentiment analysis.
    Returns a dictionary with urgency level and reasoning.
    """
    text_lower = text.lower()
    
    # 1. Check for Critical Keywords (Highest Priority)
    for word in CRITICAL_KEYWORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return {
                "urgency": "critical",
                "reason": f"Critical keyword detected: '{word}'"
            }
            
    # 2. Check for High Urgency Keywords
    for word in HIGH_KEYWORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return {
                "urgency": "high",
                "reason": f"High urgency keyword detected: '{word}'"
            }
            
    # 3. Sentiment Analysis for Nuance
    # If the sentiment is overwhelmingly negative, bump up urgency
    try:
        sentiment = sentiment_analyzer(text)[0]
        is_negative = sentiment["label"] == "NEGATIVE"
        score = sentiment["score"]
        
        if is_negative and score > 0.95:
             return {
                "urgency": "high",
                "reason": f"Extremely negative sentiment ({score:.2f})"
            }
    except Exception as e:
        print(f"Sentiment analysis failed: {e}")

    # 4. Check for Medium Urgency Keywords
    for word in MEDIUM_KEYWORDS:
        if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
            return {
                "urgency": "medium",
                "reason": f"Medium urgency keyword detected: '{word}'"
            }
            
    # Default to Low Urgency
    return {
        "urgency": "low",
        "reason": "No urgent keywords or sufficient negative sentiment detected"
    }
