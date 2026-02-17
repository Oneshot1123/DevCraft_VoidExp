import sys
import os

# Add the current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Mocking the relative imports for standalone testing
try:
    from ml.classifier import classify_complaint
    from ml.urgency import calculate_urgency
    from ml.router import route_complaint
except Exception as e:
    print(f"Error importing modules: {e}")

def test_nlp():
    print("--- Testing NLP (BART-MNLI) ---")
    text = "Broken street light on Maple St, very dark and dangerous."
    # The labels in classifier.py are: 
    # ["sanitation", "roads_infra", "water", "electricity", "safety", "traffic", "other"]
    
    cat = classify_complaint(text)
    urg = calculate_urgency(text)
    dept = route_complaint(cat["category"], urg["urgency"])
    
    print(f"Report: {text}")
    print(f"AI Category: {cat['category']}")
    print(f"AI Urgency: {urg['urgency']}")
    print(f"Smart Route: {dept}")
    
    # Assert category is reasonable
    # Lighting often maps to 'electricity' or 'safety'
    assert cat["category"] in ["electricity", "safety", "roads_infra", "other"]
    assert urg["urgency"] in ["medium", "high", "critical"]

def test_vision_init():
    print("\n--- Testing Vision (YOLOv8) ---")
    from ml.vision import model
    print(f"YOLOv8 Model Loaded: {model.task}")

def test_voice_init():
    print("\n--- Testing Voice (Whisper) ---")
    from ml.voice import transcriber
    print(f"Whisper Pipeline Type: {transcriber.task}")

if __name__ == "__main__":
    try:
        test_nlp()
        test_vision_init()
        test_voice_init()
        print("\n[SUCCESS] CIVICSENSE AI PIPELINE VERIFIED!")
    except Exception as e:
        print(f"\n[ERROR] VERIFICATION FAILED: {str(e)}")
        sys.exit(1)
