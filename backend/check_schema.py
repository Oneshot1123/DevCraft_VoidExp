import os
from database import supabase

try:
    # Attempt to fetch a single complaint to see the columns
    response = supabase.table("complaints").select("*").limit(1).execute()
    if response.data:
        cols = response.data[0].keys()
        print(f"Columns in 'complaints' table: {list(cols)}")
        if "resolution_note" in cols:
            print("SUCCESS: resolution_note column exists.")
        else:
            print("FAILURE: resolution_note column is MISSING.")
    else:
        print("No complaints found to check columns.")
except Exception as e:
    print(f"ERROR checking schema: {str(e)}")
