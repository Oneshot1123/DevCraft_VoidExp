import requests
import os

URL = "https://raw.githubusercontent.com/sanjanakrishnan/mumbai_spatial_data/main/BMC_admin_wards.geojson"
SAVE_PATH = "data/mumbai_wards.json"

def download():
    os.makedirs("data", exist_ok=True)
    print(f"Downloading Mumbai Wards from {URL}...")
    response = requests.get(URL)
    if response.status_code == 200:
        with open(SAVE_PATH, "wb") as f:
            f.write(response.content)
        print(f"Successfully saved to {SAVE_PATH}")
    else:
        print(f"Failed to download. Status code: {response.status_code}")

if __name__ == "__main__":
    download()
