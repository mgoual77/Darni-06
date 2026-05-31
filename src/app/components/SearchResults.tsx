import { useState, useEffect } from 'react';
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, MapPin, Phone, MessageCircle, Bookmark, Star, Bell, Search, ChevronDown, Map } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// ── Hook mobile ──────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function firstPhoto(listing: any): string {
  const photos = listing.photos;
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  if (!photos) return fb;
  if (Array.isArray(photos) && photos.length > 0) {
    const p = photos[0];
    return typeof p === 'string' ? p : p?.url ?? fb;
  }
  return fb;
}

// ── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIES = ['Tous', 'Vente', 'Location', 'Colocation', 'Terrain'];
const WILAYAS    = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'];
const RECOMMENDED = ['Appartements à vendre Alger', 'Villas Oran', 'Locations Hydra', 'Terrains Blida', 'Colocations Constantine'];

const BADGE_COLORS: Record<string, string> = {
  Vente: '#1B4FD8', Location: '#16A34A', Colocation: '#EA580C', Terrain: '#7C3AED',
};

type SortOption = 'recent' | 'prix-asc' | 'prix-desc';

// ── Composant ────────────────────────────────────────────────────────────────
export function SearchResults() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const isMobile      = useIsMobile();

  const [listings, setListings]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [activeWilaya, setActiveWilaya] = useState('');
  const [sortBy, setSortBy]             = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [savedIds, setSavedIds]         = useState<string[]>([]);
  const [searchText, setSearchText]     = useState(params.get('q') ?? '');

  // ── Fetch Supabase ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) console.error('Supabase error:', error);
        else setListings(data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Filtrage local ────────────────────────────────────────────────────────
  let filtered = listings;

  if (activeFilter !== 'Tous') {
    filtered = filtered.filter(l => l.transaction === activeFilter.toLowerCase() || l.type === activeFilter.toLowerCase());
  }
  if (activeWilaya) {
    filtered = filtered.filter(l => l.wilaya?.toLowerCase().includes(activeWilaya.toLowerCase()));
  }
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(l =>
      l.wilaya?.toLowerCase().includes(q) ||
      l.commune?.toLowerCase().includes(q) ||
      l.quartier?.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q)
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'prix-asc')  return (a.price ?? 0) - (b.price ?? 0);
    if (sortBy === 'prix-desc') return (b.price ?? 0) - (a.price ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const toggleSave = (id: string) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const headerHeight = isMobile ? 145 : 175;

  // ── Badge type ────────────────────────────────────────────────────────────
  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

  function getBadgeLabel(l: any) {
    if (l.transaction === 'vente') return 'Vente';
    if (l.transaction === 'location') return 'Location';
    if (l.type === 'terrain') return 'Terrain';
    return capitalize(l.transaction ?? l.type ?? 'vente');
  }

  function getBadgeColor(l: any) {
    const label = getBadgeLabel(l);
    return BADGE_COLORS[label] ?? '#1B4FD8';
  }

  function formatPrice(l: any) {
    if (!l.price) return '— DA';
    return l.price.toLocaleString('fr-DZ') + ' DA';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 40 }}>

      {/* ── HEADER FIXE ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Ligne 1 : retour + input + filtres */}
        <div style={{ padding: isMobile ? '10px 12px' : '10px 20px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <button onClick={() => navigate(-1)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft style={{ width: 22, height: 22, color: '#111827' }} />
          </button>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select style={{ padding: '8px 28px 8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', fontWeight: 600, color: '#374151', background: '#fff', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
              <option>Acheter</option>
              <option>Louer</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} />
            <input
              placeholder="Wilaya, commune..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {['Prêt', 'Budget'].map(f => (
                <button key={f} style={{ padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 500, color: '#374151', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{f}</button>
              ))}
            </div>
          )}

          <button style={{ padding: isMobile ? 8 : '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: isMobile ? 8 : 20, background: '#EEF2FF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <SlidersHorizontal style={{ width: 16, height: 16, color: '#1B4FD8' }} />
            {!isMobile && <span style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1B4FD8' }}>Filtres</span>}
          </button>
        </div>

        {/* Ligne 2 : résultats + tri */}
        <div style={{ padding: isMobile ? '6px 12px' : '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: isMobile ? '1.4rem' : '1.6rem', fontWeight: 700, color: '#111827' }}>Résultats </span>
            <span style={{ fontSize: '1.3rem', color: '#6B7280' }}>— {loading ? '...' : `${sorted.length} annonce${sorted.length > 1 ? 's' : ''}`}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSortMenu(!showSortMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>
              <ArrowUpDown style={{ width: 14, height: 14 }} />
              {sortBy === 'recent' ? 'Récent' : sortBy === 'prix-asc' ? 'Prix ↑' : 'Prix ↓'}
              <ChevronDown style={{ width: 12, height: 12 }} />
            </button>
            {showSortMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowSortMenu(false)} />
                <div style={{ position: 'absolute', top: 36, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 170, zIndex: 60 }}>
                  {[{ v: 'recent', l: 'Plus récent' }, { v: 'prix-asc', l: 'Prix croissant' }, { v: 'prix-desc', l: 'Prix décroissant' }].map((opt, i) => (
                    <button key={opt.v} onClick={() => { setSortBy(opt.v as SortOption); setShowSortMenu(false); }}
                      style={{ width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', borderTop: i > 0 ? '1px solid #F3F4F6' : 'none', background: sortBy === opt.v ? '#EEF2FF' : '#fff', color: sortBy === opt.v ? '#1B4FD8' : '#374151', fontSize: '1.3rem', fontWeight: sortBy === opt.v ? 700 : 400, cursor: 'pointer' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ligne 3 : filtres pills */}
        <div className="scrollbar-hide" style={{ overflowX: 'auto', padding: isMobile ? '0 12px 10px' : '0 20px 10px', display: 'flex', gap: 8 }}>
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
      <div style={{
        paddingTop: headerHeight,
        maxWidth: 1280,
        margin: '0 auto',
        padding: `${headerHeight}px ${isMobile ? '12px' : '24px'} 0`,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
        gap: 24,
        alignItems: 'start',
      }}>

        {/* ── COLONNE GAUCHE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Onglets wilayas */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: isMobile ? 12 : 20, borderBottom: '1px solid #E5E7EB', paddingBottom: 12, minWidth: 'max-content' }}>
              <button onClick={() => setActiveWilaya('')}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: !activeWilaya ? 700 : 400, color: !activeWilaya ? '#1B4FD8' : '#6B7280', cursor: 'pointer', paddingBottom: 4, borderBottom: !activeWilaya ? '2px solid #1B4FD8' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Toutes
              </button>
              {WILAYAS.map(w => {
                const active = activeWilaya === w;
                return (
                  <button key={w} onClick={() => setActiveWilaya(active ? '' : w)}
                    style={{ background: 'none', border: 'none', fontSize: '1.3rem', fontWeight: active ? 700 : 400, color: active ? '#1B4FD8' : '#6B7280', cursor: 'pointer', paddingBottom: 4, borderBottom: active ? '2px solid #1B4FD8' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ height: isMobile ? 200 : 200, background: '#f3f4f6', borderRadius: 14, animation: 'pulse 2s infinite' }} />
            ))
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Search style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>Aucune annonce trouvée</p>
              <p style={{ fontSize: '1.3rem', marginTop: 8 }}>Essayez un autre filtre ou wilaya</p>
            </div>
          ) : (
            sorted.map(listing => (
              <div key={listing.id}
                style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                onClick={() => navigate(`/listing/${listing.id}`)}>

                {/* Photo */}
                <div style={{ position: 'relative', width: isMobile ? '100%' : 260, height: isMobile ? 200 : 'auto', flexShrink: 0 }}>
                  <img src={firstPhoto(listing)} alt={listing.title ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: isMobile ? 0 : 180, display: 'block' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; }} />

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ background: '#fff', color: '#16A34A', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                      ✓ Vendeur vérifié
                    </span>
                    <span style={{ background: getBadgeColor(listing), color: '#fff', fontSize: '1.1rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, alignSelf: 'flex-start' }}>
                      {getBadgeLabel(listing)}
                    </span>
                  </div>

                  {listing.featured && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#eec64f', color: '#7a5800', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>⭐ Vedette</span>
                  )}

                  {/* Dots */}
                  <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: i === 0 ? 16 : 6, height: 5, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                    ))}
                  </div>

                  {/* Logo agence */}
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#fff', borderRadius: 8, padding: '4px 8px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>D</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>Darni Pro</span>
                  </div>
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, padding: isMobile ? '14px 16px' : '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Prix */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: '1.2rem', color: '#6B7280', fontWeight: 400 }}>
                          {listing.transaction === 'vente' ? 'Prix de vente' : 'Loyer mensuel'}
                        </span>
                        <div>
                          <span style={{ fontSize: isMobile ? '1.5rem' : '1.7rem', fontWeight: 800, color: '#1B4FD8' }}>
                            {formatPrice(listing)}
                          </span>
                          {listing.transaction === 'location' && (
                            <span style={{ fontSize: '1.1rem', color: '#9CA3AF' }}>/mois</span>
                          )}
                        </div>
                      </div>
                      {listing.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star style={{ width: 13, height: 13, fill: '#eec64f', color: '#eec64f' }} />
                          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#374151' }}>{listing.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Titre */}
                    {listing.title && (
                      <p style={{ fontSize: '1.3rem', color: '#111827', marginBottom: 4, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </p>
                    )}

                    {/* Specs */}
                    <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 4, fontWeight: 500 }}>
                      {listing.surface && `${listing.surface} m²`}
                      {listing.bedrooms && ` · ${listing.bedrooms} ch`}
                      {listing.rooms && ` · ${listing.rooms} pièces`}
                    </p>

                    {/* Description */}
                    {listing.description && (
                      <p style={{ fontSize: '1.2rem', color: '#6B7280', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {listing.description}
                      </p>
                    )}

                    {/* Localisation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF' }}>
                      <MapPin style={{ width: 13, height: 13, flexShrink: 0 }} />
                      <span style={{ fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[listing.commune, listing.wilaya].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                    <a href={listing.phone ? `tel:${listing.phone}` : '#'}
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                      <Phone style={{ width: 14, height: 14 }} /> Appeler
                    </a>
                    <a href={listing.whatsapp ? `https://wa.me/${listing.whatsapp?.replace(/\D/g, '')}` : listing.phone ? `https://wa.me/${listing.phone?.replace(/\D/g, '')}` : '#'}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #86EFAC', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                      <MessageCircle style={{ width: 14, height: 14 }} />
                      {isMobile ? 'WA' : 'WhatsApp'}
                    </a>
                    <button onClick={e => { e.stopPropagation(); toggleSave(listing.id); }}
                      style={{ width: 40, height: 40, border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bookmark style={{ width: 16, height: 16, fill: savedIds.includes(listing.id) ? '#1B4FD8' : 'none', color: savedIds.includes(listing.id) ? '#1B4FD8' : '#9CA3AF' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* CTA mobile */}
          {isMobile && (
            <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '18px', marginTop: 8 }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Vendez votre bien avec Darni</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 14 }}>Connectez-vous avec des acheteurs sérieux.</p>
              <button onClick={() => navigate('/publish')}
                style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Publier une annonce →
              </button>
            </div>
          )}
        </div>

        {/* ── SIDEBAR desktop ── */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 185 }}>
            {/* Mini carte */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ height: 160, background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)', position: 'relative' }}>
                <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%', opacity: 0.7 }}>
                  <rect width="280" height="160" fill="#E0F2FE" />
                  <line x1="0" y1="80" x2="280" y2="80" stroke="#BFDBFE" strokeWidth="1" />
                  <line x1="140" y1="0" x2="140" y2="160" stroke="#BFDBFE" strokeWidth="1" />
                  <circle cx="100" cy="70" r="12" fill="#1B4FD8" opacity="0.8" />
                  <path d="M100 82 L95 70 L105 70 Z" fill="#1B4FD8" opacity="0.8" />
                  <circle cx="100" cy="70" r="5" fill="white" />
                  <circle cx="170" cy="90" r="10" fill="#eec64f" opacity="0.9" />
                  <path d="M170 100 L165 90 L175 90 Z" fill="#eec64f" opacity="0.9" />
                  <circle cx="170" cy="90" r="4" fill="white" />
                </svg>
                <button style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '6px 16px', fontSize: '1.2rem', fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', whiteSpace: 'nowrap' }}>
                  <Map style={{ width: 14, height: 14, color: '#1B4FD8' }} /> Voir sur la carte
                </button>
              </div>
            </div>

            {/* CTA Publier */}
            <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '18px 18px 14px' }}>
              <span style={{ display: 'inline-block', background: '#EF4444', color: '#fff', fontSize: '1rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, marginBottom: 8 }}>NOUVEAU</span>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Vendez votre bien avec Darni</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 14 }}>Connectez-vous avec des acheteurs sérieux.</p>
              <button onClick={() => navigate('/publish')}
                style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Publier une annonce →
              </button>
            </div>

            {/* Alerte */}
            <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 10 }}>Soyez le premier à voir les nouvelles annonces</p>
              <button style={{ width: '100%', background: '#EEF2FF', color: '#1B4FD8', border: '1.5px solid #1B4FD8', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Bell style={{ width: 14, height: 14 }} /> M'alerter des nouveautés
              </button>
            </div>

            {/* Recherches populaires */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px' }}>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: 12 }}>Recherches populaires</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RECOMMENDED.map(r => (
                  <button key={r} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#1B4FD8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 0' }}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}