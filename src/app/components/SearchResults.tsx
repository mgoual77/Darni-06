import { useState, useEffect } from 'react';
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, MapPin, Phone, MessageCircle, Bookmark, Star, Bell, Search, ChevronDown, Map, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const TYPES = ['Appartement', 'Villa', 'Bureau', 'Local', 'Terrain', 'Autre'];
const WILAYAS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tlemcen'];
const RECOMMENDED = ['Appartements à vendre Alger', 'Villas Oran', 'Locations Hydra', 'Terrains Blida', 'Colocations Constantine'];

const BADGE_COLORS: Record<string, string> = {
  Vente: '#1B4FD8', Location: '#16A34A', Colocation: '#EA580C', Terrain: '#7C3AED',
};

const PRICE_SUGGESTIONS = [
  { label: '< 1M DA',    min: 0,          max: 1_000_000   },
  { label: '1–3M DA',    min: 1_000_000,  max: 3_000_000   },
  { label: '3–5M DA',    min: 3_000_000,  max: 5_000_000   },
  { label: '5–10M DA',   min: 5_000_000,  max: 10_000_000  },
  { label: '10–20M DA',  min: 10_000_000, max: 20_000_000  },
  { label: '> 20M DA',   min: 20_000_000, max: 0           },
];

type SortOption = 'recent' | 'prix-asc' | 'prix-desc';

