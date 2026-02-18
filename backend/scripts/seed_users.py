import os
import hashlib
import bcrypt
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # We need service role for high-privilege operations

if not SUPABASE_KEY:
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    print("WARNING: Using regular Key instead of SERVICE_ROLE_KEY. Deletions may fail if RLS is strict.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    # Pre-hash to bypass bcrypt 72-byte limit as per current auth.py logic
    sha_hash = hashlib.sha256(pwd_bytes).hexdigest().encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(sha_hash, salt)
    return hashed.decode('utf-8')

DEPARTMENTS = [
    "sanitation",
    "roads",
    "water",
    "electricity",
    "safety",
    "traffic",
    "general"
]

CREDENTIALS = [
    {"email": "admin@civicsense.gov", "password": "Admin#Secret2026", "role": "city_admin", "dept": None},
    {"email": "officer.sanitation@civicsense.gov", "password": "Sanitation#2026", "role": "officer", "dept": "sanitation"},
    {"email": "officer.roads@civicsense.gov", "password": "Roads#2026", "role": "officer", "dept": "roads"},
    {"email": "officer.water@civicsense.gov", "password": "Water#2026", "role": "officer", "dept": "water"},
    {"email": "officer.electricity@civicsense.gov", "password": "Electricity#2026", "role": "officer", "dept": "electricity"},
    {"email": "officer.safety@civicsense.gov", "password": "Safety#2026", "role": "officer", "dept": "safety"},
    {"email": "officer.traffic@civicsense.gov", "password": "Traffic#2026", "role": "officer", "dept": "traffic"},
    {"email": "officer.general@civicsense.gov", "password": "General#2026", "role": "officer", "dept": "general"},
]

def seed():
    print("--- CivicSense User Reboot ---")
    
    # 1. Clear Legacy Data (Complaints first due to FK)
    print("Clearing legacy complaints...")
    try:
        supabase.table("complaints").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except Exception as e:
        print(f"Note: Complaint cleanup might have skipped or failed (likely empty or RLS): {e}")

    print("Clearing legacy users...")
    try:
        supabase.table("users").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except Exception as e:
        print(f"Error clearing users: {e}")
        return

    # 2. Insert New Credentials
    print("\nInserting new municipal accounts...")
    for user in CREDENTIALS:
        print(f"Creating account: {user['email']} ({user['role']})...")
        hashed_pw = get_password_hash(user['password'])
        
        data = {
            "email": user["email"],
            "hashed_password": hashed_pw,
            "role": user["role"],
            "department": user["dept"]
        }
        
        res = supabase.table("users").insert(data).execute()
        if res.data:
            print(f"✅ Created {user['email']}")
        else:
            print(f"❌ Failed to create {user['email']}")

    print("\n--- SEEDING COMPLETE ---")
    print("You can now login with these credentials.")

if __name__ == "__main__":
    seed()
