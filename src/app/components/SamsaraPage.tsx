import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, MessageCircle, Filter, ChevronDown, Shield, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO'

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

const WILAYAS = ['Toutes', 'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Tlemcen', 'Batna'];
const SPECIALITES = ['Toutes', 'Appartements', 'Villas', 'Terrains', 'Bureaux', 'Locaux commerciaux'];
const SORTS = ['Mieux notés', 'Plus actifs', 'Plus récents'];

// Agents fictifs réalistes
const AGENTS = [
  {
    id: 1, nom: 'Karim Bensalem', wilaya: 'Alger', commune: 'Hydra',
    specialite: 'Appartements', note: 4.9, avis: 47, transactions: 124,
    annonces: 18, phone: '0550123456', whatsapp: '0550123456',
    bio: 'Agent spécialisé dans l\'immobilier haut de gamme à Alger Ouest. 12 ans d\'expérience dans les quartiers Hydra, Ben Aknoun et Dély Ibrahim.',
    badges: ['Top Agent', 'Vérifié Darni', 'Réponse rapide'],
    avatar: 'K', color: '#1B4FD8', langues: ['Arabe', 'Français'],
  },
  {
    id: 2, nom: 'Samira Ouali', wilaya: 'Alger', commune: 'Kouba',
    specialite: 'Appartements', note: 4.8, avis: 32, transactions: 89,
    annonces: 14, phone: '0661234567', whatsapp: '0661234567',
    bio: 'Agente indépendante depuis 8 ans, spécialisée dans les quartiers est d\'Alger. Accompagnement personnalisé de A à Z.',
    badges: ['Vérifié Darni', 'Réponse rapide'],
    avatar: 'S', color: '#7C3AED', langues: ['Arabe', 'Français', 'Anglais'],
  },
  {
    id: 3, nom: 'Mohamed Larbi', wilaya: 'Oran', commune: 'Bir El Djir',
    specialite: 'Villas', note: 4.7, avis: 28, transactions: 67,
    annonces: 11, phone: '0550789456', whatsapp: '0550789456',
    bio: 'Expert immobilier à Oran depuis 2015. Spécialiste des villas et maisons individuelles dans la région oranaise.',
    badges: ['Top Agent', 'Vérifié Darni'],
    avatar: 'M', color: '#00705A', langues: ['Arabe', 'Français'],
  },
  {
    id: 4, nom: 'Yasmine Kaci', wilaya: 'Alger', commune: 'Bab Ezzouar',
    specialite: 'Bureaux', note: 4.8, avis: 19, transactions: 45,
    annonces: 9, phone: '0770456789', whatsapp: '0770456789',
    bio: 'Spécialiste de l\'immobilier professionnel et commercial à Alger Est. Expert en bureaux, locaux et zones d\'activité.',
    badges: ['Vérifié Darni'],
    avatar: 'Y', color: '#EA580C', langues: ['Arabe', 'Français', 'Anglais'],
  },
  {
    id: 5, nom: 'Rachid Hamidouche', wilaya: 'Constantine', commune: 'Ali Mendjeli',
    specialite: 'Appartements', note: 4.6, avis: 41, transactions: 98,
    annonces: 16, phone: '0661789012', whatsapp: '0661789012',
    bio: 'Agent immobilier à Constantine depuis 10 ans. Connaissance approfondie des nouvelles cités et de la ville nouvelle Ali Mendjeli.',
    badges: ['Top Agent', 'Vérifié Darni'],
    avatar: 'R', color: '#1B4FD8', langues: ['Arabe', 'Français'],
  },
  {
    id: 6, nom: 'Nadia Boukhelifa', wilaya: 'Oran', commune: 'Es Sénia',
    specialite: 'Terrains', note: 4.5, avis: 15, transactions: 38,
    annonces: 7, phone: '0550345678', whatsapp: '0550345678',
    bio: 'Experte en terrains constructibles et agricoles dans la région oranaise. Maîtrise des procédures de mutation et de titre foncier.',
    badges: ['Vérifié Darni'],
    avatar: 'N', color: '#7C3AED', langues: ['Arabe', 'Français'],
  },
  {
    id: 7, nom: 'Tarek Meziani', wilaya: 'Annaba', commune: 'Annaba',
    specialite: 'Appartements', note: 4.7, avis: 23, transactions: 54,
    annonces: 12, phone: '0661012345', whatsapp: '0661012345',
    bio: 'Agent polyvalent à Annaba. Spécialisé dans la vente et la location d\'appartements dans toute la wilaya d\'Annaba.',
    badges: ['Vérifié Darni', 'Réponse rapide'],
    avatar: 'T', color: '#00705A', langues: ['Arabe', 'Français'],
  },
  {
    id: 8, nom: 'Amira Sellami', wilaya: 'Blida', commune: 'Blida',
    specialite: 'Villas', note: 4.9, avis: 12, transactions: 29,
    annonces: 6, phone: '0770654321', whatsapp: '0770654321',
    bio: 'Jeune agente dynamique à Blida, spécialisée dans les villas et maisons familiales de la Mitidja. Disponible 7j/7.',
    badges: ['Vérifié Darni', 'Réponse rapide'],
    avatar: 'A', color: '#EA580C', langues: ['Arabe', 'Français', 'Kabyle'],
  },
];

