import { MapPin, Bed, Square, Bookmark, Phone, MessageCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { formatPrice } from '../../utils/formatPrice';

interface PropertyCardProps {
  id: number;
  image: string;
  price: number;
  type: string;
  wilaya: string;
  commune: string;
  surface: number;
  rooms: number;
  bedrooms?: number;
  verified?: boolean;
  variant?: 'default' | 'featured' | 'bayut';
  transaction?: string;
  views_count?: number;
  created_at?: string;
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

function isNew(created_at?: string): boolean {
  if (!created_at) return false;
  const diff = Date.now() - new Date(created_at).getTime();
  return diff < 48 * 60 * 60 * 1000;
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  vente:      { bg: 'linear-gradient(135deg, #1B4FD8, #4F46E5)', text: '#ffffff' },
  location:   { bg: 'linear-gradient(135deg, #1B4FD8, #06b6d4)', text: '#ffffff' },
  colocation: { bg: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', text: '#ffffff' },
  terrain:    { bg: 'linear-gradient(135deg, #1B4FD8, #0369a1)', text: '#ffffff' },
  Vente:      { bg: 'linear-gradient(135deg, #1B4FD8, #4F46E5)', text: '#ffffff' },
  Location:   { bg: 'linear-gradient(135deg, #1B4FD8, #06b6d4)', text: '#ffffff' },
  Colocation: { bg: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', text: '#ffffff' },
  Terrain:    { bg: 'linear-gradient(135deg, #1B4FD8, #0369a1)', text: '#ffffff' },
};

function Badge({ type, transaction }: { type: string; transaction?: string }) {
  const key = transaction ?? type;
  const style = BADGE_STYLES[key] ?? BADGE_STYLES.vente;
  const label = transaction ? capitalize(transaction) : capitalize(type);
  return (
    <span style={{
      background: style.bg, color: style.text,
      fontSize: '1.05rem', fontWeight: 700,
      padding: '4px 10px', borderRadius: 20,
      letterSpacing: '0.01em', backdropFilter: 'blur(4px)',
    }}>
      {label}
    </span>
  );
}

export function PropertyCard({
  id, image, price, type, wilaya, commune,
  surface, rooms, bedrooms, verified,
  variant = 'default', transaction, views_count, created_at,
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const isMobile = useIsMobile();
  const newListing = isNew(created_at);

  const cardShadow = '0 2px 12px rgba(180,140,80,0.08), 0 1px 4px rgba(0,0,0,0.06)';
  const cardShadowHover = '0 12px 36px rgba(180,140,80,0.15), 0 4px 12px rgba(0,0,0,0.1)';

  // ── FEATURED ──────────────────────────────────────────────────────────────
  if (variant === 'featured') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', flexShrink: 0, width: isMobile ? '80vw' : 300, display: 'block' }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: cardShadow,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLElement).style.boxShadow = cardShadowHover;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'none';
            (e.currentTarget as HTMLElement).style.boxShadow = cardShadow;
          }}>

          {/* Photo */}
          <div style={{ position: 'relative', height: 200, background: '#F5F0E8' }}>
            <img src={image} alt={`${capitalize(type)} à ${commune}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
              onLoad={() => setImgLoaded(true)}
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; setImgLoaded(true); }} />

            {/* Gradient overlay bas */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }} />

            {/* Badge transaction uniquement */}
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <Badge type={type} transaction={transaction} />
            </div>

            {/* Prix overlay bas */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                  {formatPrice(price, transaction)}
                </span>
              </div>
              {/* Logo agence */}
              <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '3px 7px', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
                <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>D</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
              </div>
            </div>
          </div>

          {/* Infos */}
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>{capitalize(type)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', marginBottom: 10 }}>
              <MapPin style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, paddingTop: 10, borderTop: '1px solid #F5F0E8' }}>
              {surface > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280' }}>
                  <Square style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{surface} m²</span>
                </div>
              )}
              {(bedrooms ?? rooms) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280' }}>
                  <Bed style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{bedrooms ?? rooms} ch</span>
                </div>
              )}
              {views_count !== undefined && views_count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', marginLeft: 'auto' }}>
                  <Eye style={{ width: 13, height: 13 }} />
                  <span style={{ fontSize: '1.1rem' }}>{views_count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── BAYUT / LIST ──────────────────────────────────────────────────────────
  if (variant === 'bayut') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: '#fff', borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: cardShadow,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          transition: 'box-shadow 0.25s ease',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = cardShadowHover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = cardShadow}>

          <div style={{ position: 'relative', width: isMobile ? '100%' : 280, height: isMobile ? 220 : 'auto', flexShrink: 0, background: '#F5F0E8' }}>
            <img src={image} alt={`${capitalize(type)} à ${commune}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
              onLoad={() => setImgLoaded(true)}
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; setImgLoaded(true); }} />

            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {verified && (
                <span style={{ background: 'rgba(255,255,255,0.95)', color: '#059669', fontSize: '0.9rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>✓ Vérifié</span>
              )}
              <Badge type={type} transaction={transaction} />
            </div>

            {newListing && (
              <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg, #1B4FD8, #06b6d4)', color: '#fff', fontSize: '0.9rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                🔥 Nouveau
              </span>
            )}

            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '3px 7px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>D</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
            </div>

            <button onClick={e => { e.preventDefault(); setIsSaved(!isSaved); }}
              style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bookmark style={{ width: 16, height: 16, fill: isSaved ? '#1B4FD8' : 'none', color: isSaved ? '#1B4FD8' : '#374151' }} />
            </button>
          </div>

          <div style={{ flex: 1, padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: '1.2rem', color: '#9CA3AF', display: 'block', marginBottom: 2 }}>
                  {transaction === 'vente' || type === 'Vente' ? 'Prix de vente' : 'Loyer mensuel'}
                </span>
                <span style={{ fontSize: isMobile ? '1.7rem' : '2rem', fontWeight: 900, color: '#1B4FD8' }}>{formatPrice(price, transaction)}</span>
                {(transaction === 'location' || type === 'Location') && (
                  <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>/mois</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', marginBottom: 10 }}>
                <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                {surface > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Square style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                    <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{surface} m²</span>
                  </div>
                )}
                {(bedrooms ?? rooms) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bed style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                    <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{bedrooms ?? rooms} ch</span>
                  </div>
                )}
                {views_count !== undefined && views_count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', marginLeft: 'auto' }}>
                    <Eye style={{ width: 13, height: 13 }} />
                    <span style={{ fontSize: '1.2rem' }}>{views_count} vues</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <Phone style={{ width: 14, height: 14 }} /> Appeler
              </button>
              <button onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#F0FDF4', color: '#059669', border: '1.5px solid #6EE7B7', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <MessageCircle style={{ width: 14, height: 14 }} />
                {isMobile ? 'WA' : 'WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── DEFAULT ───────────────────────────────────────────────────────────────
  return (
    <Link to={`/listing/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: cardShadow,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLElement).style.boxShadow = cardShadowHover;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'none';
          (e.currentTarget as HTMLElement).style.boxShadow = cardShadow;
        }}>
        <div style={{ position: 'relative', height: 220, background: '#F5F0E8' }}>
          <img src={image} alt={`${capitalize(type)} à ${commune}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            onLoad={() => setImgLoaded(true)}
            onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; setImgLoaded(true); }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            <Badge type={type} transaction={transaction} />
            {newListing && <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.9rem', fontWeight: 800, padding: '4px 8px', borderRadius: 6 }}>🔥 Nouveau</span>}
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>{capitalize(type)}</p>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1B4FD8' }}>{formatPrice(price, transaction)}</span>
            {(transaction === 'location' || type === 'Location') && (
              <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>/mois</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', marginBottom: 10 }}>
            <MapPin style={{ width: 13, height: 13 }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #F5F0E8' }}>
            {surface > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Square style={{ width: 13, height: 13, color: '#9CA3AF' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{surface} m²</span>
              </div>
            )}
            {(bedrooms ?? rooms) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Bed style={{ width: 13, height: 13, color: '#9CA3AF' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{bedrooms ?? rooms} ch</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}