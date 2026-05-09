import { MapPin, Bed, Square, Star, Bookmark, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface PropertyCardProps {
  id: number;
  image: string;
  price: number;
  type: 'Vente' | 'Location' | 'Colocation' | 'Terrain';
  wilaya: string;
  commune: string;
  surface: number;
  rooms: number;
  featured?: boolean;
  rating?: number;
  variant?: 'default' | 'featured' | 'bayut';
}

// ✅ BADGES CORRIGÉS — Vente = bleu, pas vert
const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  Vente:     { bg: '#1B4FD8', text: '#ffffff' },
  Location:  { bg: '#16A34A', text: '#ffffff' },
  Colocation:{ bg: '#EA580C', text: '#ffffff' },
  Terrain:   { bg: '#7C3AED', text: '#ffffff' },
};

function Badge({ type }: { type: string }) {
  const style = BADGE_STYLES[type] ?? BADGE_STYLES.Vente;
  return (
    <span
      style={{
        background: style.bg,
        color: style.text,
        fontSize: '1.1rem',
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 9999,
        letterSpacing: '0.01em',
      }}
    >
      {type}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span
      style={{
        background: '#F5A623',
        color: '#fff',
        fontSize: '1.1rem',
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Star className="w-3 h-3 fill-white" />
      Vedette
    </span>
  );
}

function formatPrice(price: number, type: string) {
  return (
    <>
      <span style={{ fontWeight: 800, color: '#1B4FD8', fontSize: '1.8rem' }}>
        {price.toLocaleString('fr-DZ')} DA
      </span>
      {(type === 'Location' || type === 'Colocation') && (
        <span style={{ fontWeight: 400, color: '#6B7280', fontSize: '1.3rem' }}>/mois</span>
      )}
    </>
  );
}

export function PropertyCard({
  id, image, price, type, wilaya, commune,
  surface, rooms, featured, rating = 4.8, variant = 'default'
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // ── FEATURED (carousel horizontal) ──
  if (variant === 'featured') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 300, display: 'block' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: 200 }}>
            <img src={image} alt={`${type} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Badges top gauche */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ background: '#fff', color: '#16A34A', fontSize: '0.9rem', fontWeight: 800, padding: '2px 6px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>✓ Vérifié</span>
              <Badge type={type} />
            </div>
            {featured && (
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <FeaturedBadge />
              </div>
            )}

            {/* Prix overlay bottom */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '4px 10px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1B4FD8' }}>{price.toLocaleString('fr-DZ')}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1B4FD8' }}> DA</span>
              {(type === 'Location' || type === 'Colocation') && <span style={{ fontSize: '1rem', color: '#9CA3AF' }}>/mois</span>}
            </div>

            {/* ✅ Logo agence bas droite */}
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: '#fff', borderRadius: 6, padding: '3px 7px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 18, height: 18, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>D</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
            </div>

            {/* Rating top right (si pas featured) */}
            {!featured && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star className="w-3 h-3" style={{ fill: '#F5A623', color: '#F5A623' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{rating}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '12px 14px' }}>
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

  // ── BAYUT (liste horizontale) ──
  if (variant === 'bayut') {
    return (
      <Link to={`/listing/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
        >
          {/* Image gauche */}
          <div style={{ position: 'relative', width: 280, flexShrink: 0 }}>
            <img src={image} alt={`${type} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
              <Badge type={type} />
            </div>
            {featured && (
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <FeaturedBadge />
              </div>
            )}
            <button
              onClick={e => { e.preventDefault(); setIsSaved(!isSaved); }}
              style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
            >
              <Bookmark className="w-5 h-5" style={{ fill: isSaved ? '#1B4FD8' : 'none', color: isSaved ? '#1B4FD8' : '#374151' }} />
            </button>
          </div>

          {/* Contenu droite */}
          <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Prix */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: '1.2rem', color: '#9CA3AF', display: 'block', marginBottom: 2 }}>
                  {type === 'Vente' ? 'Prix de vente' : 'Loyer mensuel'}
                </span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1B4FD8' }}>
                  {price.toLocaleString('fr-DZ')}
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1B4FD8' }}> DA</span>
                {(type === 'Location' || type === 'Colocation') && (
                  <span style={{ fontSize: '1.1rem', color: '#9CA3AF' }}>/mois</span>
                )}
              </div>

              {/* Localisation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', marginBottom: 12 }}>
                <MapPin className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{commune}, {wilaya}</span>
              </div>

              {/* Specs */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                  <Square className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{surface}</span>
                  <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>m²</span>
                </div>
                {rooms > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
                    <Bed className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{rooms}</span>
                    <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>chambres</span>
                  </div>
                )}
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                  <Star className="w-4 h-4" style={{ fill: '#F5A623', color: '#F5A623' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{rating}</span>
                </div>
              </div>
            </div>

            {/* Boutons CTA */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1640B0'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1B4FD8'}
              >
                <Phone className="w-4 h-4" /> Appeler
              </button>
              <button
                onClick={e => e.preventDefault()}
                style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #16A34A', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
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
          <img src={image} alt={`${type} à ${commune}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge type={type} />
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ marginBottom: 8 }}>{formatPrice(price, type)}</div>
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
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{rooms} chambres</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}