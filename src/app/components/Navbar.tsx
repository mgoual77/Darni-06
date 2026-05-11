import { Home, Search, PlusCircle, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Acheter',     to: '/search', badge: null   },
  { label: 'Louer',      to: '/search', badge: null   },
  { label: 'Agences',    to: '/search', badge: 'NEW'  },
  { label: 'Estimation', to: '/search', badge: 'BETA' },
];

export function Navbar() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ── TOP NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ✅ Logo avec ombre pour la profondeur */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#1B4FD8',
              letterSpacing: '-0.04em',
              fontFamily: 'Lato, sans-serif',
              lineHeight: 1,
            }}>
              Darni
            </span>
          </Link>

          {/* Liens navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(({ label, to, badge }) => (
              <Link
                key={label}
                to={to}
                style={{ textDecoration: 'none', position: 'relative', padding: '8px 14px', borderRadius: 8, fontSize: '1.4rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#1B4FD8';
                  (e.currentTarget as HTMLElement).style.background = '#EEF2FF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#374151';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {label}
                {/* ✅ Badge gold #eec64f pour BETA, rouge pour NEW */}
                {badge && (
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#fff',
                    background: badge === 'NEW' ? '#EF4444' : '#eec64f',
                    padding: '1px 5px',
                    borderRadius: 4,
                    letterSpacing: '0.03em',
                    lineHeight: 1.4,
                  }}>
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Actions droite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button
              style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            >
              <Bell className="w-5 h-5" style={{ color: '#374151' }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} />
            </button>

            {!loading && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem', color: '#374151', fontWeight: 500 }}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: '1.3rem', fontWeight: 700, color: '#374151', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#EF4444';
                    (e.currentTarget as HTMLElement).style.color = '#EF4444';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                    (e.currentTarget as HTMLElement).style.color = '#374151';
                  }}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: '1.3rem', fontWeight: 700, color: '#374151', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1B4FD8';
                  (e.currentTarget as HTMLElement).style.color = '#1B4FD8';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                  (e.currentTarget as HTMLElement).style.color = '#374151';
                }}
              >
                Connexion
              </button>
            )}

            <Link
              to="/poster"
              style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: 8, background: '#1B4FD8', fontSize: '1.3rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(27,79,216,0.25)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#1640B0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1B4FD8'}
            >
              <PlusCircle className="w-4 h-4" />
              Publier
            </Link>

                      </div>
        </div>
      </nav>

      {/* ── BOTTOM NAV mobile ── */}
      <div className="hidden md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderTop: '1px solid #F3F4F6', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
          {[
            { to: '/',        icon: Home,       label: 'Accueil'   },
            { to: '/search',  icon: Search,     label: 'Recherche' },
            { to: '/poster', icon: PlusCircle, label: 'Publier'   },
            { to: '/profile', icon: User,       label: 'Profil'    },
          ].map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 20px', color: active ? '#1B4FD8' : '#9CA3AF', transition: 'color 0.15s' }}
              >
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: active ? '#EEF2FF' : 'transparent', transition: 'background 0.15s' }}>
                  <Icon className="w-5 h-5" style={{ strokeWidth: active ? 2.5 : 1.8 }} />
                </div>
                <span style={{ fontSize: '1rem', fontWeight: active ? 700 : 500, marginTop: 2 }}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}