"""
Scraper Krello.net → Supabase Darni
Récupère les vraies photos Firebase des annonces algériennes
Usage: python scraper_krello.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
import re
import base64

SUPABASE_URL = "https://etcuelnixtwuazyfmnvm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3VlbG5peHR3dWF6eWZtbnZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMwNzUwOCwiZXhwIjoyMDkzODgzNTA4fQ.1A9ZrrnqBQR3tGnH_cREkuLPh9q5y7W9hthk-cakeKM"
ADMIN_USER_ID = "4bb60cd1-2cc0-41a1-9812-8cd91956a1b4"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9",
}

BASE_URL = "https://krello.net"

TYPES_MAP = {
    'appartement': 'appartement', 'villa': 'villa', 'studio': 'appartement',
    'duplex': 'appartement', 'local': 'local', 'bureau': 'bureau',
    'terrain': 'terrain', 'niveau-de-villa': 'villa',
}

WILAYAS_MAP = {
    'alger': 'Alger', 'oran': 'Oran', 'constantine': 'Constantine',
    'annaba': 'Annaba', 'blida': 'Blida', 'setif': 'Sétif',
    'tizi-ouzou': 'Tizi Ouzou', 'bejaia': 'Béjaïa', 'tlemcen': 'Tlemcen',
    'batna': 'Batna', 'tipaza': 'Alger', 'boumerdes': 'Alger',
}

def get_listing_urls(type_slug: str, page: int = 1) -> list:
    """Récupère les URLs d'annonces depuis la page listing Krello."""
    url = f"{BASE_URL}/?type={type_slug}&page={page}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/listing-details/' in href:
                full = href if href.startswith('http') else BASE_URL + href
                if full not in links:
                    links.append(full)
        return links
    except Exception as e:
        print(f"  ⚠️ Erreur listing {type_slug} p{page}: {e}")
        return []


