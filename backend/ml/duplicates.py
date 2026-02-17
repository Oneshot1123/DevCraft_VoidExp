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
            emb = record.get("embedding")
            if not emb:
                continue
                
            # SUPREME DEFENSE: Ensure emb is a list of floats
            try:
                if isinstance(emb, str):
                    import json
                    emb = json.loads(emb)
                
                # If it's a list, ensure elements are floats (not strings from a bad parse)
                if isinstance(emb, list):
                    emb = [float(x) for x in emb]
                else:
                    print(f"Skipping record {record['id']} - unknown embedding type: {type(emb)}")
                    continue
            except Exception as parse_err:
                print(f"Failed to parse embedding for {record['id']}: {parse_err}")
                continue
            
            # Compare embeddings
            try:
                # Ensure both are tensors of same dtype
                t1 = torch.tensor(current_embedding, dtype=torch.float32)
                t2 = torch.tensor(emb, dtype=torch.float32)
                score = util.cos_sim(t1, t2)
                
                if score > threshold:
                    return record.get("duplicate_group_id") or record["id"]
            except Exception as tensor_err:
                print(f"Tensor comparison failed for {record['id']}: {tensor_err}")
                continue
                
        return None
        
    except Exception as e:
        import traceback
        print(f"Deduplication CRITICAL error: {e}")
        traceback.print_exc()
        return None
