import { useState, useEffect } from 'react';
import { ChevronLeft, SlidersHorizontal, ArrowUpDown, MapPin, Phone, MessageCircle, Bookmark, Search, ChevronDown, Map, X, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { fetchVerifiedUserIds } from '../../lib/verifiedSellers';
import { useSEO } from '../../hooks/useSEO'
import { useIsMobile } from '../../hooks/useIsMobile';
import { firstPhoto } from '../../utils/listingHelpers';
import { formatPrice } from '../../utils/formatPrice';

function isNew(created_at?: string): boolean {
  if (!created_at) return false;
  return Date.now() - new Date(created_at).getTime() < 48 * 60 * 60 * 1000;
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const TYPES      = ['Appartement', 'Villa', 'Bureau', 'Local', 'Terrain', 'Autre'];
const WILAYAS    = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tlemcen'];
const PRICE_SUGGESTIONS = [
  { label: '< 1M DA',   min: 0,          max: 1_000_000   },
  { label: '1–3M DA',   min: 1_000_000,  max: 3_000_000   },
  { label: '3–5M DA',   min: 3_000_000,  max: 5_000_000   },
  { label: '5–10M DA',  min: 5_000_000,  max: 10_000_000  },
  { label: '10–20M DA', min: 10_000_000, max: 20_000_000  },
  { label: '> 20M DA',  min: 20_000_000, max: 0           },
];

type SortOption = 'recent' | 'prix-asc' | 'prix-desc';

export function SearchResults() {
  useSEO({
    title: 'Recherche immobilière en Algérie',
    description: "Recherchez parmi des milliers d'annonces immobilières vérifiées en Algérie. Filtrez par wilaya, type, prix et surface.",
    url: 'https://darni.app/search',
  })

  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const isMobile   = useIsMobile();

  const [listings, setListings]     = useState<any[]>([]);
  const [verifiedUserIds, setVerifiedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(false);
  const [sortBy, setSortBy]         = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilters, setShowFilters]   = useState(false);
  const [savedIds, setSavedIds]         = useState<string[]>([]);

  // Filtres actifs
  const [searchText, setSearchText]           = useState(params.get('q') ?? '');
  const [filterTransaction, setFilterTransaction] = useState('');
  const [filterType, setFilterType]           = useState('');
  const [filterWilaya, setFilterWilaya]       = useState('');
  const [priceMin, setPriceMin]               = useState('');
  const [priceMax, setPriceMax]               = useState('');

  // Filtres temporaires dans le panel
  const [tmpTransaction, setTmpTransaction] = useState('');
  const [tmpType, setTmpType]               = useState('');
  const [tmpWilaya, setTmpWilaya]           = useState('');
  const [tmpPriceMin, setTmpPriceMin]       = useState('');
  const [tmpPriceMax, setTmpPriceMax]       = useState('');

  const openFilters = () => {
    setTmpTransaction(filterTransaction); setTmpType(filterType);
    setTmpWilaya(filterWilaya); setTmpPriceMin(priceMin); setTmpPriceMax(priceMax);
    setShowFilters(true);
  };
  const applyFilters = () => {
    setFilterTransaction(tmpTransaction); setFilterType(tmpType);
    setFilterWilaya(tmpWilaya); setPriceMin(tmpPriceMin); setPriceMax(tmpPriceMax);
    setShowFilters(false);
  };
  const resetFilters = () => {
    setFilterTransaction(''); setFilterType(''); setFilterWilaya('');
    setPriceMin(''); setPriceMax('');
    setTmpTransaction(''); setTmpType(''); setTmpWilaya('');
    setTmpPriceMin(''); setTmpPriceMax('');
  };

  // Chips actifs
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filterTransaction) activeChips.push({ label: capitalize(filterTransaction), onRemove: () => setFilterTransaction('') });
  if (filterType)        activeChips.push({ label: capitalize(filterType),        onRemove: () => setFilterType('') });
  if (filterWilaya)      activeChips.push({ label: filterWilaya,                  onRemove: () => setFilterWilaya('') });
  if (priceMin || priceMax) activeChips.push({
    label: `${priceMin ? formatPrice(Number(priceMin)) : '0'} – ${priceMax ? formatPrice(Number(priceMax)) : '∞'}`,
    onRemove: () => { setPriceMin(''); setPriceMax(''); }
  });
  if (searchText) activeChips.push({ label: `"${searchText}"`, onRemove: () => setSearchText('') });

  const fetchListings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false });
      if (error) { console.error(error); setLoadError(true); }
      else {
        setListings(data ?? []);
        fetchVerifiedUserIds((data ?? []).map((l: any) => l.user_id)).then(setVerifiedUserIds);
      }
    } catch (e) { console.error(e); setLoadError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  let filtered = listings;
  if (filterTransaction) filtered = filtered.filter(l => l.transaction?.toLowerCase() === filterTransaction.toLowerCase());
  if (filterType)        filtered = filtered.filter(l => l.type?.toLowerCase() === filterType.toLowerCase());
  if (filterWilaya)      filtered = filtered.filter(l => l.wilaya?.toLowerCase().includes(filterWilaya.toLowerCase()));
  if (priceMin)          filtered = filtered.filter(l => (l.price ?? 0) >= Number(priceMin));
  if (priceMax)          filtered = filtered.filter(l => (l.price ?? 0) <= Number(priceMax));
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(l =>
      l.wilaya?.toLowerCase().includes(q) || l.commune?.toLowerCase().includes(q) ||
      l.quartier?.toLowerCase().includes(q) || l.title?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'prix-asc')  return (a.price ?? 0) - (b.price ?? 0);
    if (sortBy === 'prix-desc') return (b.price ?? 0) - (a.price ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const hasFilters = activeChips.length > 0;
  const headerH = isMobile ? (hasFilters ? 160 : 125) : (hasFilters ? 195 : 158);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 40 }}>

      {/* ── HEADER ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Ligne 1 */}
        <div style={{ padding: isMobile ? '10px 12px' : '10px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft style={{ width: 22, height: 22, color: '#374151' }} />
          </button>

          {/* Transaction select */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={filterTransaction} onChange={e => setFilterTransaction(e.target.value)}
              style={{ padding: '7px 28px 7px 10px', border: `1.5px solid ${filterTransaction ? '#1B4FD8' : '#E5E7EB'}`, borderRadius: 8, fontSize: '1.3rem', fontWeight: 600, color: filterTransaction ? '#1B4FD8' : '#374151', background: filterTransaction ? '#EEF2FF' : '#fff', appearance: 'none', cursor: 'pointer', outline: 'none' }}>
              <option value="">Transaction</option>
              <option value="vente">Acheter</option>
              <option value="location">Louer</option>
            </select>
            <ChevronDown style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#9CA3AF', pointerEvents: 'none' }} />
          </div>

          {/* Search input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF' }} />
            <input placeholder="Wilaya, commune, quartier..." value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box', background: '#FAFAF9' }}
              onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
              onBlur={e => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
          </div>

          {/* Filtres button */}
          <button onClick={openFilters}
            style={{ padding: isMobile ? '7px 10px' : '7px 14px', border: `1.5px solid ${hasFilters ? '#1B4FD8' : '#E5E7EB'}`, borderRadius: 8, background: hasFilters ? '#1B4FD8' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, position: 'relative' }}>
            <SlidersHorizontal style={{ width: 15, height: 15, color: hasFilters ? '#fff' : '#374151' }} />
            {!isMobile && <span style={{ fontSize: '1.2rem', fontWeight: 600, color: hasFilters ? '#fff' : '#374151' }}>Filtres{hasFilters ? ` (${activeChips.length})` : ''}</span>}
            {isMobile && hasFilters && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#EF4444', borderRadius: '50%', color: '#fff', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeChips.length}</span>}
          </button>
        </div>

        {/* Ligne 2 — résultats + tri */}
        <div style={{ padding: isMobile ? '5px 12px' : '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: '1.3rem', color: '#6B7280' }}>
            <span style={{ fontWeight: 700, color: '#111827' }}>{loading ? '…' : sorted.length} annonce{sorted.length > 1 ? 's' : ''}</span>
          </span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSortMenu(!showSortMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: '1.5px solid #E5E7EB', borderRadius: 20, fontSize: '1.2rem', fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer' }}>
              <ArrowUpDown style={{ width: 13, height: 13 }} />
              {sortBy === 'recent' ? 'Récent' : sortBy === 'prix-asc' ? 'Prix ↑' : 'Prix ↓'}
            </button>
            {showSortMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowSortMenu(false)} />
                <div style={{ position: 'absolute', top: 34, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 170, zIndex: 60 }}>
                  {[{ v: 'recent', l: 'Plus récent' }, { v: 'prix-asc', l: 'Prix croissant' }, { v: 'prix-desc', l: 'Prix décroissant' }].map((opt, i) => (
                    <button key={opt.v} onClick={() => { setSortBy(opt.v as SortOption); setShowSortMenu(false); }}
                      style={{ width: '100%', padding: '9px 14px', textAlign: 'left', border: 'none', borderTop: i > 0 ? '1px solid #F3F4F6' : 'none', background: sortBy === opt.v ? '#EEF2FF' : '#fff', color: sortBy === opt.v ? '#1B4FD8' : '#374151', fontSize: '1.3rem', fontWeight: sortBy === opt.v ? 700 : 400, cursor: 'pointer' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ligne 3 — chips actifs */}
        {hasFilters && (
          <div className="scrollbar-hide" style={{ overflowX: 'auto', padding: isMobile ? '0 12px 8px' : '0 20px 8px', display: 'flex', gap: 6, alignItems: 'center' }}>
            {activeChips.map((chip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#EEF2FF', border: '1px solid #C7D2FE', flexShrink: 0 }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1B4FD8' }}>{chip.label}</span>
                <button onClick={chip.onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X style={{ width: 12, height: 12, color: '#1B4FD8' }} />
                </button>
              </div>
            ))}
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '1.15rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              Tout effacer
            </button>
          </div>
        )}
      </div>

      {/* ── PANEL FILTRES ── */}
      {showFilters && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }} onClick={() => setShowFilters(false)} />
          <div style={{ position: 'fixed', top: isMobile ? 'auto' : '50%', bottom: isMobile ? 0 : 'auto', left: isMobile ? 0 : '50%', right: isMobile ? 0 : 'auto', transform: isMobile ? 'none' : 'translate(-50%,-50%)', width: isMobile ? '100%' : 480, maxHeight: '85vh', background: '#fff', borderRadius: isMobile ? '20px 20px 0 0' : 16, zIndex: 101, overflowY: 'auto', padding: '24px 20px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', margin: 0 }}>Filtres</h3>
              <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 22, height: 22, color: '#6B7280' }} />
              </button>
            </div>

            {/* Transaction */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Transaction</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ val: '', label: 'Tous' }, { val: 'vente', label: 'Vente' }, { val: 'location', label: 'Location' }].map(opt => (
                  <button key={opt.val} onClick={() => setTmpTransaction(opt.val)}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${tmpTransaction === opt.val ? '#1B4FD8' : '#E5E7EB'}`, background: tmpTransaction === opt.val ? '#EEF2FF' : '#fff', color: tmpTransaction === opt.val ? '#1B4FD8' : '#374151', fontWeight: 600, fontSize: '1.3rem', cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Type de bien</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => setTmpType('')}
                  style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${!tmpType ? '#1B4FD8' : '#E5E7EB'}`, background: !tmpType ? '#EEF2FF' : '#fff', color: !tmpType ? '#1B4FD8' : '#374151', fontWeight: !tmpType ? 700 : 500, fontSize: '1.2rem', cursor: 'pointer' }}>
                  Tous
                </button>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setTmpType(t.toLowerCase())}
                    style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${tmpType === t.toLowerCase() ? '#1B4FD8' : '#E5E7EB'}`, background: tmpType === t.toLowerCase() ? '#EEF2FF' : '#fff', color: tmpType === t.toLowerCase() ? '#1B4FD8' : '#374151', fontWeight: tmpType === t.toLowerCase() ? 700 : 500, fontSize: '1.2rem', cursor: 'pointer' }}>
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
                  style={{ width: '100%', padding: '10px 30px 10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none' }}>
                  <option value="">Toutes les wilayas</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Budget */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Budget</p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                {[{ label: 'Minimum', val: tmpPriceMin, set: setTmpPriceMin, ph: '0' }, { label: 'Maximum', val: tmpPriceMax, set: setTmpPriceMax, ph: 'Illimité' }].map(({ label, val, set, ph }) => (
                  <div key={label} style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 5 }}>{label}</label>
                    <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRICE_SUGGESTIONS.map(s => {
                  const active = tmpPriceMin === String(s.min || '') && tmpPriceMax === String(s.max || '');
                  return (
                    <button key={s.label} onClick={() => { setTmpPriceMin(s.min ? String(s.min) : ''); setTmpPriceMax(s.max ? String(s.max) : ''); }}
                      style={{ padding: '5px 11px', borderRadius: 20, border: `1.5px solid ${active ? '#1B4FD8' : '#E5E7EB'}`, background: active ? '#EEF2FF' : '#fff', color: active ? '#1B4FD8' : '#374151', fontSize: '1.15rem', fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setTmpTransaction(''); setTmpType(''); setTmpWilaya(''); setTmpPriceMin(''); setTmpPriceMax(''); }}
                style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: '1.3rem', cursor: 'pointer' }}>
                Réinitialiser
              </button>
              <button onClick={applyFilters}
                style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 10, background: '#1B4FD8', color: '#fff', fontWeight: 700, fontSize: '1.4rem', cursor: 'pointer' }}>
                Voir {sorted.length} résultat{sorted.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CONTENU ── */}
      <div style={{ paddingTop: headerH, maxWidth: 1280, margin: '0 auto', padding: `${headerH}px ${isMobile ? '12px' : '24px'} 0`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ── LISTE ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} style={{ height: 180, background: '#F3F4F6', borderRadius: 12 }} />)
          ) : loadError ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12 }}>
              <p style={{ fontSize: '1.4rem', color: '#991B1B', marginBottom: 14 }}>Impossible de charger les annonces. Vérifiez votre connexion.</p>
              <button onClick={fetchListings} style={{ padding: '9px 20px', background: '#fff', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', fontWeight: 700, cursor: 'pointer' }}>
                Réessayer
              </button>
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Search style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>Aucune annonce trouvée</p>
              {hasFilters && <button onClick={resetFilters} style={{ marginTop: 14, padding: '10px 22px', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1.3rem', cursor: 'pointer' }}>Effacer les filtres</button>}
            </div>
          ) : sorted.map(listing => {
            const newListing = isNew(listing.created_at);
            return (
              <div key={listing.id}
                style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E9E9E9', cursor: 'pointer', display: 'flex', flexDirection: isMobile ? 'column' : 'row', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
                onClick={() => navigate(`/listing/${listing.id}`)}>

                {/* Photo */}
                <div style={{ position: 'relative', width: isMobile ? '100%' : 240, height: isMobile ? 190 : 'auto', flexShrink: 0, minHeight: isMobile ? 0 : 160, background: '#F5F0E8' }}>
                  <img src={firstPhoto(listing.photos)} alt={listing.title ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'; }} />

                  {/* Gradient */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)' }} />

                  {/* Badge transaction — discret, en bas de photo */}
                  <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4 }}>
                    <span style={{
                      background: listing.transaction === 'location' ? 'linear-gradient(135deg, #1B4FD8, #06b6d4)' : 'linear-gradient(135deg, #1B4FD8, #4F46E5)',
                      color: '#fff', fontSize: '1rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 4,
                    }}>
                      {listing.transaction === 'location' ? 'Location' : 'Vente'}
                    </span>
                    {newListing && (
                      <span style={{ background: 'linear-gradient(135deg, #1B4FD8, #06b6d4)', color: '#fff', fontSize: '1rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>Nouveau</span>
                    )}
                  </div>

                  {/* Vérifié — icône discrète en haut, uniquement si le vendeur a une vérification approuvée */}
                  {verifiedUserIds.has(listing.user_id) && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 5, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3, backdropFilter: 'blur(4px)' }}>
                      <Check style={{ width: 11, height: 11, color: '#059669' }} />
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>Vérifié</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div style={{ flex: 1, padding: isMobile ? '12px 14px' : '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    {/* Prix + type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: isMobile ? '1.6rem' : '1.9rem', fontWeight: 900, color: '#1B4FD8', lineHeight: 1.1 }}>
                          {formatPrice(listing.price, listing.transaction)}
                        </div>
                        <div style={{ fontSize: '1.2rem', color: '#9CA3AF', marginTop: 1 }}>
                          {listing.transaction === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setSavedIds(prev => prev.includes(listing.id) ? prev.filter(i => i !== listing.id) : [...prev, listing.id]); }}
                        style={{ padding: 6, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
                        <Bookmark style={{ width: 18, height: 18, fill: savedIds.includes(listing.id) ? '#1B4FD8' : 'none', color: savedIds.includes(listing.id) ? '#1B4FD8' : '#D1D5DB' }} />
                      </button>
                    </div>

                    {/* Titre */}
                    {listing.title && (
                      <p style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </p>
                    )}

                    {/* Specs inline */}
                    <p style={{ fontSize: '1.2rem', color: '#6B7280', marginBottom: 5 }}>
                      {capitalize(listing.type)}
                      {listing.surface  && ` · ${listing.surface} m²`}
                      {listing.bedrooms && ` · ${listing.bedrooms} ch`}
                      {listing.rooms    && ` · ${listing.rooms} pièces`}
                    </p>

                    {/* Description — 2 lignes max */}
                    {listing.description && !isMobile && (
                      <p style={{ fontSize: '1.2rem', color: '#9CA3AF', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {listing.description}
                      </p>
                    )}

                    {/* Localisation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin style={{ width: 12, height: 12, color: '#9CA3AF', flexShrink: 0 }} />
                      <span style={{ fontSize: '1.2rem', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[listing.commune, listing.wilaya].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Footer card — CTA + agence */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                    {/* Boutons compacts */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={listing.phone ? `tel:${listing.phone}` : '#'} onClick={e => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1.25rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                        <Phone style={{ width: 13, height: 13 }} /> Appeler
                      </a>
                      <a href={listing.whatsapp ? `https://wa.me/${listing.whatsapp?.replace(/\D/g,'')}` : listing.phone ? `https://wa.me/${listing.phone?.replace(/\D/g,'')}` : '#'}
                        target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '1.25rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                        <MessageCircle style={{ width: 13, height: 13 }} /> WA
                      </a>
                    </div>

                    {/* Logo agence discret */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>D</span>
                      </div>
                      <span style={{ fontSize: '1.1rem', color: '#9CA3AF', fontWeight: 500 }}>Darni Pro</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CTA mobile */}
          {isMobile && sorted.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '18px', marginTop: 4 }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>Vendez avec Darni</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 12 }}>Des acheteurs sérieux vous attendent.</p>
              <button onClick={() => navigate('/publish')}
                style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer' }}>
                Publier une annonce →
              </button>
            </div>
          )}
        </div>

        {/* ── SIDEBAR desktop ── */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: headerH + 8 }}>
            {/* Mini carte */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ height: 150, background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)', position: 'relative' }}>
                <svg viewBox="0 0 280 150" style={{ width: '100%', height: '100%', opacity: 0.7 }}>
                  <rect width="280" height="150" fill="#E0F2FE" />
                  <circle cx="100" cy="70" r="10" fill="#1B4FD8" opacity="0.8" />
                  <path d="M100 80 L95 70 L105 70 Z" fill="#1B4FD8" opacity="0.8" />
                  <circle cx="100" cy="70" r="4" fill="white" />
                  <circle cx="170" cy="85" r="9" fill="#eec64f" opacity="0.9" />
                  <path d="M170 94 L165 85 L175 85 Z" fill="#eec64f" opacity="0.9" />
                  <circle cx="170" cy="85" r="3.5" fill="white" />
                </svg>
                <button style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: '5px 14px', fontSize: '1.2rem', fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Map style={{ width: 13, height: 13, color: '#1B4FD8' }} /> Voir sur la carte
                </button>
              </div>
            </div>

            {/* CTA vendeur */}
            <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', borderRadius: 14, padding: '16px' }}>
              <span style={{ display: 'inline-block', background: '#EF4444', color: '#fff', fontSize: '0.9rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, marginBottom: 8 }}>NOUVEAU</span>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Vendez avec Darni</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginBottom: 12 }}>Des acheteurs sérieux vous attendent.</p>
              <button onClick={() => navigate('/publish')}
                style={{ width: '100%', background: '#fff', color: '#00513F', border: 'none', borderRadius: 8, padding: '9px 0', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer' }}>
                Publier une annonce →
              </button>
            </div>

            {/* Recherches populaires */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', marginBottom: 10 }}>Recherches populaires</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Appartements à vendre Alger', 'Villas Oran', 'Locations Hydra', 'Terrains Blida', 'Bureaux Constantine'].map(r => (
                  <button key={r} onClick={() => setSearchText(r)} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#1B4FD8', fontSize: '1.2rem', cursor: 'pointer', padding: '3px 0' }}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}