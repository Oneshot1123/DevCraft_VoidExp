import sys
import os
import asyncio

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

# Need to import dependencies from backend
# backend is at c:\Users\ADMIN\Desktop\DevCraft\backend
# but seed.py is at root

from backend.database import supabase
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
        {
            "email": "officer@city.gov",
            "password": "officerpassword",
            "role": "officer",
            "department": "Roads & Infrastructure"
        }
    ]
    
    for user_info in users:
        print(f"Checking {user_info['email']}...")
        
        try:
            # Check if exists
            res = supabase.table("users").select("*").eq("email", user_info['email']).execute()
            if res.data:
                print(f"User {user_info['email']} already exists.")
                continue
            
            # Create data
            user_data = {
                "email": user_info['email'],
                "hashed_password": get_password_hash(user_info['password']),
                "role": user_info['role']
            }
                
            # Insert - ignoring errors specific to constraint if select missed race condition
            supabase.table("users").insert(user_data).execute()
            print(f"User {user_info['email']} created.")
        except Exception as e:
            print(f"Error creating user {user_info['email']}: {e}")

if __name__ == "__main__":
    seed_users()