export function SearchResults() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const isMobile   = useIsMobile();

  const [listings, setListings]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sortBy, setSortBy]           = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds]       = useState<string[]>([]);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [searchText, setSearchText]     = useState(params.get('q') ?? '');
  const [filterTransaction, setFilterTransaction] = useState(''); // 'vente' | 'location' | ''
  const [filterType, setFilterType]     = useState('');  // 'appartement' | 'villa' | ...
  const [filterWilaya, setFilterWilaya] = useState('');
  const [priceMin, setPriceMin]         = useState('');
  const [priceMax, setPriceMax]         = useState('');

  // Temp filtres dans le panel (on applique à la fermeture)
  const [tmpTransaction, setTmpTransaction] = useState('');
  const [tmpType, setTmpType]               = useState('');
  const [tmpWilaya, setTmpWilaya]           = useState('');
  const [tmpPriceMin, setTmpPriceMin]       = useState('');
  const [tmpPriceMax, setTmpPriceMax]       = useState('');

  const openFilters = () => {
    setTmpTransaction(filterTransaction);
    setTmpType(filterType);
    setTmpWilaya(filterWilaya);
    setTmpPriceMin(priceMin);
    setTmpPriceMax(priceMax);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilterTransaction(tmpTransaction);
    setFilterType(tmpType);
    setFilterWilaya(tmpWilaya);
    setPriceMin(tmpPriceMin);
    setPriceMax(tmpPriceMax);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilterTransaction(''); setFilterType(''); setFilterWilaya('');
    setPriceMin(''); setPriceMax('');
    setTmpTransaction(''); setTmpType(''); setTmpWilaya('');
    setTmpPriceMin(''); setTmpPriceMax('');
  };

  // ── Chips actifs ──────────────────────────────────────────────────────────
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filterTransaction) activeChips.push({ label: capitalize(filterTransaction), onRemove: () => setFilterTransaction('') });
  if (filterType)        activeChips.push({ label: capitalize(filterType),        onRemove: () => setFilterType('') });
  if (filterWilaya)      activeChips.push({ label: filterWilaya,                  onRemove: () => setFilterWilaya('') });
  if (priceMin || priceMax) activeChips.push({
    label: `${priceMin ? Number(priceMin).toLocaleString('fr-DZ') : '0'} – ${priceMax ? Number(priceMax).toLocaleString('fr-DZ') : '∞'} DA`,
    onRemove: () => { setPriceMin(''); setPriceMax(''); }
  });
  if (searchText) activeChips.push({ label: `"${searchText}"`, onRemove: () => setSearchText('') });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings').select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setListings(data ?? []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // ── Filtrage local ────────────────────────────────────────────────────────
  let filtered = listings;

  if (filterTransaction) {
    filtered = filtered.filter(l =>
      l.transaction?.toLowerCase() === filterTransaction.toLowerCase()
    );
  }
  if (filterType) {
    filtered = filtered.filter(l =>
      l.type?.toLowerCase() === filterType.toLowerCase()
    );
  }
  if (filterWilaya) {
    filtered = filtered.filter(l =>
      l.wilaya?.toLowerCase().includes(filterWilaya.toLowerCase())
    );
  }
  if (priceMin) {
    filtered = filtered.filter(l => (l.price ?? 0) >= Number(priceMin));
  }
  if (priceMax) {
    filtered = filtered.filter(l => (l.price ?? 0) <= Number(priceMax));
  }
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(l =>
      l.wilaya?.toLowerCase().includes(q) ||
      l.commune?.toLowerCase().includes(q) ||
      l.quartier?.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'prix-asc')  return (a.price ?? 0) - (b.price ?? 0);
    if (sortBy === 'prix-desc') return (b.price ?? 0) - (a.price ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const toggleSave = (id: string) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  function getBadgeLabel(l: any) {
    if (l.transaction === 'vente')    return 'Vente';
    if (l.transaction === 'location') return 'Location';
    if (l.type === 'terrain')         return 'Terrain';
    return capitalize(l.transaction ?? l.type ?? 'vente');
  }
  function getBadgeColor(l: any) {
    return BADGE_COLORS[getBadgeLabel(l)] ?? '#1B4FD8';
  }
  function formatPrice(l: any) {
    if (!l.price) return '— DA';
    if (l.price >= 1_000_000_000) return `${(l.price / 1_000_000_000).toFixed(1).replace('.0','')} Mrd DA`;
    if (l.price >= 1_000_000)     return `${(l.price / 1_000_000).toFixed(1).replace('.0','')} M DA`;
    return l.price.toLocaleString('fr-DZ') + ' DA';
  }

  const hasActiveFilters = activeChips.length > 0;
  const headerHeight = isMobile
    ? (hasActiveFilters ? 175 : 145)
    : (hasActiveFilters ? 210 : 175);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 40 }}>

      {/* ── HEADER FIXE ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Ligne 1 : retour + search + filtres */}
        <div style={{ padding: isMobile ? '10px 12px' : '10px 20px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <button onClick={() => navigate(-1)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft style={{ width: 22, height: 22, color: '#111827' }} />
          </button>

          {/* Toggle transaction */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={filterTransaction}
              onChange={e => setFilterTransaction(e.target.value)}
              style={{ padding: '8px 28px 8px 12px', border: `1.5px solid ${filterTransaction ? '#1B4FD8' : '#E5E7EB'}`, borderRadius: 8, fontSize: '1.3rem', fontWeight: 600, color: filterTransaction ? '#1B4FD8' : '#374151', background: filterTransaction ? '#EEF2FF' : '#fff', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
              <option value="">Transaction</option>
              <option value="vente">Acheter</option>
              <option value="location">Louer</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>

          {/* Input search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} />
            <input
              placeholder="Wilaya, commune, quartier..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Bouton Filtres */}
          <button
            onClick={openFilters}
            style={{
              padding: isMobile ? 8 : '7px 14px',
              border: `1.5px solid ${hasActiveFilters ? '#1B4FD8' : '#E5E7EB'}`,
              borderRadius: isMobile ? 8 : 20,
              background: hasActiveFilters ? '#1B4FD8' : '#EEF2FF',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
              position: 'relative',
            }}>
            <SlidersHorizontal style={{ width: 16, height: 16, color: hasActiveFilters ? '#fff' : '#1B4FD8' }} />
            {!isMobile && <span style={{ fontSize: '1.2rem', fontWeight: 600, color: hasActiveFilters ? '#fff' : '#1B4FD8' }}>Filtres{hasActiveFilters ? ` (${activeChips.length})` : ''}</span>}
            {isMobile && hasActiveFilters && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#EF4444', borderRadius: '50%', color: '#fff', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeChips.length}</span>
            )}
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

        {/* Ligne 3 : chips actifs */}
        {hasActiveFilters && (
          <div className="scrollbar-hide" style={{ overflowX: 'auto', padding: isMobile ? '0 12px 10px' : '0 20px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeChips.map((chip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: '#EEF2FF', border: '1.5px solid #1B4FD8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1B4FD8' }}>{chip.label}</span>
                <button onClick={chip.onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <X style={{ width: 13, height: 13, color: '#1B4FD8' }} />
                </button>
              </div>
            ))}
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* ── PANEL FILTRES ── */}
      {showFilters && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={() => setShowFilters(false)} />
          <div style={{
            position: 'fixed',
            top: isMobile ? 'auto' : '50%',
            bottom: isMobile ? 0 : 'auto',
            left: isMobile ? 0 : '50%',
            right: isMobile ? 0 : 'auto',
            transform: isMobile ? 'none' : 'translate(-50%, -50%)',
            width: isMobile ? '100%' : 480,
            maxHeight: isMobile ? '85vh' : '80vh',
            background: '#fff',
            borderRadius: isMobile ? '20px 20px 0 0' : 16,
            zIndex: 101,
            overflowY: 'auto',
            padding: '24px 20px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', margin: 0 }}>Filtres</h3>
              <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 22, height: 22, color: '#6B7280' }} />
              </button>
            </div>

            {/* Transaction */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Type de transaction</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: '', label: 'Tous' }, { val: 'vente', label: 'Vente' }, { val: 'location', label: 'Location' }].map(opt => (
                  <button key={opt.val} onClick={() => setTmpTransaction(opt.val)}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${tmpTransaction === opt.val ? '#1B4FD8' : '#E5E7EB'}`, background: tmpTransaction === opt.val ? '#EEF2FF' : '#fff', color: tmpTransaction === opt.val ? '#1B4FD8' : '#374151', fontWeight: 600, fontSize: '1.3rem', cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de bien */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Type de bien</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => setTmpType('')}
                  style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${!tmpType ? '#1B4FD8' : '#E5E7EB'}`, background: !tmpType ? '#EEF2FF' : '#fff', color: !tmpType ? '#1B4FD8' : '#374151', fontWeight: !tmpType ? 700 : 500, fontSize: '1.2rem', cursor: 'pointer' }}>
                  Tous
                </button>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setTmpType(t.toLowerCase())}
                    style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${tmpType === t.toLowerCase() ? '#1B4FD8' : '#E5E7EB'}`, background: tmpType === t.toLowerCase() ? '#EEF2FF' : '#fff', color: tmpType === t.toLowerCase() ? '#1B4FD8' : '#374151', fontWeight: tmpType === t.toLowerCase() ? 700 : 500, fontSize: '1.2rem', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Wilaya */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Wilaya</p>
              <div style={{ position: 'relative' }}>
                <select value={tmpWilaya} onChange={e => setTmpWilaya(e.target.value)}
                  style={{ width: '100%', padding: '10px 32px 10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none' }}>
                  <option value="">Toutes les wilayas</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Prix */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Budget</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 5 }}>Minimum (DA)</label>
                  <input type="number" value={tmpPriceMin} onChange={e => setTmpPriceMin(e.target.value)}
                    placeholder="0"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 5 }}>Maximum (DA)</label>
                  <input type="number" value={tmpPriceMax} onChange={e => setTmpPriceMax(e.target.value)}
                    placeholder="Illimité"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRICE_SUGGESTIONS.map(s => {
                  const active = tmpPriceMin === String(s.min || '') && tmpPriceMax === String(s.max || '');
                  return (
                    <button key={s.label}
                      onClick={() => { setTmpPriceMin(s.min ? String(s.min) : ''); setTmpPriceMax(s.max ? String(s.max) : ''); }}
                      style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${active ? '#1B4FD8' : '#E5E7EB'}`, background: active ? '#EEF2FF' : '#fff', color: active ? '#1B4FD8' : '#374151', fontSize: '1.2rem', fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setTmpTransaction(''); setTmpType(''); setTmpWilaya(''); setTmpPriceMin(''); setTmpPriceMax(''); }}
                style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: '1.3rem', cursor: 'pointer' }}>
                Réinitialiser
              </button>
              <button onClick={applyFilters}
                style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 10, background: '#1B4FD8', color: '#fff', fontWeight: 700, fontSize: '1.4rem', cursor: 'pointer' }}>
                Voir les résultats ({sorted.length})
              </button>
            </div>
          </div>
        </>
      )}

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

          {/* Cards */}
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 200, background: '#f3f4f6', borderRadius: 14 }} />
            ))
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Search style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>Aucune annonce trouvée</p>
              <p style={{ fontSize: '1.3rem', marginTop: 8 }}>Modifiez vos filtres</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} style={{ marginTop: 16, padding: '10px 24px', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1.3rem', cursor: 'pointer' }}>
                  Effacer les filtres
                </button>
              )}
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

                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ background: '#fff', color: '#16A34A', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                      ✓ Vendeur vérifié
                    </span>
                    <span style={{ background: getBadgeColor(listing), color: '#fff', fontSize: '1.1rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, alignSelf: 'flex-start' }}>
                      {getBadgeLabel(listing)}
                    </span>
                  </div>

                  {listing.is_featured && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: '#eec64f', color: '#7a5800', fontSize: '1rem', fontWeight: 800, padding: '3px 8px', borderRadius: 20 }}>⭐ Vedette</span>
                  )}

                  <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: i === 0 ? 16 : 6, height: 5, borderRadius: 99, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                    ))}
                  </div>

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

                    {listing.title && (
                      <p style={{ fontSize: '1.3rem', color: '#111827', marginBottom: 4, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </p>
                    )}

                    <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 4, fontWeight: 500 }}>
                      {capitalize(listing.type)}
                      {listing.surface  && ` · ${listing.surface} m²`}
                      {listing.bedrooms && ` · ${listing.bedrooms} ch`}
                      {listing.rooms    && ` · ${listing.rooms} pièces`}
                    </p>

                    {listing.description && (
                      <p style={{ fontSize: '1.2rem', color: '#6B7280', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {listing.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF' }}>
                      <MapPin style={{ width: 13, height: 13, flexShrink: 0 }} />
                      <span style={{ fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[listing.commune, listing.wilaya].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                    <a href={listing.phone ? `tel:${listing.phone}` : '#'} onClick={e => e.stopPropagation()}
                      style={{ flex: 1, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                      <Phone style={{ width: 14, height: 14 }} /> Appeler
                    </a>
                    <a href={listing.whatsapp ? `https://wa.me/${listing.whatsapp?.replace(/\D/g, '')}` : listing.phone ? `https://wa.me/${listing.phone?.replace(/\D/g, '')}` : '#'}
                      target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
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
                <button style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '6px 16px', fontSize: '1.2rem', fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                  <Map style={{ width: 14, height: 14, color: '#1B4FD8' }} /> Voir sur la carte
                </button>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '18px 18px 14px' }}>
              <span style={{ display: 'inline-block', background: '#EF4444', color: '#fff', fontSize: '1rem', fontWeight: 800, padding: '1px 6px', borderRadius: 4, marginBottom: 8 }}>NOUVEAU</span>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Vendez votre bien avec Darni</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 14 }}>Connectez-vous avec des acheteurs sérieux.</p>
              <button onClick={() => navigate('/publish')}
                style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Publier une annonce →
              </button>
            </div>

            <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 10 }}>Soyez le premier à voir les nouvelles annonces</p>
              <button style={{ width: '100%', background: '#EEF2FF', color: '#1B4FD8', border: '1.5px solid #1B4FD8', borderRadius: 8, padding: '10px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Bell style={{ width: 14, height: 14 }} /> M'alerter des nouveautés
              </button>
            </div>

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