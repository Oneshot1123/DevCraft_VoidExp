# Import Pydantic's BaseModel and Field for data validation
from pydantic import BaseModel, EmailStr, Field
# Import Optional and List types
from typing import Optional
# Import UUID type
from uuid import UUID

# Schema for user registration
class UserCreate(BaseModel):
    # Email must be a valid email format
    email: EmailStr
    # Password must be provided
    password: str
    # Role must be one of the allowed roles
    role: str = Field(..., pattern="^(citizen|officer|city_admin)$")
    # Department is optional, mostly for officers
    department: Optional[str] = None

# Schema for user login
class UserLogin(BaseModel):
    # Email for login
    email: EmailStr
    # Password for login
    password: str

# Schema for reading user public data (response model)
class UserRead(BaseModel):
    # Unique ID of the user
    id: UUID
    # User's email
    email: EmailStr
    # User's role
    role: str
    # User's department (if officer)
    department: Optional[str] = None

    class Config:
        # Allow creating model from arbitrary attributes (ORM mode-like)
        from_attributes = True

# Schema for the token response
class Token(BaseModel):
    # The access token string
    access_token: str
    # The token type (usually "bearer")
    token_type: str
    # User's role (for client-side routing)
    role: str
