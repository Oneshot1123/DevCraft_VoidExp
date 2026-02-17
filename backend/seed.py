import sys
import os
import asyncio

# Add parent directory to path to allow absolute imports of 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import supabase
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

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
                print(f"User {user_info['email']} already exists. Updating record...")
                supabase.table("users").update(user_data).eq("email", user_info['email']).execute()
                continue
                
            # Insert if not exists
            supabase.table("users").insert(user_data).execute()
            print(f"User {user_info['email']} created.")
        except Exception as e:
            print(f"Error creating user {user_info['email']}: {e}")

if __name__ == "__main__":
    seed_users()
