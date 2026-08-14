export function smartPrice(price: number, transaction?: string): string {
  if (!price) return '— DA';
  const s = transaction === 'location' ? '/mois' : '';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA${s}`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA${s}`;
  return price.toLocaleString('fr-DZ') + ` DA${s}`;
}

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

export function firstPhoto(listing: any): string {
  const p = listing?.photos;
  if (!p || !Array.isArray(p) || p.length === 0) return FALLBACK_PHOTO;
  return typeof p[0] === 'string' ? p[0] : (p[0]?.url ?? FALLBACK_PHOTO);
}

export function getPhotos(listing: any): string[] {
  const photos = listing?.photos;
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [FALLBACK_PHOTO];
  const urls = photos.map((p: any) => (typeof p === 'string' ? p : p?.url ?? '')).filter(Boolean);
  return urls.length ? urls : [FALLBACK_PHOTO];
}

function toIntlDz(raw: string): string {
  const d = raw.replace(/\D/g, '');
  return d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d;
}

export function buildWA(raw: string | null | undefined): string {
  if (!raw) return '';
  return `https://wa.me/${toIntlDz(raw)}`;
}

export function buildTel(raw: string | null | undefined): string {
  if (!raw) return '';
  return `tel:+${toIntlDz(raw)}`;
}
