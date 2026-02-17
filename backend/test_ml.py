import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ml.classifier import classify_complaint
from backend.ml.urgency import calculate_urgency
from backend.ml.router import route_complaint

def test_pipeline(text):
    print(f"\n--- Testing Complaint: '{text}' ---")
    
    # 1. Classification
    print("Classifying...")
    classification = classify_complaint(text)
    category = classification["category"]
    print(f"Category: {category} (Confidence: {classification['confidence']:.2f})")
    
    # 2. Urgency
    print("Scoring Urgency...")
    urgency_result = calculate_urgency(text)
    urgency = urgency_result["urgency"]
    print(f"Urgency: {urgency} (Reason: {urgency_result['reason']})")
    
    # 3. Routing
    print("Routing...")
    dept = route_complaint(category, urgency)
    print(f"Routed To: {dept}")

if __name__ == "__main__":
    # Test cases
    test_cases = [
        "There is a huge pothole on Main Street causing traffic jams.",
        "A live wire is sparking near the school!",
        "Garbage has not been collected for 2 weeks in Sector 5.",
        "I saw a man with a weapon near the park.",
        "Water supply is dirty and smells like sewage."
    ]
    
    print("Initializing AI models (this may take a moment)...")
    
    for text in test_cases:
        test_pipeline(text)
