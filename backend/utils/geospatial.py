import json
import os
from typing import Optional, Tuple, Dict
from shapely.geometry import shape, Point
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import functools

# Paths
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
WARDS_JSON_PATH = os.path.join(DATA_DIR, "mumbai_wards.json")

# Initialize Geocoder
geolocator = Nominatim(user_agent="civicsense_app")

# In-memory cache for reverse geocoding (suburb level)
# Key: (round(lat, 4), round(lng, 4)), Value: Area Name
geo_cache: Dict[Tuple[float, float], str] = {}

class WardDetector:
    def __init__(self):
        self.wards = []
        self._load_wards()

    def _load_wards(self):
        if not os.path.exists(WARDS_JSON_PATH):
            print(f"WARNING: Ward data not found at {WARDS_JSON_PATH}")
            return

        try:
            with open(WARDS_JSON_PATH, "r") as f:
                data = json.load(f)
                for feature in data.get("features", []):
                    # Cache the geometry as a shapely object
                    polygon = shape(feature["geometry"])
                    name = feature["properties"].get("name", "Unknown")
                    self.wards.append({"name": name, "polygon": polygon})
            print(f"Loaded {len(self.wards)} BMC wards.")
        except Exception as e:
            print(f"Error loading ward data: {e}")

    def get_ward(self, lat: float, lng: float) -> str:
        point = Point(lng, lat)  # GeoJSON is [lng, lat]
        for ward in self.wards:
            if ward["polygon"].contains(point):
                return ward["name"]
        return "Outside BMC Area"

# Singleton instance
detector = WardDetector()

def get_mumbai_ward(lat: float, lng: float) -> str:
    return detector.get_ward(lat, lng)

def get_mumbai_area(lat: float, lng: float) -> str:
    """
    Reverse geocode to get suburb/area name.
    Uses rounding and caching to reduce API hits.
    """
    cache_key = (round(lat, 4), round(lng, 4))
    if cache_key in geo_cache:
        return geo_cache[cache_key]

    try:
        location = geolocator.reverse((lat, lng), exactly_one=True, timeout=3)
        if location:
            address = location.raw.get("address", {})
            # Prefer suburb, then city_district, then neighbourhood
            area = address.get("suburb") or address.get("city_district") or address.get("neighbourhood") or "Mumbai"
            geo_cache[cache_key] = area
            return area
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Geocoding error: {e}")
    
    return "Mumbai"

if __name__ == "__main__":
    # Test coordinates (Marine Drive / Ward A approx)
    test_lat, test_lng = 18.944, 72.823 
    print(f"Ward: {get_mumbai_ward(test_lat, test_lng)}")
    print(f"Area: {get_mumbai_area(test_lat, test_lng)}")
