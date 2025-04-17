import requests
from bs4 import BeautifulSoup
import os
import pandas as pd

# Create folder to store images
if not os.path.exists("jumia_images"):
    os.makedirs("jumia_images")

# Jumia category URL (Example: Laptops)
JUMIA_URL = "https://www.jumia.co.ke/laptops/"

# Headers to mimic a real browser (Avoid blocking)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Fetch the webpage
response = requests.get(JUMIA_URL, headers=HEADERS)
soup = BeautifulSoup(response.text, "html.parser")

# Extract product details
products = []
for item in soup.find_all("article", class_="prd _fb col c-prd"):
    try:
        name = item.find("a", class_="link").text.strip()
        price = item.find("div", class_="prc").text.strip()
        description = "Laptop from Jumia"  # Jumia doesn't provide detailed descriptions directly
        
        # Extract image URL
        img_tag = item.find("img")
        img_url = img_tag["data-src"] if img_tag.has_attr("data-src") else img_tag["src"]
        
        # Download image
        img_name = name.replace(" ", "_") + ".jpg"
        img_path = os.path.join("jumia_images", img_name)
        img_data = requests.get(img_url).content
        with open(img_path, "wb") as f:
            f.write(img_data)

        # Store product data
        products.append([name, price, description, img_path])

    except Exception as e:
        print(f"Skipping product due to error: {e}")

# Save to CSV
df = pd.DataFrame(products, columns=["name", "price", "description", "image_path"])
df.to_csv("jumia_products.csv", index=False)

print("Scraping completed. Data saved to jumia_products.csv")
