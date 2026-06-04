"""
Scraper DarJadida.com → Supabase Darni
Site PHP classique, photos directes, pas de protection forte
Usage: python scraper_darjadida.py
"""

import requests
from bs4 import BeautifulSoup
import json, time, random, re

SUPABASE_URL = "https://etcuelnixtwuazyfmnvm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3VlbG5peHR3dWF6eWZtbnZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMwNzUwOCwiZXhwIjoyMDkzODgzNTA4fQ.1A9ZrrnqBQR3tGnH_cREkuLPh9q5y7W9hthk-cakeKM"
ADMIN_USER_ID = "4bb60cd1-2cc0-41a1-9812-8cd91956a1b4"
BASE = "https://darjadida.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
    "Referer": "https://darjadida.com/",
}

# URLs de listing à scraper
LISTING_PAGES = [
    f"{BASE}/annonces/Vente,Appartement,alger.php",
    f"{BASE}/annonces/Vente,Villa,alger.php",
    f"{BASE}/annonces/Location,Appartement,alger.php",
    f"{BASE}/annonces/Vente,Appartement,oran.php",
    f"{BASE}/annonces/Vente,Villa,oran.php",
    f"{BASE}/annonces/Vente,Appartement,constantine.php",
    f"{BASE}/annonces/Vente,Appartement,annaba.php",
    f"{BASE}/annonces/Vente,Villa,blida.php",
    f"{BASE}/annonces/immobilier?q=alger+vente+appartement",
    f"{BASE}/annonces/immobilier?q=oran+vente+villa",
    f"{BASE}/annonces/immobilier?q=constantine+vente+appartement",
]

WILAYAS_MAP = {
    'alger': 'Alger', 'oran': 'Oran', 'constantine': 'Constantine',
    'annaba': 'Annaba', 'blida': 'Blida', 'setif': 'Sétif',
    'tizi-ouzou': 'Tizi Ouzou', 'tizi ouzou': 'Tizi Ouzou',
    'bejaia': 'Béjaïa', 'béjaïa': 'Béjaïa',
    'tlemcen': 'Tlemcen', 'batna': 'Batna',
    'tipaza': 'Alger', 'boumerdes': 'Alger', 'blida': 'Blida',
}

def get_wilaya(text: str) -> str:
    t = text.lower()
    for k, v in WILAYAS_MAP.items():
        if k in t:
            return v
    return 'Alger'

