import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, X, Star, Home, Building2, Users, MapPin, Mail, Phone } from 'lucide-react';

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

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    currency: '',
    period: 'pour toujours',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    badge: null,
    features: [
      { label: 'Annonces actives',       value: '3 max',   ok: true  },
      { label: 'Photos par annonce',     value: '5 max',   ok: true  },
      { label: 'Visibilité standard',    value: '',         ok: true  },
      { label: 'Contact WhatsApp',       value: '',         ok: true  },
      { label: 'Statistiques de vues',   value: '',         ok: false },
      { label: 'Badge vérifié',          value: '',         ok: false },
      { label: 'Annonces en vedette',    value: '',         ok: false },
      { label: 'Support prioritaire',    value: '',         ok: false },
      { label: 'Profil agence dédié',    value: '',         ok: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: { background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB' },
  },
  {
    name: 'Samsar',
    price: '4.99',
    currency: '€',
    period: '/mois',
    color: '#1B4FD8',
    bg: '#EEF2FF',
    border: '#1B4FD8',
    badge: 'Populaire',
    features: [
      { label: 'Annonces actives',       value: '20 max',  ok: true  },
      { label: 'Photos par annonce',     value: '10 max',  ok: true  },
      { label: 'Visibilité améliorée',   value: '',         ok: true  },
      { label: 'Contact WhatsApp',       value: '',         ok: true  },
      { label: 'Statistiques de vues',   value: '',         ok: true  },
      { label: 'Badge vérifié',          value: '',         ok: true  },
      { label: 'Annonces en vedette',    value: '1/mois',  ok: true  },
      { label: 'Support prioritaire',    value: '',         ok: false },
      { label: 'Profil agence dédié',    value: '',         ok: false },
    ],
    cta: 'Essayer Samsar — 4,99€/mois',
    ctaStyle: { background: '#1B4FD8', color: '#fff', border: 'none' },
  },
  {
    name: 'Agence Pro',
    price: '29.99',
    currency: '€',
    period: '/mois',
    color: '#00705A',
    bg: '#F0FDF4',
    border: '#00705A',
    badge: 'Meilleure valeur',
    features: [
      { label: 'Annonces actives',       value: 'Illimitées', ok: true },
      { label: 'Photos par annonce',     value: '20 max',     ok: true },
      { label: 'Visibilité maximale',    value: '',            ok: true },
      { label: 'Contact WhatsApp',       value: '',            ok: true },
      { label: 'Statistiques avancées',  value: '',            ok: true },
      { label: 'Badge agence vérifié',   value: '',            ok: true },
      { label: 'Annonces en vedette',    value: '5/mois',     ok: true },
      { label: 'Support prioritaire',    value: '24h/24',     ok: true },
      { label: 'Profil agence dédié',    value: '',            ok: true },
    ],
    cta: 'Devenir partenaire',
    ctaStyle: { background: '#00705A', color: '#fff', border: 'none' },
  },
];

const ACTORS = [
  {
    icon: <Home style={{ width: 28, height: 28, color: '#1B4FD8' }} />,
    title: 'Particuliers vendeurs',
    subtitle: 'Vous avez un bien à vendre ou à louer ?',
    desc: 'Publiez votre annonce en moins de 2 minutes avec photos, description et prix. Des milliers d\'acheteurs sérieux verront votre bien directement sur leur téléphone. Contactez-les via WhatsApp en un clic — sans intermédiaire, sans commission.',
    color: '#EEF2FF',
    iconBg: '#DBEAFE',
  },
  {
    icon: <Users style={{ width: 28, height: 28, color: '#7C3AED' }} />,
    title: 'Agents & Samsara',
    subtitle: 'Vous êtes agent immobilier indépendant ?',
    desc: 'Gérez jusqu\'à 20 annonces simultanées avec l\'offre Samsar à 2,99€/mois. Suivez les statistiques de vos annonces, obtenez le badge vérifié pour inspirer confiance et bénéficiez d\'une visibilité améliorée dans les résultats de recherche.',
    color: '#F5F3FF',
    iconBg: '#EDE9FE',
  },
  {
    icon: <Building2 style={{ width: 28, height: 28, color: '#00705A' }} />,
    title: 'Agences immobilières',
    subtitle: 'Vous gérez une agence avec plusieurs agents ?',
    desc: 'L\'offre Agence Pro à 19,99€/mois vous donne des annonces illimitées, un profil agence dédié avec logo et coordonnées, 5 mises en vedette par mois, des statistiques avancées et un support client prioritaire disponible 24h/24.',
    color: '#F0FDF4',
    iconBg: '#DCFCE7',
  },
  {
    icon: <MapPin style={{ width: 28, height: 28, color: '#EA580C' }} />,
    title: 'Acheteurs & locataires',
    subtitle: 'Vous cherchez votre prochain chez-vous ?',
    desc: 'Recherchez parmi des milliers d\'annonces vérifiées dans toutes les wilayas d\'Algérie. Filtrez par type, budget, wilaya et surface. Contactez directement le vendeur ou l\'agent par WhatsApp. Darni est 100% gratuit pour les acheteurs.',
    color: '#FFF7ED',
    iconBg: '#FED7AA',
  },
];

const TESTIMONIALS = [
  { name: 'Karim B.', role: 'Agent immobilier, Alger', text: 'Darni m\'a permis de trouver 3 acheteurs sérieux en une semaine pour un appartement à Hydra. La qualité des contacts est bien meilleure qu\'Ouedkniss.', rating: 5, avatar: 'K' },
  { name: 'Samira M.', role: 'Promotrice, Oran', text: 'Nous avons commercialisé notre résidence à Bir El Djir sur Darni. 80% des appartements vendus en 2 mois. Excellent ciblage et interface très simple.', rating: 5, avatar: 'S' },
  { name: 'Yacine T.', role: 'Particulier vendeur, Constantine', text: 'Simple, rapide et efficace. J\'ai vendu mon F4 à Ali Mendjeli en 3 semaines. Je recommande à tous les propriétaires algériens.', rating: 5, avatar: 'Y' },
];

export function AboutPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [statsVisible, setStatsVisible] = useState(false);
  const [activePlan, setActivePlan] = useState(1);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const wilayas  = useCountUp(48,    1500, statsVisible);
  const annonces = useCountUp(2500,  2000, statsVisible);
  const agences  = useCountUp(120,   1800, statsVisible);
  const visiteurs = useCountUp(15000, 2000, statsVisible);

  const px = isMobile ? '20px' : '40px';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)',
        padding: isMobile ? '60px 20px 80px' : '90px 40px 110px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: '1.1rem' }}>🇩🇿</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>La plateforme immobilière 100% algérienne</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: isMobile ? '3rem' : '4.8rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            L'immobilier algérien<br />
            <span style={{ color: '#93C5FD' }}>mérite mieux</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '1.5rem' : '1.7rem', lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: '0 auto 40px' }}>
            Darni connecte propriétaires, agents et acheteurs sur une plateforme moderne, vérifiée et pensée pour le marché algérien — de Alger à Tamanrasset.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/publish')}
              style={{ background: '#fff', color: '#1B4FD8', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Publier gratuitement <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={() => navigate('/search')}
              style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer' }}>
              Explorer les biens
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ background: '#F7F8FA', padding: isMobile ? '40px 20px' : '56px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 16 : 28 }}>
          {[
            { value: wilayas,   suffix: '',  label: 'Wilayas couvertes', icon: '📍' },
            { value: annonces,  suffix: '+', label: 'Annonces actives',  icon: '🏠' },
            { value: agences,   suffix: '+', label: 'Agences partenaires', icon: '🏢' },
            { value: visiteurs, suffix: '+', label: 'Visiteurs/mois',    icon: '👥' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: isMobile ? '20px 16px' : '28px 24px', textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>{stat.icon}</div>
              <p style={{ fontSize: isMobile ? '2.8rem' : '3.4rem', fontWeight: 900, color: '#1B4FD8', marginBottom: 4 }}>
                {stat.value.toLocaleString('fr-DZ')}{stat.suffix}
              </p>
              <p style={{ fontSize: '1.3rem', color: '#6B7280', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── POUR QUI ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '90px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pour tous les acteurs</p>
          <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.4rem', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>
            Darni, c'est fait pour vous
          </h2>
          <p style={{ fontSize: '1.4rem', color: '#6B7280', marginTop: 12, maxWidth: 520, margin: '12px auto 0' }}>
            Que vous soyez propriétaire, agent ou acheteur — Darni simplifie l'immobilier algérien.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
          {ACTORS.map((actor, i) => (
            <div key={i} style={{ background: actor.color, borderRadius: 20, padding: isMobile ? '24px 20px' : '32px 28px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ background: actor.iconBg, borderRadius: 12, padding: 12, flexShrink: 0 }}>
                  {actor.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 2 }}>{actor.title}</h3>
                  <p style={{ fontSize: '1.3rem', color: '#6B7280', fontStyle: 'italic' }}>{actor.subtitle}</p>
                </div>
              </div>
              <p style={{ fontSize: '1.35rem', color: '#374151', lineHeight: 1.7 }}>{actor.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TARIFICATION ── */}
      <div style={{ background: '#F7F8FA', padding: isMobile ? '60px 20px' : '90px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 60 }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Tarification</p>
            <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.4rem', fontWeight: 900, color: '#111827' }}>
              Simple et transparent
            </h2>
            <p style={{ fontSize: '1.4rem', color: '#6B7280', marginTop: 12 }}>
              Commencez gratuitement — passez à l'offre supérieure quand vous êtes prêt.
            </p>
          </div>

          {/* Cards tarifs */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 20,
                border: `2px solid ${i === activePlan ? plan.border : '#E5E7EB'}`,
                padding: '28px 24px',
                position: 'relative',
                boxShadow: i === activePlan ? `0 8px 32px ${plan.color}22` : '0 2px 8px rgba(0,0,0,0.05)',
                transform: i === activePlan && !isMobile ? 'scale(1.03)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onClick={() => setActivePlan(i)}>

                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: '1.1rem', fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: plan.color, marginBottom: 8 }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#374151' }}>{plan.currency}</span>
                    <span style={{ fontSize: '3.6rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: '1.3rem', color: '#9CA3AF' }}>{plan.period}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: f.ok ? 1 : 0.45 }}>
                      {f.ok
                        ? <CheckCircle style={{ width: 16, height: 16, color: plan.color, flexShrink: 0 }} />
                        : <X style={{ width: 16, height: 16, color: '#9CA3AF', flexShrink: 0 }} />
                      }
                      <span style={{ fontSize: '1.3rem', color: f.ok ? '#374151' : '#9CA3AF' }}>
                        {f.label}
                        {f.value && <span style={{ fontWeight: 700, color: plan.color }}> — {f.value}</span>}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={(e) => { e.stopPropagation(); navigate('/publish'); }}
                  style={{ width: '100%', padding: '13px 0', borderRadius: 10, fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', ...plan.ctaStyle }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Tableau comparatif desktop */}
          {!isMobile && (
            <div style={{ marginTop: 48, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F7F8FA' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '1.3rem', color: '#6B7280', fontWeight: 600, width: '40%' }}>Fonctionnalité</th>
                    {PLANS.map(p => (
                      <th key={p.name} style={{ padding: '16px 20px', textAlign: 'center', fontSize: '1.3rem', color: p.color, fontWeight: 800 }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLANS[0].features.map((f, fi) => (
                    <tr key={fi} style={{ borderTop: '1px solid #F3F4F6', background: fi % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 20px', fontSize: '1.3rem', color: '#374151' }}>{f.label}</td>
                      {PLANS.map((plan, pi) => {
                        const feat = plan.features[fi];
                        return (
                          <td key={pi} style={{ padding: '14px 20px', textAlign: 'center' }}>
                            {feat.ok
                              ? feat.value
                                ? <span style={{ fontSize: '1.2rem', fontWeight: 700, color: plan.color }}>{feat.value}</span>
                                : <CheckCircle style={{ width: 18, height: 18, color: plan.color, margin: '0 auto' }} />
                              : <X style={{ width: 16, height: 16, color: '#D1D5DB', margin: '0 auto' }} />
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '90px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 56 }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Témoignages</p>
          <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.4rem', fontWeight: 900, color: '#111827' }}>
            Ils font confiance à Darni
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} style={{ width: 15, height: 15, fill: '#F5A623', color: '#F5A623' }} />)}
              </div>
              <p style={{ fontSize: '1.3rem', color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>{t.name}</p>
                  <p style={{ fontSize: '1.2rem', color: '#6B7280' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', padding: isMobile ? '60px 20px' : '90px 40px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: isMobile ? '2.6rem' : '3.8rem', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
          Prêt à rejoindre Darni ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? '1.5rem' : '1.7rem', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          Propriétaire, agent ou acheteur — commencez gratuitement dès aujourd'hui.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/publish')}
            style={{ background: '#fff', color: '#00513F', border: 'none', borderRadius: 12, padding: '16px 32px', fontSize: '1.6rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            Publier gratuitement <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '16px 32px', fontSize: '1.6rem', fontWeight: 600, cursor: 'pointer' }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}