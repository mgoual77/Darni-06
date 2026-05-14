import { Home, Search, PlusCircle, User, Bell, LayoutList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Acheter',     to: '/search', badge: null   },
  { label: 'Louer',       to: '/search', badge: null   },
  { label: 'Agences',     to: '/search', badge: 'NEW'  },
  { label: 'Estimation',  to: '/search', badge: 'BETA' },
];

export function Navbar() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

          {/* Logo */}
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

            {/* Cloche */}
            <button
              style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            >
              <Bell className="w-5 h-5" style={{ color: '#374151' }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} />
            </button>

            {!loading && user ? (
              /* ── Utilisateur connecté ── */
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1B4FD8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'}
                >
                  {/* Avatar */}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4FD8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span style={{ fontSize: '1.3rem', color: '#374151', fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </span>
                  <svg width={14} height={14} fill="none" stroke="#9CA3AF" viewBox="0 0 24 24" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    {/* Overlay pour fermer en cliquant dehors */}
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 200, zIndex: 50, overflow: 'hidden' }}>

                      {/* Mes annonces */}
                      <Link
                        to="/mes-annonces"
                        onClick={() => setShowUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#374151', fontSize: '1.3rem', fontWeight: 600, transition: 'background 0.15s', borderBottom: '1px solid #F3F4F6' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <LayoutList className="w-4 h-4" style={{ color: '#1B4FD8' }} />
                        Mes annonces
                      </Link>

                      {/* Profil */}
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#374151', fontSize: '1.3rem', fontWeight: 600, transition: 'background 0.15s', borderBottom: '1px solid #F3F4F6' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <User className="w-4 h-4" style={{ color: '#6B7280' }} />
                        Mon profil
                      </Link>

                      {/* Déconnexion */}
                      <button
                        onClick={() => { signOut(); setShowUserMenu(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1.3rem', fontWeight: 600, textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ── Non connecté ── */
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

            {/* Bouton Publier */}
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
            { to: '/',             icon: Home,       label: 'Accueil'   },
            { to: '/search',       icon: Search,     label: 'Recherche' },
            { to: '/poster',       icon: PlusCircle, label: 'Publier'   },
            { to: '/mes-annonces', icon: LayoutList, label: 'Annonces'  },
            { to: '/profile',      icon: User,       label: 'Profil'    },
          ].map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px', color: active ? '#1B4FD8' : '#9CA3AF', transition: 'color 0.15s' }}
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