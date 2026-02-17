from ultralytics import YOLO
from typing import List, Dict, Any
import os

# Load the nano YOLOv3 model (6.2MB) - standard weights detect 80 COCO classes
# This will be enough to detect 'fire hydrant', 'bench', 'traffic light', etc.
# For a production app, we would use a custom-trained model for potholes/graffiti.
model = YOLO('yolov8n.pt')

def analyze_image(image_path: str) -> List[Dict[str, Any]]:
    """
    Analyze an image using YOLOv8 to detect relevant municipal infrastructure.
    Returns a list of detected objects with confidence scores.
    """
    try:
        if not os.path.exists(image_path):
            return []
            
        # Run inference
        results = model(image_path)
        
        detections = []
        for result in results:
            for box in result.boxes:
                # Class name
                cls_id = int(box.cls[0])
                name = result.names[cls_id]
                conf = float(box.conf[0])
                
                # Check for interesting classes
                # In this demo, we'll map standard COCO classes to "vandalism" or "infrastructure"
                # e.g., 'fire hydrant', 'bench', 'traffic light', 'stop sign'
                if conf > 0.3:
                    detections.append({
                        "object": name,
                        "confidence": round(conf, 2)
                    })
                    
        return detections
        
    except Exception as e:
        print(f"Vision analysis error: {e}")
        return []

def get_visual_urgency_boost(detections: List[Dict[str, Any]]) -> float:
    """
    Calculate an urgency score boost based on detected objects.
    e.g. detecting a 'fire hydrant' or 'traffic light' in an issue report
    might increase its priority.
    """
    # Simple heuristic
    priority_objects = ["fire hydrant", "traffic light", "stop sign"]
    for d in detections:
        if d["object"] in priority_objects:
            return 2.0 # High boost
    return 0.0
