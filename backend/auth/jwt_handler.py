from datetime import datetime, timedelta
# Import the timezone module to handle timezones correctly
from datetime import timezone
# Import types for type hinting
from typing import Optional, Dict

# Import JWT library for encoding and decoding tokens
from jose import jwt, JWTError
# Import config settings to access secret keys
from config import settings

# Function to create a new access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    # Create a copy of the data to avoid mutating the original dictionary
    to_encode = data.copy()
    
    # Determine the expiration time
    if expires_delta:
        # If a custom expiration is provided, add it to the current UTC time
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Otherwise use the default expiration from settings (30 minutes)
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add the expiration claim to the token data
    to_encode.update({"exp": expire})
    
    # Encode the token using the secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    # Return the encoded JWT string
    return encoded_jwt

# Function to verify and decode an access token
def verify_token(token: str) -> Optional[Dict]:
    try:
        # Attempt to decode the token using the secret key and algorithm
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        # Return the payload if successful
        return payload
    except JWTError:
        # Return None if the token is invalid or expired
        return None
