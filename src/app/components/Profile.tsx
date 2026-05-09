import { ChevronRight, Star, MapPin, Settings, Heart, Bell, HelpCircle, LogOut, Crown, TrendingUp, Eye, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const USER_LISTINGS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', title: 'Appartement à Hydra', price: 15000000, type: 'Vente', views: 234, rating: 4.9 },
  { id: 2, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', title: 'Villa à Oran', price: 80000, type: 'Location', views: 156, rating: 4.7 },
];

const MENU_ITEMS = [
  { icon: Settings,   label: 'Paramètres',      danger: false },
  { icon: Heart,      label: 'Mes favoris',      danger: false },
  { icon: Bell,       label: 'Notifications',    danger: false },
  { icon: HelpCircle, label: 'Aide et support',  danger: false },
  { icon: LogOut,     label: 'Déconnexion',      danger: true  },
];

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

export function Profile() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingTop: 72, paddingBottom: 96 }}>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── PROFIL HEADER ── */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1B4FD8, #1640B0)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.8rem', fontWeight: 800 }}>
                A
              </div>
              <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#F5A623', borderRadius: '50%', padding: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                <Crown className="w-3 h-3" style={{ color: '#fff' }} />
              </div>
            </div>

            {/* Infos */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>Ahmed Benali</h2>
              <p style={{ fontSize: '1.3rem', color: '#6B7280', marginBottom: 4 }}>ahmed.benali@email.dz</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>Alger, Algérie</span>
              </div>
            </div>
          </div>

          {/* Badge Premium */}
          <div style={{ background: 'linear-gradient(135deg, #F5A623, #E09510)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown className="w-5 h-5" style={{ color: '#fff' }} />
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Agence Premium</p>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)' }}>Actif jusqu'au 21/12/2026</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: TrendingUp, value: USER_LISTINGS.length, label: 'Annonces', color: '#1B4FD8', bg: '#EEF2FF' },
            { icon: Eye,        value: 390,                  label: 'Vues',      color: '#F5A623', bg: '#FFF8EC' },
            { icon: Phone,      value: 12,                   label: 'Contacts',  color: '#1B4FD8', bg: '#EEF2FF' },
          ].map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} style={{ ...cardStyle, padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: '1.1rem', color: '#9CA3AF', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── MES ANNONCES ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827' }}>Mes annonces</h3>
            <button style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1B4FD8', background: 'none', border: 'none', cursor: 'pointer' }}>
              Voir tout
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {USER_LISTINGS.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/listing/${listing.id}`)}
                style={{ ...cardStyle, padding: 14, display: 'flex', gap: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
              >
                <img src={listing.image} alt={listing.title} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {listing.title}
                  </h4>
                  <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B4FD8', marginBottom: 8 }}>
                    {listing.price.toLocaleString('fr-DZ')} DA
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '1.1rem', color: '#16A34A', fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, background: '#16A34A', borderRadius: '50%', display: 'inline-block' }} />
                      Active
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '1.1rem', color: '#6B7280' }}>
                      <Eye className="w-3 h-3" /> {listing.views}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '1.1rem', color: '#6B7280' }}>
                      <Star className="w-3 h-3" style={{ fill: '#F5A623', color: '#F5A623' }} /> {listing.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MENU OPTIONS ── */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {MENU_ITEMS.map(({ icon: Icon, label, danger }, i) => (
            <button
              key={label}
              style={{
                width: '100%',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 'none',
                borderTop: i > 0 ? '1px solid #F3F4F6' : 'none',
                background: '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? '#FEF2F2' : '#F9FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: danger ? '#FEF2F2' : '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon className="w-5 h-5" style={{ color: danger ? '#EF4444' : '#374151' }} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 500, color: danger ? '#EF4444' : '#111827' }}>{label}</span>
              </div>
              {!danger && <ChevronRight className="w-5 h-5" style={{ color: '#D1D5DB' }} />}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#D1D5DB' }}>Darni v1.0 · Immobilier DZ</p>
      </div>
    </div>
  );
}