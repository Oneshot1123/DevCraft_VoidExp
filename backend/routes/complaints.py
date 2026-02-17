from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile, Form
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import shutil
import os
import uuid

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
    # SECURITY: Only citizens can submit reports.
    if current_user.get("role") != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only public users can submit reports."
        )

    try:
        # 0. Pre-Processing (Normalization & Noise Removal)
        print(f"DEBUG: Processing complaint from user {current_user.get('sub')}")
        text = text.strip().replace("\n", " ")
        
        # 1. AI Analysis (NLP)
        print("DEBUG: Starting NLP analysis...")
        cat_result = classify_complaint(text)
        urg_result = calculate_urgency(text)
        
        category = cat_result["category"]
        urgency = urg_result["urgency"]
        department = route_complaint(category, urgency)
        print(f"DEBUG: NLP Result - Category: {category}, Urgency: {urgency}, Dept: {department}")
        
        # 1.1 Visual Analysis (If image provided)
        detections = []
        image_url = None
        if image:
            print(f"DEBUG: Processing image: {image.filename}")
            temp_filename = f"temp_{uuid.uuid4()}_{image.filename}"
            temp_path = os.path.join("temp_audio", temp_filename)
            os.makedirs("temp_audio", exist_ok=True)
            
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            detections = analyze_image(temp_path)
            boost = get_visual_urgency_boost(detections)
            if boost > 0 and urgency != 'critical':
                urgency = 'high'
            
            image_url = f"uploads/{image.filename}"
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
            print("DEBUG: Visual analysis complete.")

        # 1.2 Deduplication Check
        print("DEBUG: Starting deduplication check...")
        embedding = get_embedding(text)
        duplicate_group_id = find_duplicate_group(text, category)
        print(f"DEBUG: Deduplication result - GroupID: {duplicate_group_id}")
        
        # 2. Prepare Data for Database
        complaint_data = {
            "text": text,
            "location": location,
            "image_url": image_url,
            "category": category,
            "urgency": urgency,
            "department": department,
            "status": "submitted",
            "user_id": current_user.get("sub"),
            "timestamp": datetime.now().isoformat(),
            "embedding": embedding,
            "duplicate_group_id": duplicate_group_id
        }
        
        # 3. Insert into Database
        print("DEBUG: Inserting into Supabase...")
        # Use str() for safety if some values are complex types
        response = supabase.table("complaints").insert(complaint_data).execute()
        
        if not response.data:
            print(f"DEBUG: Supabase insertion failed. Response: {response}")
            raise HTTPException(status_code=500, detail="Failed to create complaint record")
            
        print("DEBUG: Complaint created successfully.")
        return response.data[0]
        
    except Exception as e:
        import traceback
        print(f"CRITICAL COMPLAINT ERROR: {str(e)}")
        traceback.print_exc()
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
        user_dept = current_user.get("department")
        
        if user_role == "citizen":
            query = query.eq("user_id", user_id)
        elif user_role == "officer" and user_dept:
            # STRICT SEGREGATION: Officers only see their own department's issues
            query = query.eq("department", user_dept)
            
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
