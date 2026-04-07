import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urlparse

URL = "https://kirtansewa.net/index.php/kirtan-recordings/"


def get_slug(url):
    path = urlparse(url).path.rstrip("/")
    return path.split("/")[-1]


def scrape_artists():
    resp = requests.get(URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    artists = []
    for a in soup.select("a.elementor-button"):
        href = a.get("href", "").strip()
        span = a.find("span", class_="elementor-button-text")
        if span and href:
            name = span.get_text(strip=True)
            artists.append({"name": name, "url": href, "slug": get_slug(href)})

    with open("artists.json", "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(artists)} artists to artists.json")


if __name__ == "__main__":
    scrape_artists()
