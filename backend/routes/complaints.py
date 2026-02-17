from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import shutil
import os

# Import database client
from database import supabase
# Import Pydantic models
from models.complaint import ComplaintRead, ComplaintUpdate
# Import ML pipeline functions
from ml.classifier import classify_complaint
from ml.urgency import calculate_urgency
from ml.router import route_complaint
from ml.duplicates import get_embedding, find_duplicate_group
from ml.vision import analyze_image, get_visual_urgency_boost
# Import auth dependency to get current user
from auth.dependencies import get_current_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/", response_model=ComplaintRead)
async def create_complaint(
    text: str = Form(...),
    location: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a new complaint. AI classifies, prioritizes and routes it automatically.
    Supports optional image upload for visual triage.
    """
    try:
        # 1. AI Analysis (NLP)
        cat_result = classify_complaint(text)
        urg_result = calculate_urgency(text)
        
        category = cat_result["category"]
        urgency = urg_result["urgency"]
        department = route_complaint(category, urgency)
        
        # 1.1 Visual Analysis (If image provided)
        detections = []
        image_url = None
        if image:
            # Save temp image for processing
            temp_filename = f"temp_{uuid_name()}_{image.filename}"
            temp_path = os.path.join("temp_audio", temp_filename) # reusing temp folder
            os.makedirs("temp_audio", exist_ok=True)
            
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            detections = analyze_image(temp_path)
            # Boost urgency if critical infrastructure is detected
            boost = get_visual_urgency_boost(detections)
            if boost > 0 and urgency != 'critical':
                urgency = 'high' # Simple boost logic
            
            # In real app, upload to Supabase Storage. For MVP, we'll use a placeholder.
            image_url = f"uploads/{image.filename}"
            
            # Note: detections logic is run, we could store 'detections' in a JSONB column 
            # if the schema supported it. For now, it just impacts 'urgency'.
            
            if os.path.exists(temp_path):
                os.remove(temp_path)

        # 1.2 Deduplication Check
        embedding = get_embedding(text)
        duplicate_group_id = find_duplicate_group(text, category)
        
        # 2. Prepare Data for Database
        complaint_data = {
            "text": text,
            "location": location,
            "image_url": image_url,
            "category": category,
            "urgency": urgency,
            "department": department,
            "status": "pending",
            "user_id": current_user.get("sub"),
            "timestamp": datetime.now().isoformat(),
            "embedding": embedding,
            "duplicate_group_id": duplicate_group_id
        }
        
        # 3. Insert into Database
        response = supabase.table("complaints").insert(complaint_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create complaint record")
            
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing complaint: {str(e)}")

def uuid_name():
    import uuid
    return str(uuid.uuid4())[:8]

@router.get("/", response_model=List[ComplaintRead])
async def get_complaints(
    department: Optional[str] = None,
    urgency: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = supabase.table("complaints").select("*")
        if department: query = query.eq("department", department)
        if urgency: query = query.eq("urgency", urgency)
        if status: query = query.eq("status", status)
            
        user_role = current_user.get("role")
        user_id = current_user.get("sub")
        
        if user_role == "citizen":
            query = query.eq("user_id", user_id)
            
        response = query.order("timestamp", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{complaint_id}", response_model=ComplaintRead)
async def get_complaint(complaint_id: UUID, current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("complaints").select("*").eq("id", str(complaint_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{complaint_id}", response_model=ComplaintRead)
async def update_complaint(
    complaint_id: UUID, 
    update_data: ComplaintUpdate,
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    if role not in ["officer", "city_admin"]:
         raise HTTPException(status_code=403, detail="Only officers and admins can update")

    try:
        data_to_update = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not data_to_update:
             raise HTTPException(status_code=400, detail="No data provided")

        response = supabase.table("complaints").update(data_to_update).eq("id", str(complaint_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Complaint not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
