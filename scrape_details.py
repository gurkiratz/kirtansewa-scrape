import requests
from bs4 import BeautifulSoup
import json
import re
import shutil
import time
import os
import sys
from urllib.parse import urlparse


def get_slug(url):
    path = urlparse(url).path.rstrip("/")
    return path.split("/")[-1]


def scrape_artist(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    article = soup.find("article")
    if not article:
        return None

    # Name
    h1 = article.find("h1", class_="entry-title")
    name = h1.get_text(strip=True) if h1 else ""

    # Image — first img in entry-content, first URL from srcset (clean CDN URL)
    image_url = None
    entry_content = article.find("div", class_="entry-content")
    if entry_content:
        img = entry_content.find("img")
        if img:
            srcset = img.get("srcset", "")
            if srcset:
                image_url = srcset.split(",")[0].strip().split(" ")[0]
            else:
                image_url = img.get("src") or None

    # Body paragraphs (plain text, skip mp3-only paragraphs)
    body = []
    tracks = []

    if entry_content:
        for p in entry_content.find_all("p"):
            links = p.find_all("a", href=True)
            mp3_links = [a for a in links if a["href"].endswith(".mp3")]

            # Skip paragraphs that contain only mp3 links (those become tracks)
            if mp3_links and len(mp3_links) == len(links):
                continue

            # Skip paragraphs whose only content is inside <strong> tags (section headers)
            strong_tags = p.find_all("strong")
            if strong_tags:
                strong_text = " ".join(s.get_text(separator=" ", strip=True) for s in strong_tags)
                full_text = p.get_text(separator=" ", strip=True)
                normalize = lambda t: " ".join(t.replace("\xa0", " ").split())
                if normalize(strong_text) == normalize(full_text):
                    continue

            text = p.get_text(separator=" ", strip=True)
            # Skip empty or &nbsp;-only paragraphs
            if text.replace("\xa0", "").strip():
                body.append(text)

        # Tracks: all .mp3 links anywhere in entry-content
        for a in entry_content.find_all("a", href=True):
            if a["href"].endswith(".mp3"):
                tracks.append({
                    "name": a.get_text(strip=True),
                    "url": a["href"],
                })

    return {
        "name": name,
        "url": url,
        "image_url": image_url,
        "body": body,
        "tracks": tracks,
    }


OUTPUT_DIR = "artists"
MANIFEST_NAME = "manifest.json"
_REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
_WEB_PUBLIC = os.path.join(_REPO_ROOT, "kirtansewa-web", "public")
PUBLIC_ARTISTS_DIR = os.path.join(_WEB_PUBLIC, "artists")
# Filenames from scrape: "{index}-{slug}.json" (index is decimal digits, slug may contain hyphens)
_ARTIST_JSON_RE = re.compile(r"^(\d+)-(.+)\.json$")


def update_manifest(output_dir):
    """Rebuild manifest.json from all NN-slug.json files (tells the web app which slugs have detail JSON)."""
    if not os.path.isdir(output_dir):
        return
    slugs = []
    for name in os.listdir(output_dir):
        if name == MANIFEST_NAME or not name.endswith(".json"):
            continue
        m = _ARTIST_JSON_RE.match(name)
        if m:
            slugs.append(m.group(2))
    slugs.sort()
    path = os.path.join(output_dir, MANIFEST_NAME)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(slugs, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  Updated {path} ({len(slugs)} scraped)")


def mirror_artist_to_public(src_path):
    """Copy scraped JSON into Vite public/artists and rebuild manifest there."""
    if not os.path.isdir(_WEB_PUBLIC):
        return
    os.makedirs(PUBLIC_ARTISTS_DIR, exist_ok=True)
    dest = os.path.join(PUBLIC_ARTISTS_DIR, os.path.basename(src_path))
    shutil.copy2(src_path, dest)
    print(f"  Mirrored {dest}")
    update_manifest(PUBLIC_ARTISTS_DIR)


def save_artist_file(index, slug, data):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = os.path.join(OUTPUT_DIR, f"{index:02d}-{slug}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Saved {filename}")
    update_manifest(OUTPUT_DIR)
    mirror_artist_to_public(filename)


def load_artists():
    with open("artists.json", encoding="utf-8") as f:
        return json.load(f)


def main():
    artists = load_artists()

    # Single-artist mode: pass URL or 1-based index as argument
    single_index = None
    single_url = None
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg.isdigit():
            single_index = int(arg)
        else:
            single_url = arg

    for i, artist in enumerate(artists, start=1):
        url = artist["url"]

        if single_index and i != single_index:
            continue
        if single_url and url != single_url:
            continue

        slug = get_slug(url)
        filename = os.path.join(OUTPUT_DIR, f"{i:02d}-{slug}.json")

        if os.path.exists(filename) and not single_url:
            print(f"Skipping {filename} (already exists)")
            continue

        print(f"[{i}/{len(artists)}] Scraping {artist['name']}...")
        try:
            data = scrape_artist(url)
            if data:
                save_artist_file(i, slug, data)
        except Exception as e:
            print(f"  Error: {e}")

        if not single_url and not single_index:
            time.sleep(0.5)


if __name__ == "__main__":
    main()