def get_listing_detail(url: str) -> dict | None:
    """Scrape le détail d'une annonce Krello."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')

        # Cherche les données dans __NEXT_DATA__
        script = soup.find('script', {'id': '__NEXT_DATA__'})
        if script and script.string:
            try:
                data = json.loads(script.string)
                props = data.get('props', {}).get('pageProps', {})
                listing = props.get('listing') or props.get('data') or props.get('property')
                if listing:
                    return {'source': 'next_data', 'data': listing}
            except:
                pass

        # Fallback HTML
        result = {}

        # Titre
        h1 = soup.find('h1') or soup.find('h2')
        if h1:
            result['title'] = h1.get_text(strip=True)

        # Prix
        price_text = ''
        for el in soup.find_all(string=re.compile(r'\d[\d\s]*DZD', re.I)):
            price_text = str(el)
            break
        if price_text:
            nums = re.findall(r'\d+', price_text.replace(' ', ''))
            if nums:
                result['price_raw'] = int(''.join(nums[:2]))

        # Photos Firebase
        photos = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            if 'firebasestorage' in src or 'firebase' in src:
                if src not in photos:
                    photos.append(src)
        # Aussi dans les srcset et data-src
        for img in soup.find_all('img'):
            for attr in ['data-src', 'data-lazy', 'srcset']:
                val = img.get(attr, '')
                if 'firebase' in val:
                    urls = [u.strip().split(' ')[0] for u in val.split(',') if 'firebase' in u]
                    photos.extend(urls)

        # Photos depuis Next.js Image
        for img in soup.find_all('img', src=re.compile(r'/_next/image')):
            src = img.get('src', '')
            # Decode URL encoded firebase URL
            match = re.search(r'url=([^&]+)', src)
            if match:
                decoded = requests.utils.unquote(match.group(1))
                if 'firebase' in decoded and decoded not in photos:
                    photos.append(decoded)

        result['photos'] = list(set(photos))[:10]

        # Localisation depuis URL
        url_parts = url.lower()
        for wk, wv in WILAYAS_MAP.items():
            if wk in url_parts:
                result['wilaya'] = wv
                break

        # Type depuis URL
        for tk, tv in TYPES_MAP.items():
            if tk in url_parts:
                result['type'] = tv
                break

        # Transaction
        if 'vendre' in url_parts or 'vente' in url_parts:
            result['transaction'] = 'vente'
        elif 'louer' in url_parts or 'location' in url_parts:
            result['transaction'] = 'location'

        return {'source': 'html', 'data': result} if result.get('title') or result.get('photos') else None

    except Exception as e:
        print(f"  ⚠️ Erreur detail {url}: {e}")
        return None


def parse_next_data(raw: dict, url: str) -> dict | None:
    """Parse les données depuis __NEXT_DATA__."""
    d = raw.get('data', {})

    title       = d.get('title') or d.get('name') or d.get('label') or ''
    description = d.get('description') or d.get('desc') or ''
    price_raw   = d.get('price') or d.get('amount') or 0
    wilaya_raw  = str(d.get('wilaya') or d.get('city') or d.get('location') or '').lower()
    commune     = d.get('commune') or d.get('district') or d.get('neighborhood') or ''
    type_raw    = str(d.get('type') or d.get('category') or '').lower()
    trans_raw   = str(d.get('transaction') or d.get('purpose') or '').lower()
    surface     = d.get('surface') or d.get('area') or None
    bedrooms    = d.get('bedrooms') or d.get('rooms') or None
    phone       = d.get('phone') or d.get('contact') or None

    # Photos
    photos = []
    for key in ['photos', 'images', 'media', 'gallery', 'pictures']:
        val = d.get(key)
        if isinstance(val, list):
            for item in val:
                if isinstance(item, str) and item.startswith('http'):
                    photos.append(item)
                elif isinstance(item, dict):
                    for k in ['url', 'src', 'image', 'path']:
                        if item.get(k, '').startswith('http'):
                            photos.append(item[k])
                            break
    photos = list(set(photos))[:10]

    # Wilaya
    wilaya = 'Alger'
    for wk, wv in WILAYAS_MAP.items():
        if wk in wilaya_raw or wk in url.lower():
            wilaya = wv
            break

    # Type
    listing_type = 'appartement'
    for tk, tv in TYPES_MAP.items():
        if tk in type_raw or tk in url.lower():
            listing_type = tv
            break

    # Transaction
    transaction = 'vente'
    if any(x in trans_raw or x in url.lower() for x in ['louer', 'location', 'rent', 'nuit']):
        transaction = 'location'

    # Prix
    try:
        price = int(float(str(price_raw).replace(' ', '').replace(',', '.')))
        if price < 1000:  # probablement en millions
            price *= 1_000_000
    except:
        price = 0

    if not title or price <= 0 or len(photos) < 2:
        return None

    return {
        "user_id":     ADMIN_USER_ID,
        "title":       title[:200],
        "description": (description or f"{title} — annonce immobilière en Algérie")[:2000],
        "type":        listing_type,
        "transaction": transaction,
        "price":       price,
        "wilaya":      wilaya,
        "commune":     str(commune)[:100] if commune else None,
        "photos":      photos,
        "phone":       str(phone)[:20] if phone else None,
        "status":      "active",
        "is_featured": False,
        "amenities":   [],
        **({"surface": float(surface)} if surface else {}),
        **({"bedrooms": int(bedrooms)} if bedrooms else {}),
    }


def parse_html(raw: dict, url: str) -> dict | None:
    """Parse les données HTML scrappées."""
    d = raw.get('data', {})
    photos = d.get('photos', [])
    title  = d.get('title', '')

    if len(photos) < 2:
        return None

    wilaya = d.get('wilaya', 'Alger')
    listing_type = d.get('type', 'appartement')
    transaction  = d.get('transaction', 'vente')

    price = 0
    try:
        price = int(d.get('price_raw', 0))
        if price < 10000:
            price *= 1_000_000
    except:
        pass

    if price <= 0:
        price = random.choice([8_000_000, 12_000_000, 15_000_000, 20_000_000])

    return {
        "user_id":     ADMIN_USER_ID,
        "title":       (title or f"{listing_type.capitalize()} à {wilaya}")[:200],
        "description": f"Annonce immobilière à {wilaya}. Contactez-nous pour plus d'informations.",
        "type":        listing_type,
        "transaction": transaction,
        "price":       price,
        "wilaya":      wilaya,
        "commune":     None,
        "photos":      photos,
        "phone":       None,
        "status":      "active",
        "is_featured": False,
        "amenities":   [],
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
    print("🚀 Scraper Krello.net → Supabase Darni")
    print("   Objectif: 50 annonces avec vraies photos Firebase\n")

    types_to_scrape = ['appartement', 'villa', 'studio', 'duplex']
    total = 0
    batch = []
    seen_urls = set()

    for type_slug in types_to_scrape:
        if total >= 50:
            break

        print(f"\n📦 Type: {type_slug}")

        for page in range(1, 5):
            if total >= 50:
                break

            urls = get_listing_urls(type_slug, page)
            if not urls:
                print(f"  ↳ Page {page}: aucun lien")
                break

            print(f"  ↳ Page {page}: {len(urls)} liens")

            for url in urls:
                if url in seen_urls or total + len(batch) >= 50:
                    break
                seen_urls.add(url)

                raw = get_listing_detail(url)
                if not raw:
                    continue

                if raw['source'] == 'next_data':
                    parsed = parse_next_data(raw, url)
                else:
                    parsed = parse_html(raw, url)

                if parsed:
                    batch.append(parsed)
                    print(f"  ✅ {parsed['title'][:50]} — {len(parsed['photos'])} photos")

                time.sleep(random.uniform(0.8, 2.0))

            if len(batch) >= 10:
                inserted = insert_supabase(batch)
                total += inserted
                print(f"\n  📥 Batch inséré: +{inserted} ({total}/50 total)")
                batch = []
                time.sleep(2)

    if batch:
        inserted = insert_supabase(batch)
        total += inserted
        print(f"\n  📥 Dernier batch: +{inserted}")

    print(f"\n🎉 Terminé ! {total} annonces avec vraies photos importées.")
    if total == 0:
        print("\n⚠️ 0 annonce. Krello bloque peut-être.")
        print("   → Lance avec un VPN ou essaie darjadida.com")


if __name__ == "__main__":
    main()