import { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Settings, Heart, Bell, HelpCircle, LogOut, Crown, TrendingUp, Eye, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/formatPrice';

interface OwnListing {
  id: string;
  title: string | null;
  price: number;
  transaction: string;
  status: 'active' | 'inactive';
  photos: any[];
  views_count: number | null;
}

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

interface Subscription {
  plan: string;
  expires_at: string | null;
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

function firstPhoto(photos: any[]): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0)
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700';
  const p = photos[0];
  if (typeof p === 'string') return p;
  if (p?.url) return p.url;
  return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700';
}

export function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [profile,      setProfile]      = useState<ProfileData | null>(null);
  const [listings,     setListings]     = useState<OwnListing[]>([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!user && !authLoading) { navigate('/'); return; }
    if (!user) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');

      const [profileRes, listingsRes, countRes, contactsRes, subRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
        supabase.from('listings')
          .select('id, title, price, transaction, status, photos, views_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('agent_id', user.id),
        supabase.from('subscriptions').select('plan, expires_at')
          .eq('user_id', user.id).eq('status', 'active')
          .order('expires_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (cancelled) return;

      if (listingsRes.error || countRes.error) {
        setError("Impossible de charger votre profil. Vérifiez votre connexion et réessayez.");
        setLoading(false);
        return;
      }

      setProfile(profileRes.data ?? null);
      setListings((listingsRes.data as OwnListing[]) ?? []);
      setTotalCount(countRes.count ?? 0);
      setContactCount(contactsRes.count ?? 0);
      setSubscription(subRes.data ?? null);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const totalViews = listings.reduce((sum, l) => sum + (l.views_count ?? 0), 0);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const MENU_ITEMS = [
    { icon: Settings,   label: 'Paramètres',      danger: false, onClick: () => {} },
    { icon: Heart,      label: 'Mes favoris',      danger: false, onClick: () => {} },
    { icon: Bell,       label: 'Notifications',    danger: false, onClick: () => {} },
    { icon: HelpCircle, label: 'Aide et support',  danger: false, onClick: () => {} },
    { icon: LogOut,     label: 'Déconnexion',      danger: true,  onClick: handleSignOut },
  ];

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingTop: 72, display: 'flex', justifyContent: 'center', paddingBottom: 40 }}>
        <p style={{ color: '#9CA3AF', fontSize: '1.3rem', marginTop: 40 }}>Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingTop: 72, padding: '72px 20px 40px', textAlign: 'center' }}>
        <p style={{ color: '#991B1B', fontSize: '1.3rem', marginBottom: 16 }}>{error}</p>
        <button onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', background: '#fff', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', fontWeight: 700, cursor: 'pointer' }}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingTop: 72, paddingBottom: 96 }}>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── PROFIL HEADER ── */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: subscription ? 16 : 0 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1B4FD8, #1640B0)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.8rem', fontWeight: 800 }}>
                {initial}
              </div>
              {subscription && (
                <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#F5A623', borderRadius: '50%', padding: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                  <Crown className="w-3 h-3" style={{ color: '#fff' }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>{displayName}</h2>
              <p style={{ fontSize: '1.3rem', color: '#6B7280', marginBottom: 4 }}>{user?.email}</p>
              {user?.user_metadata?.wilaya && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>{user.user_metadata.wilaya}</span>
                </div>
              )}
            </div>
          </div>

          {subscription && (
            <div style={{ background: 'linear-gradient(135deg, #F5A623, #E09510)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Crown className="w-5 h-5" style={{ color: '#fff' }} />
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                    {subscription.plan === 'pro' ? 'Darni Pro' : subscription.plan}
                  </p>
                  {subscription.expires_at && (
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)' }}>
                      Actif jusqu'au {new Date(subscription.expires_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.8)' }} />
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: TrendingUp, value: totalCount,   label: 'Annonces', color: '#1B4FD8', bg: '#EEF2FF' },
            { icon: Eye,        value: totalViews,    label: 'Vues',     color: '#F5A623', bg: '#FFF8EC' },
            { icon: Phone,      value: contactCount,  label: 'Contacts', color: '#1B4FD8', bg: '#EEF2FF' },
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
            <button onClick={() => navigate('/mes-annonces')}
              style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1B4FD8', background: 'none', border: 'none', cursor: 'pointer' }}>
              Voir tout
            </button>
          </div>

          {listings.length === 0 ? (
            <div style={{ ...cardStyle, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: '1.3rem', color: '#6B7280' }}>Aucune annonce publiée pour l'instant.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  style={{ ...cardStyle, padding: 14, display: 'flex', gap: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                >
                  <img src={firstPhoto(listing.photos)} alt={listing.title ?? ''} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {listing.title}
                    </h4>
                    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1B4FD8', marginBottom: 8 }}>
                      {formatPrice(listing.price, listing.transaction)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '1.1rem', color: listing.status === 'active' ? '#16A34A' : '#9CA3AF', fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, background: listing.status === 'active' ? '#16A34A' : '#9CA3AF', borderRadius: '50%', display: 'inline-block' }} />
                        {listing.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '1.1rem', color: '#6B7280' }}>
                        <Eye className="w-3 h-3" /> {listing.views_count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MENU OPTIONS ── */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {MENU_ITEMS.map(({ icon: Icon, label, danger, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
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

        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#D1D5DB' }}>Darni v1.0 · Immobilier DZ</p>
      </div>
    </div>
  );
}
