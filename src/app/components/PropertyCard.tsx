import { MapPin, Bed, Square, Star, Bookmark, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface PropertyCardProps {
  id: number;
  image: string;
  price: number;
  type: string;
  wilaya: string;
  commune: string;
  surface: number;
  rooms: number;
  featured?: boolean;
  rating?: number;
  variant?: 'default' | 'featured' | 'bayut';
  transaction?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// ✅ Prix formaté intelligemment
function smartPrice(price: number): string {
  if (!price) return '— DA';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA`;
  return price.toLocaleString('fr-DZ') + ' DA';
}

// ✅ Capitalize
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  vente:      { bg: '#1B4FD8', text: '#ffffff' },
  location:   { bg: '#16A34A', text: '#ffffff' },
  colocation: { bg: '#EA580C', text: '#ffffff' },
  terrain:    { bg: '#7C3AED', text: '#ffffff' },
  // majuscules aussi pour compatibilité
  Vente:      { bg: '#1B4FD8', text: '#ffffff' },
  Location:   { bg: '#16A34A', text: '#ffffff' },
  Colocation: { bg: '#EA580C', text: '#ffffff' },
  Terrain:    { bg: '#7C3AED', text: '#ffffff' },
};

function Badge({ type, transaction }: { type: string; transaction?: string }) {
  const key = transaction ?? type;
  const style = BADGE_STYLES[key] ?? BADGE_STYLES.vente;
  const label = transaction ? capitalize(transaction) : capitalize(type);
  return (
    <span style={{ background: style.bg, color: style.text, fontSize: '1.1rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, letterSpacing: '0.01em' }}>
      {label}
    </span>
  );
}

export function PropertyCard({
  id, image, price, type, wilaya, commune,
  surface, rooms, featured, rating = 4.8, variant = 'default', transaction
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const isMobile = useIsMobile();

  // ── FEATURED ──
  if (variant === 'featured') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', flexShrink: 0, width: isMobile ? '80vw' : 300, display: 'block' }}>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <div style={{ position: 'relative', height: 200 }}>
            <img src={image} alt={`${capitalize(type)} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Badges top gauche */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ background: '#fff', color: '#16A34A', fontSize: '0.9rem', fontWeight: 800, padding: '2px 6px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>✓ Vendeur vérifié</span>
              <Badge type={type} transaction={transaction} />
            </div>

            {/* Rating */}
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star className="w-3 h-3" style={{ fill: '#F5A623', color: '#F5A623' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{rating}</span>
            </div>

            {/* ✅ Prix formaté */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '4px 10px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B4FD8' }}>{smartPrice(price)}</span>
              {(transaction === 'location' || type === 'Location' || type === 'Colocation') && (
                <span style={{ fontSize: '1rem', color: '#9CA3AF' }}>/mois</span>
              )}
            </div>

            {/* Logo agence */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#fff', borderRadius: 6, padding: '3px 7px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 18, height: 18, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>D</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
            </div>
          </div>

          <div style={{ padding: '12px 14px' }}>
            {/* ✅ Type capitalize */}
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>{capitalize(type)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280', marginBottom: 8 }}>
              <MapPin className="w-4 h-4" style={{ color: '#9CA3AF' }} />
              <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4B5563' }}>
                <Square className="w-4 h-4 text-gray-400" />
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{surface} m²</span>
              </div>
              {rooms > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4B5563' }}>
                  <Bed className="w-4 h-4 text-gray-400" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{rooms} ch</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── BAYUT ──
  if (variant === 'bayut') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', transition: 'box-shadow 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}>

          <div style={{ position: 'relative', width: isMobile ? '100%' : 280, height: isMobile ? 220 : 'auto', flexShrink: 0 }}>
            <img src={image} alt={`${capitalize(type)} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ background: '#fff', color: '#16A34A', fontSize: '0.9rem', fontWeight: 800, padding: '2px 8px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>✓ Vendeur vérifié</span>
              <Badge type={type} transaction={transaction} />
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#fff', borderRadius: 6, padding: '3px 7px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 18, height: 18, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>D</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
            </div>
            <button onClick={e => { e.preventDefault(); setIsSaved(!isSaved); }}
              style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <Bookmark className="w-5 h-5" style={{ fill: isSaved ? '#1B4FD8' : 'none', color: isSaved ? '#1B4FD8' : '#374151' }} />
            </button>
          </div>

          <div style={{ flex: 1, padding: isMobile ? '14px 16px' : '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: isMobile ? 10 : 0 }}>
            <div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: '1.2rem', color: '#9CA3AF', display: 'block', marginBottom: 2 }}>
                  {transaction === 'vente' || type === 'Vente' ? 'Prix de vente' : 'Loyer mensuel'}
                </span>
                {/* ✅ Prix formaté */}
                <span style={{ fontSize: isMobile ? '1.5rem' : '1.7rem', fontWeight: 800, color: '#1B4FD8' }}>{smartPrice(price)}</span>
                {(transaction === 'location' || type === 'Location' || type === 'Colocation') && (
                  <span style={{ fontSize: '1.1rem', color: '#9CA3AF' }}>/mois</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', marginBottom: 10 }}>
                <MapPin className="w-4 h-4" style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                  <Square className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{surface} m²</span>
                </div>
                {rooms > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                    <Bed className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{rooms} ch</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                  <Star className="w-4 h-4" style={{ fill: '#F5A623', color: '#F5A623' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{rating}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <Phone className="w-4 h-4" /> Appeler
              </button>
              <button onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #16A34A', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                <MessageCircle className="w-4 h-4" />
                {isMobile ? 'WA' : 'WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── DEFAULT ──
  return (
    <Link to={`/listing/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', height: 220 }}>
          <img src={image} alt={`${capitalize(type)} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge type={type} transaction={transaction} />
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>{capitalize(type)}</p>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 800, color: '#1B4FD8', fontSize: '1.8rem' }}>{smartPrice(price)}</span>
            {(transaction === 'location' || type === 'Location' || type === 'Colocation') && (
              <span style={{ fontWeight: 400, color: '#6B7280', fontSize: '1.3rem' }}>/mois</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280', marginBottom: 10 }}>
            <MapPin className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Square className="w-4 h-4 text-gray-400" />
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{surface} m²</span>
            </div>
            {rooms > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Bed className="w-4 h-4 text-gray-400" />
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{rooms} ch</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}