export function SamsaraPage() {
  useSEO({
    title: 'Trouvez un agent immobilier en Algérie — Samsara',
    description: "Des agents immobiliers vérifiés et notés dans toutes les wilayas d'Algérie. Contactez votre Samsar de confiance directement.",
    url: 'https://darni.app/samsara',
  })

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [search, setSearch]           = useState('');
  const [wilaya, setWilaya]           = useState('Toutes');
  const [specialite, setSpecialite]   = useState('Toutes');
  const [sortBy, setSortBy]           = useState('Mieux notés');
  const [showFilters, setShowFilters] = useState(false);

  let filtered = AGENTS;
  if (wilaya !== 'Toutes') filtered = filtered.filter(a => a.wilaya === wilaya);
  if (specialite !== 'Toutes') filtered = filtered.filter(a => a.specialite === specialite);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.nom.toLowerCase().includes(q) ||
      a.wilaya.toLowerCase().includes(q) ||
      a.commune.toLowerCase().includes(q) ||
      a.specialite.toLowerCase().includes(q)
    );
  }
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'Mieux notés')  return b.note - a.note;
    if (sortBy === 'Plus actifs')  return b.transactions - a.transactions;
    return b.id - a.id;
  });

  const px = isMobile ? '16px' : '24px';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', paddingBottom: isMobile ? 80 : 40, paddingTop: 64 }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', padding: isMobile ? '40px 20px 50px' : '60px 40px 70px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <Shield style={{ width: 14, height: 14, color: '#93C5FD' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Agents certifiés Darni</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? '2.8rem' : '4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 14, letterSpacing: '-0.02em' }}>
            Trouvez votre Samsar<br />
            <span style={{ color: '#93C5FD' }}>de confiance</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '1.4rem' : '1.6rem', lineHeight: 1.6, marginBottom: 32 }}>
            Des agents immobiliers vérifiés, notés par leurs clients, disponibles dans toutes les wilayas d'Algérie.
          </p>

          {/* Barre de recherche */}
          <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '12px' : '10px', display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9CA3AF' }} />
              <input placeholder="Nom d'agent, wilaya, spécialité..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: '1.4rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = '#1B4FD8'}
                onBlur={e => (e.target as HTMLElement).style.borderColor = '#E5E7EB'} />
            </div>
            <button onClick={() => {}}
              style={{ background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', gap: isMobile ? 20 : 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: <Award style={{ width: 16, height: 16, color: '#1B4FD8' }} />, label: `${AGENTS.length} agents certifiés` },
            { icon: <Star style={{ width: 16, height: 16, color: '#F5A623', fill: '#F5A623' }} />, label: 'Note moyenne 4.7/5' },
            { icon: <TrendingUp style={{ width: 16, height: 16, color: '#00705A' }} />, label: '500+ transactions/mois' },
            { icon: <MapPin style={{ width: 16, height: 16, color: '#EA580C' }} />, label: '10 wilayas couvertes' },
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

          {/* ── SIDEBAR FILTRES (desktop) ── */}
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
                  {SPECIALITES.map(s => (
                    <button key={s} onClick={() => setSpecialite(s)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: specialite === s ? '#EEF2FF' : 'transparent', color: specialite === s ? '#1B4FD8' : '#374151', fontWeight: specialite === s ? 700 : 500, fontSize: '1.3rem', cursor: 'pointer', textAlign: 'left' }}>
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

          {/* ── LISTE AGENTS ── */}
          <div>
            {/* Filtres mobile */}
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

            {/* Résultats */}
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
                    {/* Avatar */}
                    <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: '50%', background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: isMobile ? '2rem' : '2.4rem', flexShrink: 0, boxShadow: `0 4px 12px ${agent.color}44` }}>
                      {agent.avatar}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <div>
                          <h3 style={{ fontSize: isMobile ? '1.6rem' : '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 2 }}>{agent.nom}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin style={{ width: 13, height: 13, color: '#9CA3AF', flexShrink: 0 }} />
                            <span style={{ fontSize: '1.2rem', color: '#6B7280' }}>{agent.commune}, {agent.wilaya}</span>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB' }} />
                            <span style={{ fontSize: '1.2rem', color: '#1B4FD8', fontWeight: 600 }}>{agent.specialite}</span>
                          </div>
                        </div>

                        {/* Note */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10, padding: '6px 12px', flexShrink: 0 }}>
                          <Star style={{ width: 14, height: 14, fill: '#F5A623', color: '#F5A623' }} />
                          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400E' }}>{agent.note}</span>
                          <span style={{ fontSize: '1.2rem', color: '#B45309' }}>({agent.avis} avis)</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {agent.badges.map(badge => (
                          <span key={badge} style={{
                            fontSize: '1.1rem', fontWeight: 700,
                            padding: '3px 10px', borderRadius: 20,
                            background: badge === 'Top Agent' ? '#1B4FD8' : badge === 'Vérifié Darni' ? '#00705A' : '#F3F4F6',
                            color: badge === 'Top Agent' || badge === 'Vérifié Darni' ? '#fff' : '#374151',
                          }}>
                            {badge === 'Top Agent' ? '🏆 ' : badge === 'Vérifié Darni' ? '✓ ' : '⚡ '}{badge}
                          </span>
                        ))}
                      </div>

                      {/* Bio */}
                      <p style={{ fontSize: '1.3rem', color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>{agent.bio}</p>

                      {/* Stats */}
                      <div style={{ display: 'flex', gap: isMobile ? 16 : 28, marginBottom: 16, flexWrap: 'wrap' }}>
                        {[
                          { label: 'Transactions', value: agent.transactions },
                          { label: 'Annonces actives', value: agent.annonces },
                          { label: 'Langues', value: agent.langues.join(', ') },
                        ].map((stat, i) => (
                          <div key={i}>
                            <p style={{ fontSize: '1.1rem', color: '#9CA3AF', marginBottom: 2 }}>{stat.label}</p>
                            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* CTAs */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a href={`tel:${agent.phone}`}
                          style={{ flex: isMobile ? 1 : 'none', background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                          <Phone style={{ width: 14, height: 14 }} /> Appeler
                        </a>
                        <a href={`https://wa.me/${agent.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          style={{ flex: isMobile ? 1 : 'none', background: '#F0FDF4', color: '#16A34A', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '10px 20px', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                          <MessageCircle style={{ width: 14, height: 14 }} /> WhatsApp
                        </a>
                        <button onClick={() => navigate(`/search?q=${agent.wilaya}`)}
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

            {/* CTA devenir agent */}
            <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', borderRadius: 20, padding: isMobile ? '28px 20px' : '36px 40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <p style={{ color: '#93C5FD', fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vous êtes agent immobilier ?</p>
                <h3 style={{ color: '#fff', fontSize: isMobile ? '2rem' : '2.4rem', fontWeight: 800, marginBottom: 6 }}>Rejoignez la communauté Samsara</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.4rem' }}>Publiez jusqu'à 20 annonces pour 4,99€/mois et trouvez vos prochains clients.</p>
              </div>
              <button onClick={() => navigate('/a-propos')}
                style={{ flexShrink: 0, background: '#fff', color: '#0F2D4A', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', alignSelf: isMobile ? 'stretch' : 'auto', textAlign: 'center' }}>
                Voir l'offre Samsar →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}