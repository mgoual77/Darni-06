const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

export function firstPhoto(photos: any[] | null | undefined): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return FALLBACK_PHOTO;
  const p = photos[0];
  if (typeof p === 'string') return p;
  return p?.url ?? FALLBACK_PHOTO;
}
