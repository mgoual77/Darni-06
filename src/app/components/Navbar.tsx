import { Home, Search, PlusCircle, User, Bell, LayoutList, Menu, X, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Acheter',    to: '/search',   badge: null   },
  { label: 'Louer',      to: '/search',   badge: null   },
  { label: 'Samsara',    to: '/samsara',  badge: 'NEW'  },
  { label: 'Estimation', to: '/a-propos', badge: 'BETA' },
];

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

export function Navbar() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => { setShowMobileMenu(false); }, [location.pathname]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#1B4FD8', letterSpacing: '-0.04em', fontFamily: 'Lato, sans-serif', lineHeight: 1 }}>
              Darni
            </span>
          </Link>

          {/* Liens desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {NAV_LINKS.map(({ label, to, badge }) => {
                const active = isActive(to);
                return (
                  <Link key={label} to={to}
                    style={{ textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontSize: '1.4rem', fontWeight: active ? 700 : 600, color: active ? '#1B4FD8' : '#374151', background: active ? '#EEF2FF' : 'transparent', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1B4FD8'; (e.currentTarget as HTMLElement).style.background = '#EEF2FF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? '#1B4FD8' : '#374151'; (e.currentTarget as HTMLElement).style.background = active ? '#EEF2FF' : 'transparent'; }}>
                    {label}
                    {badge && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', background: badge === 'NEW' ? '#EF4444' : '#eec64f', padding: '1px 4px', borderRadius: 3 }}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Actions droite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, flexShrink: 0 }}>

            {!isMobile && (
              <button style={{ position: 'relative', padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F4F6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                <Bell className="w-5 h-5" style={{ color: '#374151' }} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} />
              </button>
            )}

            {!isMobile && (
              !loading && user ? (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowUserMenu(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4FD8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span style={{ fontSize: '1.3rem', color: '#374151', fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowUserMenu(false)} />
                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 200, zIndex: 50, overflow: 'hidden' }}>
                        <Link to="/mes-annonces" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#374151', fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
                          <LayoutList className="w-4 h-4" style={{ color: '#1B4FD8' }} /> Mes annonces
                        </Link>
                        <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none', color: '#374151', fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid #F3F4F6' }}>
                          <User className="w-4 h-4" style={{ color: '#6B7280' }} /> Mon profil
                        </Link>
                        <button onClick={() => { signOut(); setShowUserMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1.3rem', fontWeight: 600, textAlign: 'left' }}>
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
                <button onClick={() => setIsAuthModalOpen(true)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: '1.3rem', fontWeight: 700, color: '#374151', background: '#fff', cursor: 'pointer' }}>
                  Connexion
                </button>
              )
            )}

            <Link to="/poster"
              style={{ textDecoration: 'none', padding: isMobile ? '8px 14px' : '8px 18px', borderRadius: 8, background: '#1B4FD8', fontSize: '1.3rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(27,79,216,0.25)' }}>
              <PlusCircle className="w-4 h-4" />
              {isMobile ? '' : 'Publier'}
            </Link>

            {isMobile && (
              <button onClick={() => setShowMobileMenu(v => !v)}
                style={{ padding: 8, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showMobileMenu ? <X className="w-6 h-6" style={{ color: '#374151' }} /> : <Menu className="w-6 h-6" style={{ color: '#374151' }} />}
              </button>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobile && showMobileMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowMobileMenu(false)} />
            <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: '#fff', borderBottom: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, padding: '8px 0 16px' }}>
              {NAV_LINKS.map(({ label, to, badge }) => (
                <Link key={label} to={to} onClick={() => setShowMobileMenu(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', textDecoration: 'none', color: isActive(to) ? '#1B4FD8' : '#374151', fontSize: '1.5rem', fontWeight: isActive(to) ? 700 : 600, borderBottom: '1px solid #F9FAFB', background: isActive(to) ? '#EEF2FF' : 'transparent' }}>
                  {label}
                  {badge && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', background: badge === 'NEW' ? '#EF4444' : '#eec64f', padding: '1px 6px', borderRadius: 3 }}>
                      {badge}
                    </span>
                  )}
                </Link>
              ))}

              <div style={{ height: 1, background: '#E5E7EB', margin: '8px 0' }} />

              {!loading && user ? (
                <>
                  <Link to="/mes-annonces" onClick={() => setShowMobileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', textDecoration: 'none', color: '#374151', fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid #F9FAFB' }}>
                    <LayoutList className="w-5 h-5" style={{ color: '#1B4FD8' }} /> Mes annonces
                  </Link>
                  <Link to="/profile" onClick={() => setShowMobileMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', textDecoration: 'none', color: '#374151', fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid #F9FAFB' }}>
                    <User className="w-5 h-5" style={{ color: '#6B7280' }} /> Mon profil
                  </Link>
                  <button onClick={() => { signOut(); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1.5rem', fontWeight: 600, textAlign: 'left' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <div style={{ padding: '12px 20px' }}>
                  <button onClick={() => { setIsAuthModalOpen(true); setShowMobileMenu(false); }}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #1B4FD8', fontSize: '1.4rem', fontWeight: 700, color: '#1B4FD8', background: '#fff', cursor: 'pointer' }}>
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Bottom nav mobile */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderTop: '1px solid #F3F4F6', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
            {[
              { to: '/',             icon: Home,        label: 'Accueil'   },
              { to: '/search',       icon: Search,      label: 'Recherche' },
              { to: '/poster',       icon: PlusCircle,  label: 'Publier'   },
              { to: '/samsara',      icon: TrendingUp,  label: 'Samsara'   },
              { to: '/mes-annonces', icon: LayoutList,  label: 'Annonces'  },
            ].map(({ to, icon: Icon, label }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to}
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px', color: active ? '#1B4FD8' : '#9CA3AF', flex: 1 }}>
                  <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: active ? '#EEF2FF' : 'transparent' }}>
                    <Icon className="w-5 h-5" style={{ strokeWidth: active ? 2.5 : 1.8 }} />
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: active ? 700 : 500, marginTop: 2 }}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}