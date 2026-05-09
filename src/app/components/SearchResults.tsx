import { useState } from 'react';
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, MapPin, Square, Bed, Phone, MessageCircle, Bookmark, Star, Bell, Search, ChevronDown, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SEARCH_RESULTS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', price: 15000000, type: 'Vente' as const, wilaya: 'Alger', commune: 'Hydra', surface: 120, rooms: 3, rating: 4.9, featured: false, description: 'Superbe appartement en excellent état, vue dégagée, proche commodités' },
  { id: 2, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', price: 80000, type: 'Location' as const, wilaya: 'Oran', commune: 'Bir El Djir', surface: 95, rooms: 2, rating: 4.7, featured: false, description: 'Appartement lumineux au 3ème étage avec balcon et parking' },
  { id: 3, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', price: 12500000, type: 'Vente' as const, wilaya: 'Constantine', commune: 'El Khroub', surface: 110, rooms: 3, rating: 4.8, featured: false, description: 'Villa moderne avec jardin, sécurité 24/7, quartier résidentiel calme' },
  { id: 4, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', price: 45000, type: 'Colocation' as const, wilaya: 'Alger', commune: 'Ben Aknoun', surface: 140, rooms: 4, rating: 4.6, featured: false, description: 'Grande colocation meublée, toutes charges comprises, ambiance familiale' },
  { id: 5, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', price: 18000000, type: 'Vente' as const, wilaya: 'Alger', commune: 'Dély Ibrahim', surface: 150, rooms: 4, rating: 4.9, featured: true, description: 'Magnifique villa avec piscine, double garage, standing haut de gamme' },
  { id: 6, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', price: 9500000, type: 'Terrain' as const, wilaya: 'Blida', commune: 'Boufarik', surface: 300, rooms: 0, rating: 4.5, featured: false, description: 'Terrain viabilisé, titre foncier, idéal construction villa' },
];

const CATEGORIES = ['Tous', 'Vente', 'Location', 'Colocation', 'Terrain'];
const BADGE_COLORS: Record<string, string> = {
  Vente: '#1B4FD8', Location: '#16A34A', Colocation: '#EA580C', Terrain: '#7C3AED',
};

const WILAYAS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'];
const RECOMMENDED = ['Appartements à vendre Alger', 'Villas Oran', 'Locations Hydra', 'Terrains Blida', 'Colocations Constantine'];

type SortOption = 'recent' | 'prix-asc' | 'prix-desc' | 'note';

export function SearchResults() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = SEARCH_RESULTS.filter(l => activeFilter === 'Tous' || l.type === activeFilter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'prix-asc') return a.price - b.price;
    if (sortBy === 'prix-desc') return b.price - a.price;
    if (sortBy === 'note') return (b.rating ?? 0) - (a.rating ?? 0);
    return b.id - a.id;
  });

  const toggleSave = (id: number) => setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: 80 }}>

      {/* ── HEADER FIXE ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Search bar row */}
        <div style={{ padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <button onClick={() => navigate(-1)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft style={{ width: 22, height: 22, color: '#111827' }} />
          </button>

          {/* Dropdown type */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select style={{ padding: '8px 28px 8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', fontWeight: 600, color: '#374151', background: '#fff', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
              <option>Acheter</option>
              <option>Louer</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>

          {/* Input location */}
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} />
            <input placeholder="Wilaya, commune..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Filtres rapides */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {['Prêt', 'Budget'].map(f => (
              <button key={f} style={{ padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 500, color: '#374151', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{f}</button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 500, color: '#1B4FD8', background: '#EEF2FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <SlidersHorizontal style={{ width: 14, height: 14 }} /> Filtres
            </button>
          </div>
        </div>

        {/* Résultats + tri + vue */}
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>Résultats </span>
            <span style={{ fontSize: '1.3rem', color: '#6B7280' }}>— {sorted.length} annonce{sorted.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Tri */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowSortMenu(!showSortMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>
                <ArrowUpDown style={{ width: 14, height: 14 }} />
                {sortBy === 'recent' ? 'Récent' : sortBy === 'prix-asc' ? 'Prix ↑' : sortBy === 'prix-desc' ? 'Prix ↓' : 'Note'}
                <ChevronDown style={{ width: 12, height: 12 }} />
              </button>
              {showSortMenu && (
                <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 160, zIndex: 60 }}>
                  {[{ v: 'recent', l: 'Plus récent' }, { v: 'prix-asc', l: 'Prix croissant' }, { v: 'prix-desc', l: 'Prix décroissant' }, { v: 'note', l: 'Mieux notés' }].map((opt, i) => (
                    <button key={opt.v} onClick={() => { setSortBy(opt.v as SortOption); setShowSortMenu(false); }}
                      style={{ width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', borderTop: i > 0 ? '1px solid #F3F4F6' : 'none', background: sortBy === opt.v ? '#EEF2FF' : '#fff', color: sortBy === opt.v ? '#1B4FD8' : '#374151', fontSize: '1.3rem', fontWeight: sortBy === opt.v ? 700 : 400, cursor: 'pointer' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List / Map toggle */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 20, padding: 3, gap: 2 }}>
              {[{ mode: 'list', icon: <SlidersHorizontal style={{ width: 14, height: 14 }} />, label: 'Liste' },
                { mode: 'map', icon: <Map style={{ width: 14, height: 14 }} />, label: 'Carte' }].map(({ mode, icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode as 'list' | 'map')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 18, border: 'none', background: viewMode === mode ? '#fff' : 'transparent', color: viewMode === mode ? '#1B4FD8' : '#6B7280', fontSize: '1.2rem', fontWeight: viewMode === mode ? 700 : 500, cursor: 'pointer', boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtres pills */}
        <div className="scrollbar-hide" style={{ overflowX: 'auto', padding: '0 20px 10px', display: 'flex', gap: 8 }}>
          {CATEGORIES.map(cat => {
            const active = activeFilter === cat;
            return (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                style={{ padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${active ? '#1B4FD8' : '#E5E7EB'}`, background: active ? '#1B4FD8' : '#fff', color: active ? '#fff' : '#374151', fontWeight: active ? 700 : 500, fontSize: '1.2rem', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div style={{ paddingTop: 175, maxWidth: 1280, margin: '0 auto', padding: '175px 24px 0', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── COLONNE GAUCHE — Résultats ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Tabs wilayas comme Bayut */}
          <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #E5E7EB', paddingBottom: 12 }}>
            {WILAYAS.map((w, i) => (
              <button key={w} style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#1B4FD8' : '#6B7280', cursor: 'pointer', paddingBottom: 4, borderBottom: i === 0 ? '2px solid #1B4FD8' : '2px solid transparent' }}>
                {w}
              </button>
            ))}
            <button style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: 600, color: '#1B4FD8', cursor: 'pointer', marginLeft: 'auto' }}>
              Voir tout →
            </button>
          </div>

          {/* Cards style Bayut — compactes */}
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Search style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>Aucune annonce trouvée</p>
              <p style={{ fontSize: '1.3rem', marginTop: 8 }}>Essayez un autre filtre</p>
            </div>
          ) : (
            sorted.map(listing => (
              <div key={listing.id}
                style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                onClick={() => navigate(`/listing/${listing.id}`)}>

                {/* Photo */}
                <div style={{ position: 'relative', width: 260, flexShrink: 0 }}>
                  <img src={listing.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 180 }} />

                  {/* ✅ Badge "Vendeur vérifié" style TruCheck Bayut */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ background: '#fff', color: '#16A34A', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                      ✓ Vendeur vérifié
                    </span>
                    <span style={{ background: BADGE_COLORS[listing.type], color: '#fff', fontSize: '1.1rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{listing.type}</span>
                  </div>

                  {listing.featured && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#eec64f', color: '#7a5800', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>⭐ Vedette</span>
                  )}

                  {/* Dots pagination photo */}
                  <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: i === 0 ? 16 : 6, height: 5, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                    ))}
                  </div>

                  {/* ✅ Logo agence/broker — bas droite comme Bayut */}
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#fff', borderRadius: 8, padding: '4px 8px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 800 }}>D</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Prix + rating — taille réduite comme Bayut */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        {/* ✅ Prix plus petit et lisible comme Bayut */}
                        <span style={{ fontSize: '1.3rem', color: '#6B7280', fontWeight: 400 }}>
                          {listing.type === 'Vente' ? 'Prix de vente' : 'Loyer mensuel'}
                        </span>
                        <div>
                          <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1B4FD8' }}>
                            {listing.price.toLocaleString('fr-DZ')}
                          </span>
                          <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1B4FD8' }}> DA</span>
                          {(listing.type === 'Location' || listing.type === 'Colocation') && (
                            <span style={{ fontSize: '1.1rem', color: '#9CA3AF' }}>/mois</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star style={{ width: 13, height: 13, fill: '#eec64f', color: '#eec64f' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#374151' }}>{listing.rating}</span>
                      </div>
                    </div>

                    {/* Type + specs */}
                    <p style={{ fontSize: '1.3rem', color: '#374151', marginBottom: 4, fontWeight: 500 }}>
                      {listing.type === 'Terrain' ? 'Terrain' : 'Appartement'}
                      {listing.rooms > 0 && ` · ${listing.rooms} ch · `}
                      {` Surface: ${listing.surface} m²`}
                    </p>

                    {/* Description */}
                    <p style={{ fontSize: '1.2rem', color: '#6B7280', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {listing.description}
                    </p>

                    {/* Localisation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF' }}>
                      <MapPin style={{ width: 13, height: 13 }} />
                      <span style={{ fontSize: '1.2rem' }}>{listing.commune}, {listing.wilaya}</span>
                    </div>
                  </div>

                  {/* Boutons CTA */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                    <button onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Phone style={{ width: 14, height: 14 }} /> Appeler
                    </button>
                    <button onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #86EFAC', borderRadius: 8, padding: '9px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <MessageCircle style={{ width: 14, height: 14 }} /> WhatsApp
                    </button>
                    <button onClick={e => { e.stopPropagation(); toggleSave(listing.id); }}
                      style={{ width: 36, height: 36, border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bookmark style={{ width: 16, height: 16, fill: savedIds.includes(listing.id) ? '#1B4FD8' : 'none', color: savedIds.includes(listing.id) ? '#1B4FD8' : '#9CA3AF' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── SIDEBAR DROITE style Bayut ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 185 }}>

          {/* Mini carte */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ height: 160, background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* Fausse carte SVG */}
              <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%', opacity: 0.7 }}>
                <rect width="280" height="160" fill="#E0F2FE" />
                <line x1="0" y1="80" x2="280" y2="80" stroke="#BFDBFE" strokeWidth="1" />
                <line x1="140" y1="0" x2="140" y2="160" stroke="#BFDBFE" strokeWidth="1" />
                <line x1="0" y1="40" x2="280" y2="40" stroke="#BFDBFE" strokeWidth="0.5" />
                <line x1="0" y1="120" x2="280" y2="120" stroke="#BFDBFE" strokeWidth="0.5" />
                <line x1="70" y1="0" x2="70" y2="160" stroke="#BFDBFE" strokeWidth="0.5" />
                <line x1="210" y1="0" x2="210" y2="160" stroke="#BFDBFE" strokeWidth="0.5" />
                <circle cx="100" cy="70" r="12" fill="#1B4FD8" opacity="0.8" />
                <path d="M100 82 L95 70 L105 70 Z" fill="#1B4FD8" opacity="0.8" />
                <circle cx="100" cy="70" r="5" fill="white" />
                <circle cx="170" cy="90" r="10" fill="#eec64f" opacity="0.9" />
                <path d="M170 100 L165 90 L175 90 Z" fill="#eec64f" opacity="0.9" />
                <circle cx="170" cy="90" r="4" fill="white" />
              </svg>
              <button style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '6px 16px', fontSize: '1.2rem', fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Map style={{ width: 14, height: 14, color: '#1B4FD8' }} /> Voir sur la carte
              </button>
            </div>
          </div>

          {/* CTA Publier — style Bayut */}
          <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
              <svg viewBox="0 0 80 80" style={{ width: 80 }}>
                <circle cx="40" cy="40" r="40" fill="white" />
              </svg>
            </div>
            <span style={{ display: 'inline-block', background: '#EF4444', color: '#fff', fontSize: '1rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, marginBottom: 8 }}>NOUVEAU</span>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Vendez votre bien avec Darni</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 14 }}>Connectez-vous avec des acheteurs sérieux.</p>
            <button onClick={() => navigate('/publish')}
              style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Publier une annonce →
            </button>
          </div>

          {/* Alerte nouvelles annonces */}
          <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 10 }}>Soyez le premier à voir les nouvelles annonces</p>
            <button style={{ width: '100%', background: '#EEF2FF', color: '#1B4FD8', border: '1.5px solid #1B4FD8', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Bell style={{ width: 14, height: 14 }} /> M'alerter des nouveautés
            </button>
          </div>

          {/* Recherches recommandées */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px' }}>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: 12 }}>Recherches populaires</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECOMMENDED.map(r => (
                <button key={r} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#1B4FD8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 0', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}