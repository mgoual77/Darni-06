import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield, Star, Building2, Home, MapPin, Phone, ChevronDown } from 'lucide-react';

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

export function AboutPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const wilayas = useCountUp(48, 1500, statsVisible);
  const annonces = useCountUp(2500, 2000, statsVisible);
  const agences = useCountUp(120, 1800, statsVisible);
  const acheteurs = useCountUp(15000, 2000, statsVisible);

  const px = isMobile ? '20px' : '40px';

  const ACTORS = [
    {
      icon: <Home style={{ width: 32, height: 32, color: '#1B4FD8' }} />,
      title: 'Particuliers vendeurs',
      subtitle: 'Vendez ou louez votre bien en quelques minutes',
      points: [
        'Publication gratuite avec jusqu\'à 10 photos',
        'Visible par des milliers d\'acheteurs qualifiés',
        'Recevez des demandes directement sur WhatsApp',
        'Statistiques de vues en temps réel',
      ],
      cta: 'Publier une annonce',
      ctaAction: '/publish',
      color: '#EEF2FF',
      border: '#1B4FD8',
    },
    {
      icon: <Building2 style={{ width: 32, height: 32, color: '#00705A' }} />,
      title: 'Agences immobilières',
      subtitle: 'Développez votre portefeuille clients sur toute l\'Algérie',
      points: [
        'Profil agence vérifié avec badge officiel',
        'Annonces illimitées avec abonnement Pro',
        'Tableau de bord avec analytics avancés',
        'Mise en avant prioritaire dans les résultats',
      ],
      cta: 'Devenir agence partenaire',
      ctaAction: '/agences',
      color: '#F0FDF4',
      border: '#00705A',
    },
    {
      icon: <Users style={{ width: 32, height: 32, color: '#7C3AED' }} />,
      title: 'Promoteurs immobiliers',
      subtitle: 'Commercialisez vos projets neufs à grande échelle',
      points: [
        'Page projet dédiée avec plan de masse',
        'Système de prise de rendez-vous intégré',
        'Campagnes de visibilité sur toute la plateforme',
        'Export des leads qualifiés en temps réel',
      ],
      cta: 'Nous contacter',
      ctaAction: '/publish',
      color: '#F5F3FF',
      border: '#7C3AED',
    },
    {
      icon: <MapPin style={{ width: 32, height: 32, color: '#EA580C' }} />,
      title: 'Acheteurs & locataires',
      subtitle: 'Trouvez le bien idéal parmi des milliers d\'annonces vérifiées',
      points: [
        'Recherche avancée par wilaya, quartier, budget',
        'Alertes email pour les nouvelles annonces',
        'Contact direct propriétaire sans intermédiaire',
        'Estimation gratuite de la valeur d\'un bien',
      ],
      cta: 'Commencer la recherche',
      ctaAction: '/search',
      color: '#FFF7ED',
      border: '#EA580C',
    },
  ];

  const WHY_DARNI = [
    { icon: '🇩🇿', title: '100% algérien', desc: 'Conçu pour le marché algérien avec les 48 wilayas, les prix en DA et les spécificités locales.' },
    { icon: '📱', title: 'Mobile-first', desc: 'Application installable sur Android et iOS, optimisée pour les connexions mobiles en Algérie.' },
    { icon: '🔒', title: 'Annonces vérifiées', desc: 'Chaque vendeur passe par une vérification d\'identité pour garantir la fiabilité des annonces.' },
    { icon: '⚡', title: 'Publication en 2 min', desc: 'Formulaire simplifié adapté au marché local, publication immédiate après validation.' },
    { icon: '💬', title: 'Contact WhatsApp', desc: 'Les acheteurs contactent directement le vendeur via WhatsApp, le canal préféré des Algériens.' },
    { icon: '📊', title: 'Données du marché', desc: 'Accédez aux prix moyens par wilaya et quartier pour vendre ou acheter au juste prix.' },
  ];

  const TESTIMONIALS = [
    { name: 'Karim B.', role: 'Agent immobilier, Alger', text: 'Darni m\'a permis de trouver 3 acheteurs sérieux en une semaine pour un appartement à Hydra. La qualité des contacts est bien meilleure qu\'Ouedkniss.', rating: 5 },
    { name: 'Samira M.', role: 'Promotrice, Oran', text: 'Nous avons commercialisé notre résidence à Bir El Djir exclusivement sur Darni. 80% des appartements vendus en 2 mois. Excellent ciblage.', rating: 5 },
    { name: 'Yacine T.', role: 'Particulier vendeur, Constantine', text: 'Simple, rapide et efficace. J\'ai vendu mon F4 à Ali Mendjeli en 3 semaines. Je recommande à tous les propriétaires.', rating: 5 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 60%, #1B4FD8 100%)',
        padding: isMobile ? '60px 20px 80px' : '100px 40px 120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>🏠</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>La plateforme immobilière algérienne</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: isMobile ? '3rem' : '5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            L'immobilier algérien<br />
            <span style={{ color: '#93C5FD' }}>mérite mieux</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '1.5rem' : '1.8rem', lineHeight: 1.6, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            Darni connecte propriétaires, agences et acheteurs sur une plateforme moderne, vérifiée et pensée pour le marché algérien.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/publish')}
              style={{ background: '#fff', color: '#1B4FD8', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              Publier une annonce <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={() => navigate('/search')}
              style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer' }}>
              Explorer les biens
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ background: '#F7F8FA', padding: isMobile ? '40px 20px' : '60px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 20 : 32 }}>
          {[
            { value: wilayas, suffix: '', label: 'Wilayas couvertes', icon: '📍' },
            { value: annonces, suffix: '+', label: 'Annonces actives', icon: '🏠' },
            { value: agences, suffix: '+', label: 'Agences partenaires', icon: '🏢' },
            { value: acheteurs, suffix: '+', label: 'Visiteurs/mois', icon: '👥' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: isMobile ? '20px 16px' : '28px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{stat.icon}</div>
              <p style={{ fontSize: isMobile ? '2.8rem' : '3.6rem', fontWeight: 900, color: '#1B4FD8', marginBottom: 4 }}>
                {stat.value.toLocaleString('fr-DZ')}{stat.suffix}
              </p>
              <p style={{ fontSize: '1.3rem', color: '#6B7280', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── POUR QUI ? ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
          <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pour tous les acteurs</p>
          <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.6rem', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>
            Darni, c'est fait pour vous
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24 }}>
          {ACTORS.map((actor, i) => (
            <div key={i} style={{ background: actor.color, border: `1.5px solid ${actor.border}22`, borderRadius: 20, padding: isMobile ? '24px 20px' : '36px 32px', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                  {actor.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '1.8rem' : '2rem', fontWeight: 800, color: '#111827', marginBottom: 4 }}>{actor.title}</h3>
                  <p style={{ fontSize: '1.3rem', color: '#6B7280' }}>{actor.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {actor.points.map((point, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle style={{ width: 18, height: 18, color: actor.border, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '1.3rem', color: '#374151' }}>{point}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate(actor.ctaAction)}
                style={{ background: actor.border, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {actor.cta} <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── POURQUOI DARNI ── */}
      <div style={{ background: '#F7F8FA', padding: isMobile ? '60px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Nos avantages</p>
            <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.6rem', fontWeight: 900, color: '#111827' }}>
              Pourquoi choisir Darni ?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
            {WHY_DARNI.map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: '1.3rem', color: '#6B7280', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TÉMOIGNAGES ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
          <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Témoignages</p>
          <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.6rem', fontWeight: 900, color: '#111827' }}>
            Ils font confiance à Darni
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} style={{ width: 16, height: 16, fill: '#F5A623', color: '#F5A623' }} />
                ))}
              </div>
              <p style={{ fontSize: '1.3rem', color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>
                  {t.name[0]}
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
      <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: isMobile ? '2.6rem' : '4rem', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
          Prêt à rejoindre Darni ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? '1.5rem' : '1.8rem', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Que vous soyez propriétaire, agence ou acheteur — votre place est sur Darni.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/publish')}
            style={{ background: '#fff', color: '#00513F', border: 'none', borderRadius: 12, padding: '16px 32px', fontSize: '1.6rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            Publier gratuitement <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '16px 32px', fontSize: '1.6rem', fontWeight: 600, cursor: 'pointer' }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}