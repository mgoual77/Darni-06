"""
Scraper Ouedkniss → Supabase Darni (version HTML)
Usage: python scraper_ouedkniss.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://etcuelnixtwuazyfmnvm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3VlbG5peHR3dWF6eWZtbnZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMwNzUwOCwiZXhwIjoyMDkzODgzNTA4fQ.1A9ZrrnqBQR3tGnH_cREkuLPh9q5y7W9hthk-cakeKM"
ADMIN_USER_ID = "4bb60cd1-2cc0-41a1-9812-8cd91956a1b4"
MAX_ANNONCES = 100
MIN_PHOTOS = 2
MIN_DESC_LEN = 80

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# Wilayas avec leurs slugs Ouedkniss
WILAYAS = [
    {"nom": "Alger",        "slug": "alger"},
    {"nom": "Oran",         "slug": "oran"},
    {"nom": "Constantine",  "slug": "constantine"},
    {"nom": "Annaba",       "slug": "annaba"},
    {"nom": "Blida",        "slug": "blida"},
    {"nom": "Sétif",        "slug": "setif"},
    {"nom": "Tizi Ouzou",   "slug": "tizi-ouzou"},
    {"nom": "Béjaïa",       "slug": "bejaia"},
    {"nom": "Tlemcen",      "slug": "tlemcen"},
    {"nom": "Batna",        "slug": "batna"},
]

MAX_PAR_WILAYA = MAX_ANNONCES // len(WILAYAS) + 2


def fetch_listing_ids(wilaya_slug: str, page: int = 1) -> list:
    """Récupère les IDs d'annonces immobilières d'une wilaya."""
    url = f"https://www.ouedkniss.com/immobilier/{wilaya_slug}?page={page}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return []
        soup = BeautifulSoup(r.text, "html.parser")

        # Cherche les liens d'annonces
        ids = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            # Les annonces Ouedkniss ont des URLs comme /d/titre-annonce/12345
            match = re.search(r'/d/[^/]+/(\d+)', href)
            if match:
                ids.append(match.group(1))

        return list(set(ids))
    except Exception as e:
        print(f"  ⚠️ Erreur fetch liste {wilaya_slug} page {page}: {e}")
        return []


def fetch_annonce_detail(annonce_id: str) -> dict | None:
    """Récupère le détail d'une annonce."""
    url = f"https://www.ouedkniss.com/d/annonce/{annonce_id}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return None

        soup = BeautifulSoup(r.text, "html.parser")

        # Cherche les données JSON dans la page (Ouedkniss injecte __NUXT__)
        scripts = soup.find_all("script")
        for script in scripts:
            if script.string and "__NUXT__" in script.string:
                # Extrait les données JSON
                match = re.search(r'data:\s*function\(\)\s*\{return\s*(\{.*?\})\s*\}', script.string, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(1))
                        return data
                    except:
                        pass

        # Fallback : scrape HTML directement
        result = {}

        # Titre
        h1 = soup.find("h1")
        if h1:
            result["title"] = h1.get_text(strip=True)

        # Prix
        price_el = soup.find(class_=re.compile(r'price|prix', re.I))
        if price_el:
            price_text = price_el.get_text(strip=True)
            nums = re.findall(r'[\d\s]+', price_text)
            if nums:
                result["price_raw"] = "".join(nums[0].split())

        # Description
        desc_el = soup.find(class_=re.compile(r'description|desc', re.I))
        if desc_el:
            result["description"] = desc_el.get_text(strip=True)

        # Photos
        imgs = soup.find_all("img", src=re.compile(r'ouedkniss|media|photo', re.I))
        result["photos"] = [img["src"] for img in imgs if img.get("src") and "http" in img["src"]][:10]

        return result if result.get("title") else None

    except Exception as e:
        print(f"  ⚠️ Erreur detail {annonce_id}: {e}")
        return None


def fetch_via_search_api(wilaya_slug: str, page: int = 1) -> list:
    """Utilise l'API de recherche Ouedkniss (JSON)."""
    url = "https://www.ouedkniss.com/api/v1/announcements/search"
    params = {
        "categorySlug": "immobilier",
        "regionSlug": wilaya_slug,
        "page": page,
        "size": 24,
        "connected": "false",
    }
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            data = r.json()
            return data.get("content", data.get("announcements", []))
        return []
    except:
        return []


