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
# Import Geospatial utilities
from utils.geospatial import get_mumbai_ward, get_mumbai_area
# Import WebSocket manager
from sockets import manager

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/", response_model=ComplaintRead)
async def create_complaint(
    text: str = Form(...),
    location: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a new complaint. AI classifies, prioritizes and routes it automatically.
    Supports optional image upload for visual triage.
    """
    # All authenticated users can submit reports (citizens, officers, admins)
    # Role-based filtering happens on the GET endpoint

    try:
        # 0. Pre-Processing (Normalization & Noise Removal)
        print(f"DEBUG: Processing complaint from user {current_user.get('sub')}")
        text = text.strip().replace("\n", " ")
        
        # 1. AI Analysis (NLP)
        print(" [NEURAL] Initiating Multi-modal Analysis Protocol...")
        print(" [NLP] Executing Zero-Shot Classification & Urgency Calculation...")
        cat_result = classify_complaint(text)
        urg_result = calculate_urgency(text)
        
        category = cat_result["category"]
        urgency = urg_result["urgency"]
        department = route_complaint(category, urgency)
        print(f" [ANALYSIS] Category: {category} | Urgency: {urgency} | Dispatch: {department}")
        
        # 1.1 Geospatial Enrichment
        ward = "General"
        area = "Mumbai"
        if latitude and longitude:
            print(f"DEBUG: Performing geosearch for {latitude}, {longitude}")
            ward = get_mumbai_ward(latitude, longitude)
            area = get_mumbai_area(latitude, longitude)
            print(f"DEBUG: Geo Result - Ward: {ward}, Area: {area}")

        # 1.2 Multi-modal analysis (If image provided)
        detections = []
        image_url = None
        if image:
            print(f" [VISION] Processing visual signal: {image.filename}")
            temp_filename = f"temp_{uuid.uuid4()}_{image.filename}"
            temp_path = os.path.join("temp_uploads", temp_filename)
            os.makedirs("temp_uploads", exist_ok=True)
            
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            detections = analyze_image(temp_path)
            boost = get_visual_urgency_boost(detections)
            if boost > 0 and urgency != 'critical':
                urgency = 'high'
            
            image_url = f"uploads/{image.filename}"
            
            if os.path.exists(temp_path):
                os.remove(temp_path)
            print(" [VISION] Visual triage cycle complete.")

        # 1.2 Deduplication Check
        print(" [DEDUPLICATION] Checking for existing clusters...")
        embedding = get_embedding(text)
        duplicate_group_id = find_duplicate_group(text, category)
        print(f" [DEDUPLICATION] Cluster analysis result: {duplicate_group_id or 'New Signal'}")
        
        # 2. Prepare Data for Database
        complaint_data = {
            "text": text,
            "location": location,
            "image_url": image_url,
            "category": category,
            "urgency": urgency,
            "department": department,
            "status": "submitted",
            "latitude": latitude,
            "longitude": longitude,
            "ward": ward,
            "area": area,
            "user_id": current_user.get("sub"),
            "timestamp": datetime.now().isoformat(),
            "embedding": embedding,
            "duplicate_group_id": duplicate_group_id,
        }

        # 2.1 Calculate SLA SLA Estimation
        # HIGH/CRITICAL -> 2 hrs, MEDIUM -> 24 hrs, LOW -> 3 days
        sla_map = {
            "critical": "2 Hours",
            "high": "2 Hours",
            "medium": "24 Hours",
            "low": "3 Days"
        }
        sla_eta = sla_map.get(urgency.lower(), "24 Hours")
        complaint_data["sla_eta"] = sla_eta

        # 2.2 Determine Duplicate Count
        duplicate_count = 0
        if duplicate_group_id:
            try:
                dup_resp = supabase.table("complaints").select("id", count="exact").eq("duplicate_group_id", str(duplicate_group_id)).execute()
                if dup_resp.count:
                    duplicate_count = dup_resp.count
            except Exception:
                pass
        complaint_data["duplicate_count"] = duplicate_count
        
        # 3. Insert into Database
        print(" [STORAGE] Persisting state to Supabase...")
        # Use str() for safety if some values are complex types
        response = supabase.table("complaints").insert(complaint_data).execute()
        
        if not response.data:
            print(f" [ERROR] DB persistence failed. Response: {response}")
            raise HTTPException(status_code=500, detail="Failed to create complaint record")
            
        print(" [PROTOCOL] Complaint registered and dispatched successfully.")
        # 4. Broadcast Real-time Alert
        await manager.broadcast_to_channel(department, {
            "type": "NEW_COMPLAINT",
            "data": {
                "id": response.data[0]["id"],
                "category": category,
                "ward": ward,
                "urgency": urgency
            }
        })

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

@router.get("/analytics/ward-summary")
async def get_ward_summary(current_user: dict = Depends(get_current_user)):
    """
    Get complaint distribution by ward for admin analytics.
    """
    if current_user.get("role") != "city_admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        response = supabase.table("complaints").select("ward").execute()
        stats = {}
        for item in response.data:
            ward = item.get("ward") or "Unknown"
            stats[ward] = stats.get(ward, 0) + 1
        
        return [{"ward": k, "count": v} for k, v in stats.items()]
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
