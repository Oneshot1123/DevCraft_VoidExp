from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# Base schema for shared properties
class ComplaintBase(BaseModel):
    # The complaint text is mandatory
    text: str
    # Optional location string
    location: Optional[str] = None
    # Optional image URL
    image_url: Optional[str] = None
    # Optional audio URL (for voice inputs)
    audio_url: Optional[str] = None

# Schema for creating a complaint (input)
class ComplaintCreate(ComplaintBase):
    pass

# Schema for updating a complaint (status/department only usually)
class ComplaintUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(submitted|assigned|in_progress|resolved|rejected)$")
    department: Optional[str] = None
    urgency: Optional[str] = None

# Schema for reading a complaint (output)
class ComplaintRead(ComplaintBase):
    id: UUID
    # AI-generated fields
    category: str
    urgency: str
    department: str
    status: str
    timestamp: datetime
    # User ID if authenticated (nullable for anonymous reports if allowed, but schema says user_id REFERENCES users)
    # PRD says "Citizen submit complaint", implies auth. Schema enforces user_id?
    # Let's make it optional in read model just in case of anon reports later
    user_id: Optional[UUID] = None
    duplicate_group_id: Optional[UUID] = None

    class Config:
        from_attributes = True
