import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, MessageCircle, ChevronDown, Shield, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO'
import { supabase } from '../../lib/supabase';
import { useIsMobile } from '../../hooks/useIsMobile';

const WILAYAS = ['Toutes', 'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Tlemcen', 'Batna'];
const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartements', villa: 'Villas', bureau: 'Bureaux',
  local: 'Locaux commerciaux', terrain: 'Terrains', autre: 'Autres',
};
const SORTS = ['Plus actifs', 'Alphabétique'];

const AVATAR_COLORS = ['#1B4FD8', '#7C3AED', '#00705A', '#EA580C', '#0891B2', '#BE185D'];
const colorFor = (id: string) => {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

interface Agent {
  id: string;
  nom: string;
  wilaya: string;
  type: string;
  annonces: number;
  verified: boolean;
  phone: string;
  color: string;
}

export function SamsaraPage() {
  useSEO({
    title: 'Trouvez un agent immobilier en Algérie — Samsara',
    description: "Des agents immobiliers actifs sur Darni, dans toutes les wilayas d'Algérie. Contactez votre Samsar directement.",
    url: 'https://darni.app/samsara',
  })

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [agents,  setAgents]  = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [search, setSearch]           = useState('');
  const [wilaya, setWilaya]           = useState('Toutes');
  const [type, setType]               = useState('Toutes');
  const [sortBy, setSortBy]           = useState('Plus actifs');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, badge_level, listings:listings(wilaya, type)')
        .not('listings', 'is', null);

      if (cancelled) return;
      if (fetchError) {
        setError("Impossible de charger les agents. Vérifiez votre connexion et réessayez.");
        setAgents([]);
        setLoading(false);
        return;
      }

      const rows: Agent[] = (data ?? [])
        .filter((p: any) => p.listings && p.listings.length > 0)
        .map((p: any) => {
          const wilayaCounts: Record<string, number> = {};
          const typeCounts: Record<string, number> = {};
          for (const l of p.listings) {
            if (l.wilaya) wilayaCounts[l.wilaya] = (wilayaCounts[l.wilaya] ?? 0) + 1;
            if (l.type)   typeCounts[l.type]     = (typeCounts[l.type] ?? 0) + 1;
          }
          const topWilaya = Object.entries(wilayaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
          const topType   = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'autre';
          return {
            id: p.id,
            nom: p.full_name ?? 'Agent Darni',
            wilaya: topWilaya,
            type: topType,
            annonces: p.listings.length,
            verified: p.badge_level === 'verified' || p.badge_level === 'pro',
            phone: p.phone ?? '',
            color: colorFor(p.id),
          };
        });

      setAgents(rows);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  let filtered = agents;
  if (wilaya !== 'Toutes') filtered = filtered.filter(a => a.wilaya === wilaya);
  if (type !== 'Toutes')   filtered = filtered.filter(a => TYPE_LABELS[a.type] === type);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.nom.toLowerCase().includes(q) ||
      a.wilaya.toLowerCase().includes(q)
    );
  }
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'Plus actifs') return b.annonces - a.annonces;
    return a.nom.localeCompare(b.nom);
  });

  const totalListings   = agents.reduce((sum, a) => sum + a.annonces, 0);
  const distinctWilayas = new Set(agents.map(a => a.wilaya)).size;

  const px = isMobile ? '16px' : '24px';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 40, paddingTop: 64 }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', padding: isMobile ? '40px 20px 50px' : '60px 40px 70px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <Shield style={{ width: 14, height: 14, color: '#93C5FD' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Agents actifs sur Darni</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? '2.8rem' : '4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 14, letterSpacing: '-0.02em' }}>
            Trouvez votre Samsar<br />
            <span style={{ color: '#93C5FD' }}>de confiance</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '1.4rem' : '1.6rem', lineHeight: 1.6, marginBottom: 32 }}>
            Des agents qui publient activement sur Darni, dans toutes les wilayas d'Algérie.
          </p>

          <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '12px' : '10px', display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} />
              <input placeholder="Nom d'agent, wilaya..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.4rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides — dérivées des vraies annonces, pas de chiffres inventés */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', gap: isMobile ? 20 : 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: <Award style={{ width: 16, height: 16, color: '#1B4FD8' }} />, label: `${agents.length} agent${agents.length > 1 ? 's' : ''} actif${agents.length > 1 ? 's' : ''}` },
            { icon: <TrendingUp style={{ width: 16, height: 16, color: '#00705A' }} />, label: `${totalListings} annonce${totalListings > 1 ? 's' : ''} publiée${totalListings > 1 ? 's' : ''}` },
            { icon: <MapPin style={{ width: 16, height: 16, color: '#EA580C' }} />, label: `${distinctWilayas} wilaya${distinctWilayas > 1 ? 's' : ''} couverte${distinctWilayas > 1 ? 's' : ''}` },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {s.icon}
              <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#374151' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: `24px ${px}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: 24, alignItems: 'start' }}>

          {!isMobile && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '20px', position: 'sticky', top: 88 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 20 }}>Filtres</h3>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Wilaya</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {WILAYAS.map(w => (
                    <button key={w} onClick={() => setWilaya(w)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: wilaya === w ? '#EEF2FF' : 'transparent', color: wilaya === w ? '#1B4FD8' : '#374151', fontWeight: wilaya === w ? 700 : 500, fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20, marginBottom: 20 }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Spécialité</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['Toutes', ...Object.values(TYPE_LABELS)].map(s => (
                    <button key={s} onClick={() => setType(s)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: type === s ? '#EEF2FF' : 'transparent', color: type === s ? '#1B4FD8' : '#374151', fontWeight: type === s ? 700 : 500, fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20 }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Trier par</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {SORTS.map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: sortBy === s ? '#EEF2FF' : 'transparent', color: sortBy === s ? '#1B4FD8' : '#374151', fontWeight: sortBy === s ? 700 : 500, fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            {isMobile && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                    style={{ width: '100%', padding: '10px 28px 10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none' }}>
                    {WILAYAS.map(w => <option key={w}>{w}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ width: '100%', padding: '10px 28px 10px 12px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.3rem', color: '#374151', appearance: 'none', outline: 'none' }}>
                    {SORTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9CA3AF', pointerEvents: 'none' }} />
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
                <p style={{ fontSize: '1.4rem' }}>Chargement des agents…</p>
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16 }}>
                <p style={{ fontSize: '1.3rem', color: '#991B1B', marginBottom: 16 }}>{error}</p>
                <button onClick={() => window.location.reload()}
                  style={{ padding: '10px 20px', background: '#fff', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', fontWeight: 700, cursor: 'pointer' }}>
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: '1.4rem', color: '#6B7280' }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{filtered.length} agent{filtered.length > 1 ? 's' : ''}</span> trouvé{filtered.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filtered.map(agent => (
                    <div key={agent.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: isMobile ? '16px' : '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>

                      <div style={{ display: 'flex', gap: isMobile ? 14 : 20, alignItems: 'flex-start' }}>
                        <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: '50%', background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: isMobile ? '2rem' : '2.4rem', flexShrink: 0, boxShadow: `0 4px 12px ${agent.color}44` }}>
                          {agent.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                            <div>
                              <h3 style={{ fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 2 }}>{agent.nom}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin style={{ width: 13, height: 13, color: '#9CA3AF', flexShrink: 0 }} />
                                <span style={{ fontSize: '1.2rem', color: '#6B7280' }}>{agent.wilaya}</span>
                                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB' }} />
                                <span style={{ fontSize: '1.2rem', color: '#1B4FD8', fontWeight: 600 }}>{TYPE_LABELS[agent.type] ?? agent.type}</span>
                              </div>
                            </div>
                          </div>

                          {agent.verified && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#00705A', color: '#fff' }}>
                                ✓ Vérifié Darni
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: isMobile ? 16 : 28, marginBottom: 16, flexWrap: 'wrap' }}>
                            <div>
                              <p style={{ fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 2 }}>Annonces actives</p>
                              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>{agent.annonces}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {agent.phone && (
                              <a href={`tel:${agent.phone}`}
                                style={{ flex: isMobile ? 1 : 'none', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                                <Phone style={{ width: 14, height: 14 }} /> Appeler
                              </a>
                            )}
                            {agent.phone && (
                              <a href={`https://wa.me/${agent.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                style={{ flex: isMobile ? 1 : 'none', background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '10px 20px', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                                <MessageCircle style={{ width: 14, height: 14 }} /> WhatsApp
                              </a>
                            )}
                            <button onClick={() => navigate(`/search?wilaya=${encodeURIComponent(agent.wilaya)}`)}
                              style={{ background: '#F9FAFB', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 20px', fontSize: '1.3rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                              Voir ses annonces ({agent.annonces})
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
                      <Search style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
                      <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>Aucun agent trouvé</p>
                      <p style={{ fontSize: '1.3rem', marginTop: 8 }}>Modifiez vos filtres</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', borderRadius: 20, padding: isMobile ? '28px 20px' : '36px 40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <p style={{ color: '#93C5FD', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vous êtes agent immobilier ?</p>
                <h3 style={{ color: '#fff', fontSize: isMobile ? '2rem' : '2.4rem', fontWeight: 800, marginBottom: 6 }}>Rejoignez la communauté Samsara</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem' }}>Publiez vos annonces sur Darni et trouvez vos prochains clients.</p>
              </div>
              <button onClick={() => navigate('/publish')}
                style={{ flexShrink: 0, background: '#fff', color: '#0F2D4A', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', alignSelf: isMobile ? 'stretch' : 'auto', textAlign: 'center' }}>
                Publier une annonce →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
