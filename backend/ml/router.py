from typing import Dict

# Define department names (Standardized lowercase identifiers)
DEPT_SANITATION = "sanitation"
DEPT_ROADS = "roads"
DEPT_WATER = "water"
DEPT_ELECTRICITY = "electricity"
DEPT_SAFETY = "safety"
DEPT_TRAFFIC = "traffic"
DEPT_OTHER = "general"

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
    
    # Mapping from category to department
    department = CATEGORY_TO_DEPT.get(category, DEPT_OTHER)
    
    # EMERGENCY OVERRIDE: 
    # If urgency is critical and category is 'other' or 'safety', route to safety.
    # If it's a specific issue (electricity, water), keep it in that department
    # but the dashboard will flag it as critical.
    if urgency == "critical" and (category == "other" or category == "safety"):
        return DEPT_SAFETY

    return department