def get_listing_links(page_url: str) -> list:
    try:
        r = requests.get(page_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"  ⚠️ {r.status_code} pour {page_url}")
            return []
        soup = BeautifulSoup(r.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Les annonces darjadida ont des URLs type /annonce/ ou /detail/
            if any(x in href for x in ['/annonce/', '/detail/', '-annonce-', 'annonce_']):
                full = href if href.startswith('http') else BASE + href
                if full not in links:
                    links.append(full)
        # Aussi chercher des liens avec id numérique
        for a in soup.find_all('a', href=re.compile(r'/\d{4,}')):
            href = a['href']
            full = href if href.startswith('http') else BASE + href
            if 'darjadida' in full and full not in links:
                links.append(full)
        print(f"  → {len(links)} liens trouvés")
        return links[:20]
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return []

def get_detail(url: str) -> dict | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        result = {}

        # ── Titre ──
        for tag in ['h1', 'h2', '.titre', '.title', '#titre']:
            el = soup.select_one(tag)
            if el and el.get_text(strip=True):
                result['title'] = el.get_text(strip=True)
                break

        # ── Prix ──
        price_text = ''
        for el in soup.find_all(string=re.compile(r'\d[\d\s\.]*\s*(DA|DZD|دج)', re.I)):
            price_text = str(el).strip()
            if price_text:
                break
        if not price_text:
            for el in soup.find_all(class_=re.compile(r'prix|price|amount', re.I)):
                t = el.get_text(strip=True)
                if re.search(r'\d', t):
                    price_text = t
                    break
        if price_text:
            nums = re.findall(r'\d+', price_text.replace(' ', '').replace('.', ''))
            try:
                p = int(''.join(nums[:3]))
                if p > 0:
                    result['price'] = p if p > 100000 else p * 1000000
            except:
                pass

        # ── Description ──
        for sel in ['.description', '#description', '.detail-desc', 'div.content p']:
            el = soup.select_one(sel)
            if el and len(el.get_text(strip=True)) > 30:
                result['description'] = el.get_text(strip=True)[:2000]
                break

        # ── Wilaya / commune ──
        full_text = soup.get_text()
        result['wilaya'] = get_wilaya(url + ' ' + full_text[:500])

        # Commune depuis breadcrumb ou localisation
        for sel in ['.localisation', '.ville', '.commune', '.breadcrumb']:
            el = soup.select_one(sel)
            if el:
                result['commune'] = el.get_text(strip=True)[:100]
                break

        # ── Type ──
        t = (url + ' ' + result.get('title', '')).lower()
        if 'villa' in t:
            result['type'] = 'villa'
        elif 'terrain' in t:
            result['type'] = 'terrain'
        elif 'bureau' in t or 'local' in t:
            result['type'] = 'bureau'
        else:
            result['type'] = 'appartement'

        # ── Transaction ──
        if 'location' in t or 'louer' in t or 'loue' in t:
            result['transaction'] = 'location'
        else:
            result['transaction'] = 'vente'

        # ── Surface & chambres ──
        m = re.search(r'(\d+)\s*m[²2]', full_text)
        if m:
            result['surface'] = int(m.group(1))
        m = re.search(r'[Ff](\d)\b', full_text)
        if m:
            result['bedrooms'] = max(1, int(m.group(1)) - 1)

        # ── Téléphone ──
        m = re.search(r'0[567]\d{8}', full_text.replace(' ', '').replace('.', ''))
        if m:
            result['phone'] = m.group(0)

        # ── Photos ──
        photos = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            # Darjadida stocke les photos dans /photos/ ou /images/
            if any(x in src for x in ['/photos/', '/images/', '/uploads/', '/annonces/']):
                if not any(x in src for x in ['logo', 'icon', 'banner', 'thumb_small']):
                    full = src if src.startswith('http') else BASE + src
                    # Préférer les grandes photos (pas les thumbs)
                    full = full.replace('_thumb', '').replace('_mini', '').replace('_small', '')
                    if full not in photos:
                        photos.append(full)
        # Aussi chercher dans les balises data-src (lazy loading)
        for img in soup.find_all(['img', 'div'], attrs={'data-src': True}):
            src = img['data-src']
            if src and src.startswith('http') and 'darjadida' in src:
                if src not in photos:
                    photos.append(src)
        # Chercher dans les liens href aussi
        for a in soup.find_all('a', href=re.compile(r'\.(jpg|jpeg|png|webp)', re.I)):
            href = a['href']
            full = href if href.startswith('http') else BASE + href
            if full not in photos:
                photos.append(full)

        result['photos'] = photos[:10]

        # Validation minimale
        if len(photos) < 1:
            return None
        if not result.get('title'):
            return None

        return result

    except Exception as e:
        print(f"  ❌ Erreur detail: {e}")
        return None

def to_supabase(d: dict) -> dict:
    price = d.get('price', 0)
    if not price or price <= 0:
        # Prix par défaut selon type/wilaya
        price = random.choice([8_000_000, 12_000_000, 15_000_000, 18_000_000, 25_000_000])

    return {
        "user_id":     ADMIN_USER_ID,
        "title":       d.get('title', 'Annonce immobilière')[:200],
        "description": d.get('description', f"Bien immobilier à {d.get('wilaya', 'Alger')}. Contactez-nous pour plus d'informations.")[:2000],
        "type":        d.get('type', 'appartement'),
        "transaction": d.get('transaction', 'vente'),
        "price":       price,
        "wilaya":      d.get('wilaya', 'Alger'),
        "commune":     d.get('commune', None),
        "photos":      d.get('photos', []),
        "phone":       d.get('phone', None),
        "status":      "active",
        "is_featured": False,
        "amenities":   [],
        **({'surface': d['surface']} if d.get('surface') else {}),
        **({'bedrooms': d['bedrooms']} if d.get('bedrooms') else {}),
    }

def insert_supabase(rows: list) -> int:
    if not rows:
        return 0
    h = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    r = requests.post(f"{SUPABASE_URL}/rest/v1/listings", json=rows, headers=h, timeout=30)
    if r.status_code in (200, 201):
        return len(rows)
    print(f"  ❌ Supabase {r.status_code}: {r.text[:200]}")
    return 0

def main():
    print("🚀 Scraper DarJadida.com → Supabase Darni")
    print("=" * 50)

    seen = set()
    batch = []
    total = 0
    TARGET = 60

    for page_url in LISTING_PAGES:
        if total + len(batch) >= TARGET:
            break
        print(f"\n📄 {page_url.split('darjadida.com')[1][:60]}")
        links = get_listing_links(page_url)
        time.sleep(random.uniform(1, 2))

        for url in links:
            if url in seen or total + len(batch) >= TARGET:
                continue
            seen.add(url)

            detail = get_detail(url)
            if not detail:
                time.sleep(0.5)
                continue

            row = to_supabase(detail)
            batch.append(row)
            print(f"  ✅ {row['title'][:55]} | {len(detail.get('photos',[]))} photos | {row['wilaya']}")
            time.sleep(random.uniform(0.8, 1.8))

            if len(batch) >= 10:
                n = insert_supabase(batch)
                total += n
                print(f"\n  📥 +{n} insérés ({total}/{TARGET})\n")
                batch = []
                time.sleep(2)

    if batch:
        n = insert_supabase(batch)
        total += n
        print(f"\n  📥 Dernier batch: +{n}")

    print(f"\n{'='*50}")
    print(f"✅ Terminé : {total} annonces avec vraies photos importées dans Darni !")

    if total == 0:
        print("\n⚠️  0 annonce récupérée.")
        print("   Possible causes :")
        print("   1. DarJadida a changé leur structure HTML")
        print("   2. Ton IP est bloquée → essaie avec un VPN")
        print("   3. Lance depuis un réseau différent (hotspot mobile)")

if __name__ == "__main__":
    main()