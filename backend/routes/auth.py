# Import FastAPI tools
from fastapi import APIRouter, HTTPException, status, Depends
# Import OAuth2PasswordRequestForm if we wanted standard form login, but we use JSON body here
# Import database client
from database import supabase
# Import models
from models.user import UserCreate, UserLogin, UserRead, Token
# Import auth handler utils
from auth.jwt_handler import create_access_token
# Import password hashing utils
import bcrypt
import hashlib

# Create a router for auth endpoints
router = APIRouter(prefix="/auth", tags=["Auth"])

def _get_hashable_password(password: str) -> str:
    """Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit."""
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to hash passwords
def get_password_hash(password: str):
    # Pre-hash to bypass 72-byte limit and convert to bytes
    password_bytes = _get_hashable_password(password).encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# Helper function to verify passwords
def verify_password(plain_password: str, hashed_password: str):
    password_bytes = _get_hashable_password(plain_password).encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)

# Endpoint for user registration
@router.post("/register", response_model=UserRead)
async def register(user: UserCreate):
    # Hash the password before storing
    hashed_pw = get_password_hash(user.password)
    
    # SECURITY: Only 'citizen' role can be registered via public signup.
    # Officer and Admin roles are seeded by the system only.
    role = "citizen"
    department = None

    # Prepare user data
    user_data = {
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": role,
        "department": department
    }

    try:
        # Attempt to insert into Supabase 'users' table
        response = supabase.table("users").insert(user_data).execute()
        
        # Check if we got data back
        if not response.data:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        # Return the created user (first item in data list)
        return response.data[0]
        
    except Exception as e:
        # Handle unique constraint violations or other DB errors
        # In production, parse specific error codes for better messages
        raise HTTPException(status_code=400, detail=f"Error registering user: {str(e)}")

# Endpoint for user login
@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        # Query Supabase for the user with this email
        response = supabase.table("users").select("*").eq("email", user.email).execute()
        
        # If no user found
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Incorrect email or password"
            )
            
        # Get the user record
        db_user = response.data[0]
        
        # Verify the password
        if not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Incorrect email or password"
            )
            
        # Create JWT access token
        # Payload includes user ID, email, role, and department
        access_token = create_access_token(
            data={
                "sub": db_user["id"], 
                "email": db_user["email"], 
                "role": db_user["role"],
                "department": db_user.get("department")
            }
        )
        
        # Return the token, role, and department
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "role": db_user["role"],
            "department": db_user.get("department")
        }
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=str(e))
