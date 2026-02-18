import sys
import os
import bcrypt
import hashlib

# Add parent directory to path to allow absolute imports of 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import supabase

def _get_hashable_password(password: str) -> str:
    """Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit."""
    return hashlib.sha256(password.encode()).hexdigest()

def get_password_hash(password: str):
    # Pre-hash to bypass 72-byte limit and convert to bytes
    password_bytes = _get_hashable_password(password).encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def seed_users():
    print("Seeding users...")
    
    users = [
        {
            "email": "citizen@example.com",
            "password": "password123",
            "role": "citizen"
        },
        {
            "email": "admin@city.gov",
            "password": "adminpassword",
            "role": "city_admin"
        },
        # Seven Standardized Departmental Officers
        { "email": "sanitation@city.gov", "password": "password123", "role": "officer", "department": "sanitation" },
        { "email": "roads@city.gov", "password": "password123", "role": "officer", "department": "roads" },
        { "email": "water@city.gov", "password": "password123", "role": "officer", "department": "water" },
        { "email": "electricity@city.gov", "password": "password123", "role": "officer", "department": "electricity" },
        { "email": "safety@city.gov", "password": "password123", "role": "officer", "department": "safety" },
        { "email": "traffic@city.gov", "password": "password123", "role": "officer", "department": "traffic" },
        { "email": "general@city.gov", "password": "password123", "role": "officer", "department": "general" },
        { "email": "virajdchheda@gmail.com", "password": "123456", "role": "city_admin" },
    ]
    
    for user_info in users:
        print(f"Checking {user_info['email']}...")
        
        try:
            # Check if exists
            res = supabase.table("users").select("*").eq("email", user_info['email']).execute()
            
            # Create data
            user_data = {
                "email": user_info['email'],
                "hashed_password": get_password_hash(user_info['password']),
                "role": user_info['role'],
                "department": user_info.get("department")
            }

            if res.data:
                print(f"User {user_info['email']} already exists. Updating record with new hashing...")
                supabase.table("users").update(user_data).eq("email", user_info['email']).execute()
                continue
                
            # Insert if not exists
            supabase.table("users").insert(user_data).execute()
            print(f"User {user_info['email']} created.")
        except Exception as e:
            print(f"Error seeding user {user_info['email']}: {e}")

if __name__ == "__main__":
    seed_users()
