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
from passlib.context import CryptContext

# Create a router for auth endpoints
router = APIRouter(prefix="/auth", tags=["Auth"])

# Initialize password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper function to hash passwords
def get_password_hash(password):
    return pwd_context.hash(password)

# Helper function to verify passwords
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Endpoint for user registration
@router.post("/register", response_model=UserRead)
async def register(user: UserCreate):
    # Hash the password before storing
    hashed_pw = get_password_hash(user.password)
    
    # Prepare user data
    user_data = {
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": user.role,
        "department": user.department
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
        # Payload includes user ID, email, and role
        access_token = create_access_token(
            data={"sub": db_user["id"], "email": db_user["email"], "role": db_user["role"]}
        )
        
        # Return the token and role
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "role": db_user["role"]
        }
        
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=str(e))
