import { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowRight, ChevronDown, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { useNavigate, Link } from 'react-router-dom';
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

const HERO_TABS = [
  { label: 'Propriétés',     badge: null   },
  { label: 'Nouveaux biens', badge: 'NEW'  },
  { label: 'Transactions',   badge: null   },
  { label: 'Agences',        badge: null   },
];

const WILAYAS_TABS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif'];

const PRICE_RANGES = [
  { label: '< 1M DA',   min: '',         max: '1000000'  },
  { label: '1–3M DA',   min: '1000000',  max: '3000000'  },
  { label: '3–5M DA',   min: '3000000',  max: '5000000'  },
  { label: '5–10M DA',  min: '5000000',  max: '10000000' },
  { label: '10–20M DA', min: '10000000', max: '20000000' },
  { label: '> 20M DA',  min: '20000000', max: ''         },
];

const EstimationIllustration = () => (
  <svg viewBox="0 0 200 120" style={{ position: 'absolute', bottom: 0, right: 0, width: 140, opacity: 0.9 }}>
    <rect x="60" y="30" width="50" height="70" fill="#B8D4E8" rx="4" />
    <rect x="70" y="20" width="30" height="80" fill="#A0C4DC" rx="4" />
    <rect x="80" y="40" width="12" height="12" fill="white" rx="2" opacity="0.6" />
    <rect x="80" y="58" width="12" height="12" fill="white" rx="2" opacity="0.6" />
    <rect x="80" y="76" width="12" height="12" fill="white" rx="2" opacity="0.6" />
    <ellipse cx="30" cy="95" rx="20" ry="8" fill="#C8DFC8" />
    <rect x="25" y="60" width="10" height="35" fill="#8BBF8B" rx="2" />
    <circle cx="30" cy="58" r="12" fill="#7AB87A" />
    <path d="M120 15 L135 5 L140 20 Z" fill="#eec64f" opacity="0.9" />
    <circle cx="132" cy="8" r="8" fill="none" stroke="#eec64f" strokeWidth="2" />
    <text x="129" y="12" fontSize="8" fill="#eec64f" fontWeight="bold">$$</text>
  </svg>
);

const SearchIllustration = () => (
  <svg viewBox="0 0 200 120" style={{ position: 'absolute', bottom: 0, right: 0, width: 140, opacity: 0.9 }}>
    <rect x="0" y="80" width="200" height="5" fill="#B8D4E8" rx="2" />
    <rect x="50" y="30" width="40" height="50" fill="#B8D4E8" rx="4" />
    <rect x="58" y="20" width="25" height="60" fill="#A0C4DC" rx="4" />
    <rect x="120" y="40" width="35" height="40" fill="#B8D4E8" rx="4" />
    <circle cx="140" cy="38" r="10" fill="#1B4FD8" opacity="0.7" />
    <circle cx="85" cy="28" r="8" fill="#1B4FD8" opacity="0.5" />
    <ellipse cx="35" cy="90" rx="15" ry="6" fill="#C8DFC8" />
    <rect x="30" y="68" width="8" height="22" fill="#8BBF8B" rx="2" />
    <circle cx="34" cy="66" r="9" fill="#7AB87A" />
    <ellipse cx="165" cy="90" rx="12" ry="5" fill="#C8DFC8" />
    <rect x="161" y="72" width="7" height="18" fill="#8BBF8B" rx="2" />
    <circle cx="164" cy="70" r="8" fill="#7AB87A" />
  </svg>
);

const MapIllustration = () => (
  <svg viewBox="0 0 200 120" style={{ position: 'absolute', bottom: 0, right: 0, width: 140, opacity: 0.9 }}>
    <ellipse cx="100" cy="100" rx="80" ry="20" fill="#C8DFC8" opacity="0.4" />
    <rect x="55" y="40" width="35" height="55" fill="#B8D4E8" rx="4" />
    <rect x="63" y="30" width="20" height="65" fill="#A0C4DC" rx="4" />
    <rect x="110" y="55" width="28" height="40" fill="#B8D4E8" rx="4" />
    <circle cx="100" cy="20" r="12" fill="#eec64f" />
    <path d="M100 32 L94 20 L106 20 Z" fill="#eec64f" />
    <circle cx="100" cy="20" r="5" fill="white" />
    <circle cx="145" cy="45" r="9" fill="#1B4FD8" opacity="0.7" />
    <path d="M145 54 L140 45 L150 45 Z" fill="#1B4FD8" opacity="0.7" />
    <circle cx="145" cy="45" r="4" fill="white" />
    <ellipse cx="40" cy="95" rx="18" ry="7" fill="#C8DFC8" />
    <rect x="36" y="72" width="8" height="23" fill="#8BBF8B" rx="2" />
    <circle cx="40" cy="70" r="10" fill="#7AB87A" />
  </svg>
);

const FEATURE_CARDS = [
  { title: 'Estimation gratuite', description: 'Estimez la valeur de votre bien en quelques secondes', bg: '#E8F4F8', illustration: <EstimationIllustration /> },
  { title: 'Recherche avancée',   description: 'Trouvez votre bien par wilaya, quartier ou budget',   bg: '#E8F4F8', illustration: <SearchIllustration /> },
  { title: 'Vue sur carte',       description: 'Explorez les biens disponibles sur une carte interactive', bg: '#E8F4F8', illustration: <MapIllustration /> },
];

const BADGE_COLORS: Record<string, string> = {
  Vente: 'linear-gradient(135deg, #1B4FD8, #4F46E5)',
  Location: 'linear-gradient(135deg, #1B4FD8, #06b6d4)',
  Colocation: 'linear-gradient(135deg, #1B4FD8, #7C3AED)',
  Terrain: 'linear-gradient(135deg, #1B4FD8, #0369a1)',
  vente: 'linear-gradient(135deg, #1B4FD8, #4F46E5)',
  location: 'linear-gradient(135deg, #1B4FD8, #06b6d4)',
  terrain: 'linear-gradient(135deg, #1B4FD8, #0369a1)',
};

function smartPrice(price: number): string {
  if (!price) return '— DA';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA`;
  return price.toLocaleString('fr-DZ') + ' DA';
}

function firstPhoto(listing: any): string {
  const photos = listing.photos;
  if (!photos || !Array.isArray(photos) || photos.length === 0) return '/placeholder.jpg';
  const p = photos[0];
  if (typeof p === 'string') return p;
  return p?.url ?? '/placeholder.jpg';
}

function withImage(listing: any) {
  return { ...listing, image: firstPhoto(listing) };
}

// Liens footer avec routes
const FOOTER_COLS = [
  {
    title: 'Propriétés',
    links: [
      { label: 'Vente',             to: '/search?transaction=vente'    },
      { label: 'Location',          to: '/search?transaction=location' },
      { label: 'Colocation',        to: '/search'                      },
      { label: 'Terrains',          to: '/search?type=terrain'         },
      { label: 'Nouvelles annonces',to: '/search'                      },
    ],
  },
  {
    title: 'Wilayas',
    links: [
      { label: 'Alger',       to: '/search?q=Alger'       },
      { label: 'Oran',        to: '/search?q=Oran'        },
      { label: 'Constantine', to: '/search?q=Constantine' },
      { label: 'Annaba',      to: '/search?q=Annaba'      },
      { label: 'Blida',       to: '/search?q=Blida'       },
    ],
  },
  {
    title: 'Darni',
    links: [
      { label: 'À propos',          to: '/a-propos' },
      { label: 'Contact',           to: '/a-propos' },
      { label: 'Publier annonce',   to: '/publish'  },
      { label: 'Agences partenaires', to: '/a-propos' },
      { label: 'Aide',              to: '/a-propos' },
    ],
  },
];

export function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchType, setSearchType]               = useState<'Vente' | 'Location'>('Vente');
  const [heroTab, setHeroTab]                     = useState('Propriétés');
  const [searchText, setSearchText]               = useState('');
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceMin, setPriceMin]                   = useState('');
  const [priceMax, setPriceMax]                   = useState('');
  const [activeWilaya, setActiveWilaya]           = useState('Alger');
  const carouselRef                               = useRef<HTMLDivElement>(null);
  const [listings, setListings]                   = useState<any[]>([]);
  const [loading, setLoading]                     = useState(true);

  const scrollCarousel = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase.from('listings').select('*');
        if (error) console.error('Erreur Supabase :', error);
        else setListings(data ?? []);
      } catch (err) {
        console.error('Erreur inattendue :', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const featuredListings = listings.filter(l => l.is_featured === true).slice(0, 5).map(withImage);
  const filteredByWilaya = listings
    .filter(l => l.wilaya?.toLowerCase().includes(activeWilaya.toLowerCase()) ||
                 activeWilaya.toLowerCase().includes(l.wilaya?.toLowerCase() ?? ''))
    .map(withImage);

  const px = isMobile ? '16px' : '24px';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── HERO ── */}
      {isMobile ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
            <img src="/hero.png" alt="Darni" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
              <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: 900, textAlign: 'center', textShadow: '0 2px 12px rgba(0,0,0,0.6)', lineHeight: 1.15, marginBottom: 6 }}>
                Trouvez votre futur chez-vous.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1.3rem', textAlign: 'center', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                L'immobilier en Algérie, en toute sérénité.
              </p>
            </div>
          </div>

          <div style={{ margin: '0 12px', marginTop: -20, position: 'relative', zIndex: 10 }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', padding: '0 6px', borderBottom: '1px solid #F3F4F6', overflowX: 'auto' }}>
                {HERO_TABS.map(({ label, badge }) => {
                  const active = heroTab === label;
                  return (
                    <button key={label} onClick={() => setHeroTab(label)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 10px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: active ? 700 : 500, color: active ? '#1B4FD8' : '#6B7280', borderBottom: active ? '2px solid #1B4FD8' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {label}
                      {badge && <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 4px', borderRadius: 3 }}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
                  {(['Vente', 'Location'] as const).map(t => (
                    <button key={t} onClick={() => setSearchType(t)}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.4rem', background: searchType === t ? '#1B4FD8' : 'transparent', color: searchType === t ? '#fff' : '#6B7280', transition: 'all 0.15s' }}>
                      {t === 'Vente' ? 'Acheter' : 'Louer'}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} />
                  <input type="text" placeholder="Ville, quartier, ou wilaya..." value={searchText} onChange={e => setSearchText(e.target.value)}
                    style={{ width: '100%', padding: '13px 14px 13px 40px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.4rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                    onBlur={e  => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
                </div>
                <button onClick={() => navigate(`/search${searchText.trim() ? `?q=${encodeURIComponent(searchText)}` : ''}`)}
                  style={{ width: '100%', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(27,79,216,0.3)' }}>
                  <Search style={{ width: 17, height: 17 }} /> Rechercher
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ label: 'Type', options: ['Appartement', 'Maison', 'Villa', 'Terrain'] }, { label: 'Chambres', options: ['Studio', '1', '2', '3', '4+'] }].map(f => (
                    <div key={f.label} style={{ position: 'relative', flex: 1 }}>
                      <select style={{ width: '100%', padding: '10px 28px 10px 12px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none' }}>
                        <option>{f.label}</option>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', overflow: 'hidden', height: 720, marginBottom: 40 }}>
          <img src="/hero.png" alt="Darni"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.82)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.3) 100%)' }} />
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', maxWidth: 680, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <h1 style={{ color: '#fff', fontSize: '4.4rem', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 8, textShadow: '0 2px 16px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
              Trouvez votre futur chez-vous.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.6rem', fontWeight: 400, textAlign: 'center', marginBottom: 28, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
              L'immobilier en Algérie, en toute sérénité.
            </p>
            <div style={{ background: '#fff', borderRadius: 16, padding: '0 0 6px', width: '100%', maxWidth: 660, boxShadow: '0 16px 60px rgba(0,0,0,0.35)' }}>
              <div style={{ display: 'flex', gap: 0, padding: '0 6px', borderBottom: '1px solid #F3F4F6', overflowX: 'auto' }}>
                {HERO_TABS.map(({ label, badge }) => {
                  const active = heroTab === label;
                  return (
                    <button key={label} onClick={() => setHeroTab(label)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.3rem', fontWeight: active ? 700 : 500, color: active ? '#1B4FD8' : '#6B7280', borderBottom: active ? '2px solid #1B4FD8' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {label}
                      {badge && <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 4px', borderRadius: 3 }}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ padding: '10px 10px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3, flexShrink: 0 }}>
                  {(['Vente', 'Location'] as const).map(t => (
                    <button key={t} onClick={() => setSearchType(t)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.3rem', background: searchType === t ? '#1B4FD8' : 'transparent', color: searchType === t ? '#fff' : '#6B7280', whiteSpace: 'nowrap', boxShadow: searchType === t ? '0 2px 6px rgba(27,79,216,0.3)' : 'none' }}>
                      {t === 'Vente' ? 'Acheter' : 'Louer'}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} />
                  <input type="text" placeholder="Ville, quartier, ou wilaya..." value={searchText} onChange={e => setSearchText(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 40px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.4rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                    onBlur={e  => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
                </div>
                <button onClick={() => navigate(`/search${searchText.trim() ? `?q=${encodeURIComponent(searchText)}` : ''}`)}
                  style={{ background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, boxShadow: '0 4px 12px rgba(27,79,216,0.3)' }}>
                  <Search style={{ width: 16, height: 16 }} /> Rechercher
                </button>
              </div>
              <div style={{ padding: '8px 10px 10px', display: 'flex', gap: 8 }}>
                {[{ label: 'Type', options: ['Appartement', 'Maison', 'Villa', 'Terrain'] }, { label: 'Chambres', options: ['Studio', '1', '2', '3', '4+'] }].map(f => (
                  <div key={f.label} style={{ position: 'relative', flex: 1 }}>
                    <select style={{ width: '100%', padding: '10px 32px 10px 14px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none', cursor: 'pointer', fontWeight: 500 }}>
                      <option>{f.label}</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                ))}
                <div style={{ position: 'relative', flex: 1 }}>
                  <button onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                    style={{ width: '100%', padding: '7px 12px', background: showPriceDropdown ? '#EEF2FF' : '#fff', border: `1.5px solid ${showPriceDropdown ? '#1B4FD8' : '#E5E7EB'}`, borderRadius: 8, fontSize: '1.2rem', color: priceMin || priceMax ? '#1B4FD8' : '#374151', fontWeight: priceMin || priceMax ? 700 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>{priceMin || priceMax ? `${priceMin || '0'} — ${priceMax || '∞'} DA` : 'Prix (DA)'}</span>
                    <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF', transform: showPriceDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </button>
                  {showPriceDropdown && (
                    <div style={{ position: 'absolute', top: 40, left: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, padding: 16, minWidth: 300 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {[{ label: 'Minimum', val: priceMin, set: setPriceMin, placeholder: '0' }, { label: 'Maximum', val: priceMax, set: setPriceMax, placeholder: 'Illimité' }].map(({ label, val, set, placeholder }) => (
                          <div key={label}>
                            <label style={{ display: 'block', fontSize: '1.1rem', color: '#9CA3AF', fontWeight: 500, marginBottom: 6 }}>{label}</label>
                            <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: '1.3rem', outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                              onBlur={e  => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {PRICE_RANGES.map(s => (
                          <button key={s.label} onClick={() => { setPriceMin(s.min); setPriceMax(s.max); }}
                            style={{ padding: '4px 10px', borderRadius: 20, border: '1.5px solid', borderColor: priceMin === s.min && priceMax === s.max ? '#1B4FD8' : '#E5E7EB', background: priceMin === s.min && priceMax === s.max ? '#EEF2FF' : '#fff', color: priceMin === s.min && priceMax === s.max ? '#1B4FD8' : '#374151', fontSize: '1.1rem', fontWeight: 500, cursor: 'pointer' }}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button onClick={() => { setPriceMin(''); setPriceMax(''); }} style={{ padding: '9px 0', border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#374151', fontSize: '1.3rem', fontWeight: 600, cursor: 'pointer' }}>Réinitialiser</button>
                        <button onClick={() => setShowPriceDropdown(false)} style={{ padding: '9px 0', border: 'none', borderRadius: 8, background: '#1B4FD8', color: '#fff', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer' }}>Valider</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: `0 ${px}`, display: 'flex', flexDirection: 'column', gap: isMobile ? 32 : 48 }}>

        {/* 1. Feature cards */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 14 : 20 }}>
            {FEATURE_CARDS.map(({ title, description, bg, illustration }) => (
              <div key={title} style={{ position: 'relative', background: bg, borderRadius: 16, padding: '24px 24px 0', overflow: 'hidden', cursor: 'pointer', minHeight: isMobile ? 130 : 160 }}>
                <h3 style={{ fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 700, color: '#111827', marginBottom: 6, position: 'relative', zIndex: 1 }}>{title}</h3>
                <p style={{ fontSize: '1.3rem', color: '#4B5563', maxWidth: isMobile ? '65%' : 160, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                  {description} <span style={{ color: '#1B4FD8' }}>›</span>
                </p>
                {illustration}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Biens en vedette */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>Biens en vedette</h2>
              <p style={{ fontSize: '1.4rem', color: '#6B7280' }}>Les meilleures opportunités sélectionnées pour vous</p>
            </div>
            {!isMobile && (
              <div style={{ display: 'flex', gap: 8 }}>
                {(['left', 'right'] as const).map(dir => (
                  <button key={dir} onClick={() => scrollCarousel(dir)}
                    style={{ width: 40, height: 40, border: '1.5px solid #E5E7EB', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {dir === 'left' ? <ChevronLeft style={{ width: 18, height: 18 }} /> : <ChevronRight style={{ width: 18, height: 18 }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div ref={carouselRef} className="scrollbar-hide" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {loading
              ? [...Array(3)].map((_, i) => <div key={i} style={{ minWidth: 280, height: 320, background: '#f3f4f6', borderRadius: 16, flexShrink: 0 }} />)
              : featuredListings.length > 0
                ? featuredListings.map(l => <PropertyCard key={l.id} {...l} variant="featured" />)
                : <p style={{ color: '#9CA3AF', fontSize: '1.4rem' }}>Aucun bien en vedette pour le moment.</p>
            }
          </div>
        </section>

        {/* 3. Banner CTA vendeur */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', padding: isMobile ? '28px 20px' : '32px 40px' }}>
          <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 160, opacity: 0.15, pointerEvents: 'none' }}>
            <svg viewBox="0 0 200 200" style={{ height: '100%' }}>
              <rect x="10" y="50" width="22" height="120" fill="white" rx="4" />
              <rect x="44" y="25" width="22" height="145" fill="white" rx="4" />
              <rect x="78" y="55" width="22" height="115" fill="white" rx="4" />
              <rect x="112" y="35" width="22" height="135" fill="white" rx="4" />
              <rect x="146" y="60" width="22" height="110" fill="white" rx="4" />
            </svg>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 20 : 24 }}>
            <div>
              <span style={{ display: 'inline-block', background: '#EF4444', color: '#fff', fontSize: '0.9rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, marginBottom: 10, letterSpacing: '0.05em' }}>NOUVEAU</span>
              <h3 style={{ color: '#fff', fontSize: isMobile ? '2rem' : '2.6rem', fontWeight: 700, marginBottom: 6 }}>Vendez ou louez avec confiance</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.5rem' }}>Des milliers d'acheteurs vérifient Darni chaque jour</p>
            </div>
            <button onClick={() => navigate('/publish')}
              style={{ flexShrink: 0, background: '#fff', color: '#00513F', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', alignSelf: isMobile ? 'stretch' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              Commencer <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* 4. Banner agences */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4F82 100%)', padding: isMobile ? '24px 20px' : '28px 40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 20 : 24 }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, opacity: 0.08, pointerEvents: 'none' }}>
            <svg viewBox="0 0 300 120" style={{ height: '100%', width: '100%' }}>
              <path d="M0 60 Q75 0 150 60 Q225 120 300 60 L300 120 L0 120 Z" fill="white" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 14 : 24, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['#4A90D9', '#E8A87C', '#7BB8A0', '#D4789C'].map((color, i) => (
                <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', background: color, border: '3px solid rgba(255,255,255,0.9)', marginLeft: i === 0 ? 0 : -12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  {['👨‍💼', '👩‍💼', '👨‍💼', '👩‍💼'][i]}
                </div>
              ))}
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.6)', marginLeft: -12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>+48</div>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: isMobile ? '1.7rem' : '2rem', fontWeight: 700, marginBottom: 4 }}>Trouvez un agent de confiance</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem' }}>Des agents vérifiés, disponibles dans toute l'Algérie</p>
            </div>
          </div>
          <button onClick={() => navigate('/a-propos')}
            style={{ flexShrink: 0, background: '#fff', color: '#0F2D4A', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', alignSelf: isMobile ? 'stretch' : 'auto' }}>
            En savoir plus <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* 5. Parcourir par wilaya */}
        <section>
          <h2 style={{ fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 20 }}>
            Parcourir les biens en Algérie
          </h2>
          <div style={{ marginBottom: 28, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', minWidth: isMobile ? 'max-content' : 'auto', padding: isMobile ? '0 4px' : 0 }}>
              <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 6 }}>
                {WILAYAS_TABS.map(w => {
                  const active = activeWilaya === w;
                  return (
                    <button key={w} onClick={() => setActiveWilaya(w)}
                      style={{ padding: isMobile ? '8px 14px' : '8px 20px', borderRadius: 8, border: active ? '1.5px solid #1B4FD8' : '1.5px solid transparent', background: active ? '#EEF2FF' : 'transparent', color: active ? '#1B4FD8' : '#374151', fontSize: isMobile ? '1.3rem' : '1.4rem', fontWeight: active ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20 }}>
            {loading
              ? [...Array(4)].map((_, i) => <div key={i} style={{ height: isMobile ? 220 : 280, background: '#f3f4f6', borderRadius: 14 }} />)
              : filteredByWilaya.length > 0
                ? filteredByWilaya.map(listing => (
                    <div key={listing.id} onClick={() => navigate(`/listing/${listing.id}`)}
                      style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                      <div style={{ position: 'relative', height: isMobile ? 140 : 180 }}>
                        <img src={listing.image} alt={listing.commune ?? listing.wilaya}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'; }} />
                        <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'linear-gradient(135deg, #1B4FD8, #4F46E5)', color: '#fff', fontSize: '0.95rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5 }}>
                          {listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1)}
                        </span>
                      </div>
                      <div style={{ padding: isMobile ? '10px 12px' : '14px 16px' }}>
                        <p style={{ fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.commune ? `${listing.commune}, ` : ''}{listing.wilaya}
                        </p>
                        <div style={{ marginBottom: 10 }}>
                          <p style={{ fontSize: '1rem', color: '#9CA3AF', marginBottom: 2 }}>Prix</p>
                          <p style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: 800, color: '#1B4FD8' }}>
                            {smartPrice(listing.price)}
                          </p>
                        </div>
                        <button onClick={e => e.stopPropagation()}
                          style={{ width: '100%', background: '#F0FDF4', color: '#16A34A', border: '1px solid #86EFAC', borderRadius: 10, padding: '8px 0', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          💬 Contacter
                        </button>
                      </div>
                    </div>
                  ))
                : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '1.4rem' }}>
                    Aucun bien disponible à {activeWilaya} pour le moment.
                  </div>
                )
            }
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => navigate('/search')}
              style={{ background: 'none', border: '1.5px solid #1B4FD8', color: '#1B4FD8', borderRadius: 10, padding: '12px 32px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer' }}>
              Voir tous les biens à {activeWilaya} →
            </button>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#111827', color: '#fff', marginTop: 64, padding: '48px 0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: `0 ${px}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 32 : 40, marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 12 }}>Darni</p>
              <p style={{ fontSize: '1.3rem', color: '#9CA3AF', lineHeight: 1.6, marginBottom: 20, maxWidth: 280 }}>
                La plateforme immobilière algérienne qui met en relation propriétaires, agences et acheteurs.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <button key={i} style={{ width: 36, height: 36, background: '#1F2937', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 16, height: 16, color: '#9CA3AF' }} />
                  </button>
                ))}
              </div>
            </div>

            {isMobile ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {FOOTER_COLS.map(col => (
                  <div key={col.title}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>{col.title}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {col.links.map(link => (
                        <Link key={link.label} to={link.to} style={{ fontSize: '1.3rem', color: '#9CA3AF', textDecoration: 'none' }}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {FOOTER_COLS.map(col => (
                  <div key={col.title}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 16 }}>{col.title}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {col.links.map(link => (
                        <Link key={link.label} to={link.to}
                          style={{ fontSize: '1.3rem', color: '#9CA3AF', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9CA3AF'}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, paddingBottom: 32, borderBottom: '1px solid #1F2937', flexWrap: 'wrap' }}>
            {[{ Icon: Mail, text: 'contact@darni.app' }, { Icon: Phone, text: '+213 555 000 000' }, { Icon: MapPin, text: 'Alger, Algérie' }].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon style={{ width: 16, height: 16, color: '#1B4FD8', flexShrink: 0 }} />
                <span style={{ fontSize: '1.3rem', color: '#9CA3AF' }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', paddingTop: 24, gap: 12 }}>
            <p style={{ fontSize: '1.2rem', color: '#6B7280' }}>© 2026 Darni.app — Tous droits réservés</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Confidentialité', 'CGU', 'Cookies'].map(link => (
                <a key={link} href="#" style={{ fontSize: '1.2rem', color: '#6B7280', textDecoration: 'none' }}>{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}