from typing import Dict

# Define department names
DEPT_SANITATION = "Sanitation & Waste"
DEPT_ROADS = "Roads & Infrastructure"
DEPT_WATER = "Water Supply"
DEPT_ELECTRICITY = "Electricity"
DEPT_SAFETY = "Public Safety"
DEPT_TRAFFIC = "Traffic & Transport"
DEPT_OTHER = "General Administration"

# Map classification categories to departments
CATEGORY_TO_DEPT = {
    "sanitation": DEPT_SANITATION,
    "roads_infra": DEPT_ROADS,
    "water": DEPT_WATER,
    "electricity": DEPT_ELECTRICITY,
    "safety": DEPT_SAFETY,
    "traffic": DEPT_TRAFFIC,
    "other": DEPT_OTHER
}

def route_complaint(category: str, urgency: str) -> str:
    """
    Determines the appropriate department based on the AI-classified category.
    Returns the department name.
    
    Future enhancement: Use urgency to potentially route to emergency services directly.
    """
    
    # CRITICAL OVERRIDE: If urgency is critical, route to Public Safety immediately
    # unless it's already Traffic or Fire related which might be specific, 
    # but Public Safety is the safest general bucket for emergencies.
    if urgency == "critical":
        # Exception: If it's traffic related, maybe Traffic & Transport + Safety?
        # For simplicity in MVP, we prioritize Public Safety for all critical threats.
        return DEPT_SAFETY

    # Direct mapping from category to department
    department = CATEGORY_TO_DEPT.get(category)
    
    if not department:
        # Fallback if category is unknown
        return DEPT_OTHER
        
    return department
