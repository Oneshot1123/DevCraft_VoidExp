from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from config import settings
from auth.jwt_handler import verify_token
# Import typing
from typing import Optional

# Define the OAuth2 scheme (bearer token in header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependency to get the current user from the token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Verify and decode the token
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return the payload (contains user_id, email, role)
    return payload

# Dependency factory for role-based access control
class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        # Check if the user's role is in the allowed list
        if user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user

# Pre-defined checkers for common roles
allow_admin = RoleChecker(["city_admin"])
allow_officer = RoleChecker(["officer", "city_admin"])
allow_citizen = RoleChecker(["citizen", "city_admin"]) # Admins can do everything
