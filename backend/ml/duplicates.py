from sentence_transformers import SentenceTransformer, util
import torch
from typing import List, Optional
from database import supabase

# Load a lightweight model (384-dimensional embeddings)
# This model is fast and efficient for CPU usage
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for the given text.
    """
    embedding = model.encode(text, convert_to_tensor=False)
    return embedding.tolist()

def find_duplicate_group(text: str, category: str, threshold: float = 0.85) -> Optional[str]:
    """
    Search Supabase for visually/semantically similar complaints within the same category.
    Returns the duplicate_group_id (or existing complaint ID) if match found.
    """
    try:
        # Generate embedding for current complaint
        current_embedding = get_embedding(text)
        
        # Query Supabase using pgvector similarity
        # We look for complaints in the same category within the last 7 days
        # We use a raw SQL-like approach via RPC or direct match if possible
        # However, standard Supabase python client doesn't support vector search easily 
        # without an RPC function. Let's assume we have an RPC 'match_complaints'.
        
        # If not using RPC, we can fetch candidates and compare in-memory (slower but works for MVP)
        response = supabase.table("complaints") \
            .select("id, text, embedding, duplicate_group_id") \
            .eq("category", category) \
            .order("timestamp", desc=True) \
            .limit(20) \
            .execute()
            
        if not response.data:
            return None
            
        for record in response.data:
            if not record.get("embedding"):
                continue
                
            # Compare embeddings
            score = util.cos_sim(torch.tensor(current_embedding), torch.tensor(record["embedding"]))
            
            if score > threshold:
                # Found a match! Return the existing group ID or the record ID if no group yet
                return record.get("duplicate_group_id") or record["id"]
                
        return None
        
    except Exception as e:
        print(f"Deduplication error: {e}")
        return None
