import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Square, Bed, Bath, ChevronLeft, MessageCircle, Phone, Sparkles, Star, Share2, Bookmark, Calendar, Eye } from 'lucide-react';

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  Vente:      { bg: '#1B4FD8', text: '#fff' },
  Location:   { bg: '#16A34A', text: '#fff' },
  Colocation: { bg: '#EA580C', text: '#fff' },
  Terrain:    { bg: '#7C3AED', text: '#fff' },
};

const LISTING_DATA = {
  1: {
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    price: 15000000,
    type: 'Vente',
    title: 'Magnifique appartement à Hydra',
    description: "Superbe appartement situé dans le quartier résidentiel d'Hydra. Proche de toutes commodités, écoles et transports. Vue imprenable sur la ville. L'appartement est en excellent état avec des finitions de qualité supérieure.",
    wilaya: 'Alger',
    commune: 'Hydra',
    surface: 120,
    rooms: 3,
    bathrooms: 2,
    rating: 4.9,
    views: 1234,
    postedDate: '2026-04-15',
    features: ['Parking', 'Balcon', 'Ascenseur', 'Sécurité 24/7', 'Climatisation', 'Cuisine équipée'],
  },
};

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const listing = LISTING_DATA[Number(id) as keyof typeof LISTING_DATA] || LISTING_DATA[1];
  const badge = BADGE_STYLES[listing.type] ?? BADGE_STYLES.Vente;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Bonjour, je suis intéressé par votre annonce: ${listing.title} à ${listing.price.toLocaleString('fr-DZ')} DA`);
    window.open(`https://wa.me/213XXXXXXXXX?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, text: `Découvrez cette annonce sur Darni`, url: window.location.href });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 96 }}>

      {/* ── HEADER FIXE ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: 8, borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <ChevronLeft className="w-6 h-6" style={{ color: '#111827' }} />
          </button>

          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Détails</span>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleShare} style={{ padding: 8, borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer' }}>
              <Share2 className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <button onClick={() => setIsSaved(!isSaved)} style={{ padding: 8, borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer' }}>
              <Bookmark className="w-5 h-5" style={{ fill: isSaved ? '#1B4FD8' : 'none', color: isSaved ? '#1B4FD8' : '#374151' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── GALERIE PHOTOS ── */}
      <div style={{ position: 'relative', marginTop: 60 }}>
        <div className="scrollbar-hide" style={{ overflowX: 'auto', display: 'flex' }}>
          {listing.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Photo ${i + 1}`}
              style={{ width: '100%', height: 320, objectFit: 'cover', flexShrink: 0 }}
              onClick={() => setCurrentImageIndex(i)}
            />
          ))}
        </div>

        {/* Dots navigation */}
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {listing.images.map((_, i) => (
            <div key={i} style={{ height: 6, borderRadius: 99, background: '#fff', opacity: i === currentImageIndex ? 1 : 0.45, width: i === currentImageIndex ? 24 : 6, transition: 'all 0.2s' }} />
          ))}
        </div>

        {/* Badge type */}
        <div style={{ position: 'absolute', top: 12, left: 12, background: badge.bg, color: badge.text, fontSize: '1.1rem', fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>
          {listing.type}
        </div>

        {/* Rating */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star className="w-4 h-4" style={{ fill: '#F5A623', color: '#F5A623' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{listing.rating}</span>
        </div>

        {/* Compteur photos */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
          {currentImageIndex + 1}/{listing.images.length}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Prix + titre */}
        <div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1B4FD8', marginBottom: 6 }}>
            {listing.price.toLocaleString('fr-DZ')} DA
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: 10 }}>{listing.title}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', marginBottom: 10 }}>
            <MapPin className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 500 }}>{listing.commune}, {listing.wilaya}</span>
          </div>

          <div style={{ display: 'flex', gap: 16, color: '#9CA3AF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Eye className="w-4 h-4" />
              <span style={{ fontSize: '1.2rem' }}>{listing.views.toLocaleString()} vues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar className="w-4 h-4" />
              <span style={{ fontSize: '1.2rem' }}>Publié le {new Date(listing.postedDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: Square, value: `${listing.surface} m²`, label: 'Surface' },
            { icon: Bed, value: listing.rooms, label: 'Chambres' },
            { icon: Bath, value: listing.bathrooms, label: 'Sdb' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
              <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#1B4FD8' }} />
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: '1.1rem', color: '#9CA3AF', fontWeight: 400 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', marginBottom: 10 }}>Description</h3>
          <p style={{ fontSize: '1.4rem', color: '#4B5563', lineHeight: 1.7, fontWeight: 400 }}>{listing.description}</p>
        </div>

        {/* Caractéristiques */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', marginBottom: 14 }}>Caractéristiques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {listing.features.map((f) => (
              <div key={f} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', fontSize: '1.3rem', color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#1B4FD8' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Booster — or */}
          <button style={{ width: '100%', background: '#F5A623', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 2px 12px rgba(245,166,35,0.3)' }}>
            <Sparkles className="w-5 h-5" /> Booster cette annonce
          </button>

          {/* Appeler + WhatsApp côte à côte */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1640B0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1B4FD8'}
            >
              <Phone className="w-5 h-5" /> Appeler
            </button>
            <button
              onClick={handleWhatsApp}
              style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #16A34A', borderRadius: 14, padding: '14px 0', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}