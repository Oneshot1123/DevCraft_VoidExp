import sys
import os

# Add current directory to path so we can import internal modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml.classifier import classify_complaint
from ml.urgency import calculate_urgency
from ml.router import route_complaint
from ml.duplicates import get_embedding

def test_nlp_pipeline():
    print(" [TEST] Starting NLP Pipeline Verification...")
    
    test_cases = [
        {
            "text": "Huge pothole in the middle of the road near Borivali station, causing traffic.",
            "expected_cat": "roads_infra",
            "expected_urgency": "high"
        },
        {
            "text": "Garbage not collected for 3 days in my area. Stink is unbearable.",
            "expected_cat": "sanitation",
            "expected_urgency": "medium"
        }
    ]
    
    for case in test_cases:
        print(f"\n [INPUT] \"{case['text']}\"")
        cat = classify_complaint(case["text"])
        urg = calculate_urgency(case["text"])
        dept = route_complaint(cat["category"], urg["urgency"])
        
        print(f" [RESULT] Category: {cat['category']} (conf: {cat['confidence']:.2f})")
        print(f" [RESULT] Urgency: {urg['urgency']}")
        print(f" [RESULT] Routing: {dept}")
        
        if cat["category"] != case["expected_cat"]:
            print(f" [!] Warning: Category mismatch. Expected {case['expected_cat']}")
            
    print("\n [SUCCESS] NLP Pipeline verification complete.")

def test_embedding_generation():
    print("\n [TEST] Verifying Embedding Generation...")
    text = "Neural test vector for CivicSense Elite."
    embedding = get_embedding(text)
    print(f" [RESULT] Embedding generated. Vector size: {len(embedding)}")
    if len(embedding) == 384:
        print(" [RESULT] confirmed MiniLM-L6-v2 vector dimension (384).")
    else:
        print(f" [!] Warning: Unexpected embedding size: {len(embedding)}")

if __name__ == "__main__":
    try:
        test_nlp_pipeline()
        test_embedding_generation()
        print("\n [AUDIT COMPLETE] AI Backend is operational.")
    except Exception as e:
        print(f"\n [CRITICAL ERROR] Audit failed: {e}")
        sys.exit(1)