def parse_annonce_api(a: dict, wilaya_nom: str) -> dict | None:
    """Parse une annonce depuis l'API REST."""
    title = (a.get("title") or a.get("name") or "").strip()
    desc  = (a.get("description") or a.get("body") or "").strip()
    price = 0

    # Prix
    p = a.get("price") or a.get("originalPrice") or 0
    try:
        price = int(float(str(p).replace(" ", "").replace(",", ".")))
        unit = str(a.get("priceUnit") or a.get("currency") or "").upper()
        if "MILLION" in unit:
            price *= 1_000_000
        elif "MILLIARD" in unit:
            price *= 1_000_000_000
    except:
        pass

    # Photos
    medias = a.get("medias") or a.get("images") or a.get("photos") or []
    photos = []
    for m in medias:
        if isinstance(m, str) and m.startswith("http"):
            photos.append(m)
        elif isinstance(m, dict):
            url = m.get("mediaUrl") or m.get("url") or m.get("src") or ""
            if url and url.startswith("http"):
                photos.append(url)

    # Wilaya/région
    regions = a.get("regions") or a.get("location") or []
    commune = ""
    if isinstance(regions, list) and regions:
        commune = regions[0].get("name", "") if isinstance(regions[0], dict) else str(regions[0])
    elif isinstance(regions, dict):
        commune = regions.get("name", "")

    # Catégorie
    cat = a.get("category") or {}
    cat_slug = (cat.get("slug") or cat.get("name") or "appartement").lower() if isinstance(cat, dict) else str(cat).lower()

    # Champs spécifiques
    fields = a.get("fields") or a.get("specs") or []
    surface, bedrooms, rooms = None, None, None
    for f in fields:
        if not isinstance(f, dict):
            continue
        slug = (f.get("slug") or "").lower()
        val  = f.get("value") or f.get("valueLabel") or ""
        try:
            if "surface" in slug or "superficie" in slug:
                surface = float(re.sub(r"[^\d.]", "", str(val)))
            elif "chambre" in slug:
                bedrooms = int(re.sub(r"[^\d]", "", str(val)))
            elif "piece" in slug or "pièce" in slug:
                rooms = int(re.sub(r"[^\d]", "", str(val)))
        except:
            pass

    # Filtres qualité
    if not title or price <= 0:
        return None
    if len(photos) < MIN_PHOTOS:
        return None
    if len(desc) < MIN_DESC_LEN:
        return None

    # Type/transaction
    def get_type(slug):
        for k, v in [("appartement","appartement"),("villa","villa"),("bureau","bureau"),("local","local"),("terrain","terrain"),("duplex","appartement"),("studio","appartement"),("ferme","villa")]:
            if k in slug:
                return v
        return "appartement"

    def get_transaction(slug, title):
        txt = (slug + " " + title).lower()
        if any(x in txt for x in ["location","louer","bail","rent"]):
            return "location"
        return "vente"

    ouk_id = str(a.get("id") or a.get("slug") or "")

    return {
        "user_id":     ADMIN_USER_ID,
        "title":       title[:200],
        "description": f"{desc[:1900]}\n\n[Source: Ouedkniss | Réf: OUK-{ouk_id}]" if ouk_id else desc[:2000],
        "type":        get_type(cat_slug),
        "transaction": get_transaction(cat_slug, title),
        "price":       price,
        "wilaya":      wilaya_nom,
        "commune":     commune[:100] if commune else None,
        "photos":      photos[:10],
        "phone":       None,
        "status":      "active",
        "is_featured": False,
        "amenities":   [],
        **({"surface": surface} if surface else {}),
        **({"bedrooms": bedrooms} if bedrooms else {}),
        **({"rooms": rooms} if rooms else {}),
    }


def insert_supabase(listings: list) -> int:
    if not listings:
        return 0
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    r = requests.post(f"{SUPABASE_URL}/rest/v1/listings", json=listings, headers=headers, timeout=30)
    if r.status_code in (200, 201):
        return len(listings)
    print(f"  ❌ Supabase {r.status_code}: {r.text[:300]}")
    return 0


def main():
    print("🚀 Darni Scraper — Ouedkniss → Supabase")
    print(f"   Objectif : {MAX_ANNONCES} annonces qualité (min {MIN_PHOTOS} photos, desc > {MIN_DESC_LEN} chars)\n")

    total = 0
    batch = []

    for w in WILAYAS:
        if total >= MAX_ANNONCES:
            break

        wilaya_nom  = w["nom"]
        wilaya_slug = w["slug"]
        wilaya_count = 0
        print(f"\n📍 {wilaya_nom}...")

        for page in range(1, 8):
            if total + len(batch) >= MAX_ANNONCES or wilaya_count >= MAX_PAR_WILAYA:
                break

            # Essaie l'API REST d'abord
            annonces = fetch_via_search_api(wilaya_slug, page)
            if not annonces:
                print(f"  ↳ Page {page}: API REST vide, arrêt")
                break

            print(f"  ↳ Page {page}: {len(annonces)} brutes")

            for a in annonces:
                if total + len(batch) >= MAX_ANNONCES or wilaya_count >= MAX_PAR_WILAYA:
                    break
                parsed = parse_annonce_api(a, wilaya_nom)
                if parsed:
                    batch.append(parsed)
                    wilaya_count += 1

            # Insère par batch de 10
            if len(batch) >= 10:
                inserted = insert_supabase(batch)
                total += inserted
                print(f"  ✅ +{inserted} insérées ({total}/{MAX_ANNONCES} total)")
                batch = []

            time.sleep(random.uniform(1.0, 2.5))

        print(f"  → {wilaya_count} annonces qualité pour {wilaya_nom}")

    # Dernier batch
    if batch:
        inserted = insert_supabase(batch)
        total += inserted
        print(f"\n✅ Dernier batch: +{inserted}")

    print(f"\n🎉 Terminé ! {total} annonces importées dans Darni.")
    if total == 0:
        print("\n⚠️  0 annonce importée. Ouedkniss bloque peut-être les requêtes.")
        print("   Solutions :")
        print("   1. Attends 10 min et relance")
        print("   2. Utilise un VPN")
        print("   3. Dis-moi et je crée des annonces fictives réalistes à la place")


if __name__ == "__main__":
    main()