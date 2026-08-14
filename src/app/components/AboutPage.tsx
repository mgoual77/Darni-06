import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, X, Home, Building2, Users, MapPin, TrendingUp, Shield, Zap, Heart, Globe, Award } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO'
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
    name: 'Free',
    tier: 'Particuliers',
    emoji: '🆓',
    tagline: 'Gratuit — pour toujours',
    color: '#92400E',
    bg: '#FFFBEB',
    border: '#D97706',
    badge: null,
    features: [
      { label: 'Annonces actives',      value: '3 max',      ok: true  },
      { label: 'Photos par annonce',    value: '5 max',      ok: true  },
      { label: 'Visibilité standard',   value: '',            ok: true  },
      { label: 'Contact WhatsApp',      value: '',            ok: true  },
      { label: 'Statistiques de vues',  value: '',            ok: false },
      { label: 'Badge vérifié',         value: '',            ok: false },
      { label: 'Annonces en vedette',   value: '',            ok: false },
      { label: 'Support prioritaire',   value: '',            ok: false },
      { label: 'Profil agence dédié',   value: '',            ok: false },
    ],
    cta: 'Commencer gratuitement',
    ctaContact: false,
    ctaStyle: { background: '#D97706', color: '#fff', border: 'none' },
  },
  {
    name: 'Samsar',
    tier: 'Agents indépendants',
    emoji: '👤',
    tagline: 'Pour les samsara & agents',
    color: '#374151',
    bg: '#F9FAFB',
    border: '#6B7280',
    badge: 'Populaire',
    features: [
      { label: 'Annonces actives',      value: '20 max',     ok: true  },
      { label: 'Photos par annonce',    value: '10 max',     ok: true  },
      { label: 'Visibilité améliorée',  value: '',            ok: true  },
      { label: 'Contact WhatsApp',      value: '',            ok: true  },
      { label: 'Statistiques de vues',  value: '',            ok: true  },
      { label: 'Badge vérifié',         value: '',            ok: true  },
      { label: 'Annonces en vedette',   value: '1/mois',     ok: true  },
      { label: 'Support prioritaire',   value: '',            ok: false },
      { label: 'Profil agence dédié',   value: '',            ok: false },
    ],
    cta: 'Nous contacter',
    ctaContact: true,
    ctaStyle: { background: '#374151', color: '#fff', border: 'none' },
  },
  {
    name: 'Agence',
    tier: 'Agences immobilières',
    emoji: '🏢',
    tagline: 'Pour les agences professionnelles',
    color: '#B45309',
    bg: '#FEFCE8',
    border: '#eec64f',
    badge: 'Premium',
    features: [
      { label: 'Annonces actives',      value: 'Illimitées', ok: true  },
      { label: 'Photos par annonce',    value: '20 max',     ok: true  },
      { label: 'Visibilité maximale',   value: '',            ok: true  },
      { label: 'Contact WhatsApp',      value: '',            ok: true  },
      { label: 'Statistiques avancées', value: '',            ok: true  },
      { label: 'Badge agence vérifié',  value: '',            ok: true  },
      { label: 'Annonces en vedette',   value: '5/mois',     ok: true  },
      { label: 'Support prioritaire',   value: '24h/24',     ok: true  },
      { label: 'Profil agence dédié',   value: '',            ok: true  },
    ],
    cta: 'Nous contacter',
    ctaContact: true,
    ctaStyle: { background: '#eec64f', color: '#7a4f00', border: 'none' },
  },
];

export function AboutPage() {
  useSEO({
    title: 'À propos — La plateforme immobilière 100% algérienne',
    description: "Darni est la plateforme immobilière 100% algérienne. Achetez, vendez ou louez dans les 48 wilayas avec des annonces vérifiées.",
    url: 'https://darni.app/a-propos',
  })

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

  // Chiffres réels depuis Supabase — pas de valeurs inventées.
  const [realStats, setRealStats] = useState({ wilayas: 0, annonces: 0, partenaires: 0, visiteurs: 0 });
  useEffect(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    Promise.all([
      supabase.from('listings').select('wilaya').eq('status', 'active'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).in('badge_level', ['verified', 'pro']),
      supabase.from('listing_views').select('viewer_id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    ]).then(([wilayaRes, annoncesRes, agentsRes, viewsRes]) => {
      const distinctWilayas = new Set((wilayaRes.data ?? []).map((l: any) => l.wilaya).filter(Boolean)).size;
      setRealStats({
        wilayas: distinctWilayas,
        annonces: annoncesRes.count ?? 0,
        partenaires: agentsRes.count ?? 0,
        visiteurs: viewsRes.count ?? 0,
      });
    });
  }, []);

  const wilayas   = useCountUp(realStats.wilayas,    1500, statsVisible);
  const annonces  = useCountUp(realStats.annonces,   2000, statsVisible);
  const agences   = useCountUp(realStats.partenaires,1800, statsVisible);
  const visiteurs = useCountUp(realStats.visiteurs,  2000, statsVisible);

  const px = isMobile ? '20px' : '40px';

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: isMobile ? 80 : 0 }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', padding: isMobile ? '60px 20px 80px' : '100px 40px 120px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: '1.1rem' }}>🇩🇿</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>La plateforme immobilière 100% algérienne</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? '3.2rem' : '5.2rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Darni, c'est<br />
            <span style={{ color: '#93C5FD' }}>l'immobilier autrement</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: isMobile ? '1.5rem' : '1.8rem', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 40px' }}>
            Nous avons créé Darni parce que l'immobilier algérien méritait une plateforme moderne, transparente et pensée pour les Algériens — pas une copie d'un site occidental.
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

      {/* ── NOTRE HISTOIRE ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Notre mission</p>
          <h2 style={{ fontSize: isMobile ? '2.6rem' : '4rem', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: 28 }}>
            Rendre l'immobilier algérien<br />accessible à tous
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: isMobile ? '1.5rem' : '1.7rem', color: '#4B5563', lineHeight: 1.9 }}>
            <p>
              En Algérie, trouver ou vendre un bien immobilier est souvent synonyme d'opacité, d'intermédiaires multiples et de commissions élevées. Les plateformes existantes sont soit dépassées, soit inadaptées au marché local.
            </p>
            <p>
              <strong style={{ color: '#111827' }}>Darni a été créé pour changer ça.</strong> Notre vision est simple : mettre en relation directement les propriétaires et les acheteurs, sans friction, sans commission cachée, dans la langue et les codes du marché algérien.
            </p>
            <p>
              Nous couvrons les <strong style={{ color: '#1B4FD8' }}>48 wilayas</strong> d'Algérie, avec une interface mobile-first pensée pour les connexions 4G, des prix en dinars algériens, et un système de contact via WhatsApp — parce que c'est comme ça que les Algériens communiquent.
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', padding: isMobile ? '48px 20px' : '64px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 24 : 40, textAlign: 'center' }}>
          {[
            { value: wilayas,   suffix: '',  label: 'Wilayas couvertes',        icon: '📍' },
            { value: annonces,  suffix: '',  label: 'Annonces publiées',        icon: '🏠' },
            { value: agences,   suffix: '',  label: 'Partenaires vérifiés',     icon: '🏢' },
            { value: visiteurs, suffix: '',  label: 'Visiteurs (30 derniers jours)', icon: '👥' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: isMobile ? '3.2rem' : '4.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {s.value.toLocaleString('fr-DZ')}{s.suffix}
              </div>
              <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.75)', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POURQUOI DARNI ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Ce qui nous distingue</p>
            <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.8rem', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>
              Pourquoi choisir Darni ?
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
            {[
              { icon: '🇩🇿', title: '100% algérien', desc: 'Conçu pour le marché algérien avec les 48 wilayas, les prix en DA, et les spécificités du droit immobilier local. Pas un copier-coller d\'un site occidental.' },
              { icon: '📱', title: 'Mobile-first', desc: 'Application installable sur Android et iOS. Interface optimisée pour les connexions 4G algériennes. Fonctionne même en faible réseau.' },
              { icon: '💬', title: 'WhatsApp natif', desc: 'Les acheteurs contactent les vendeurs directement via WhatsApp — le canal préféré des Algériens. Pas de formulaires, pas d\'intermédiaire.' },
              { icon: '🔒', title: 'Annonces vérifiées', desc: 'Chaque vendeur passe par une vérification d\'identité. Les agences partenaires reçoivent un badge officiel visible sur chaque annonce.' },
              { icon: '⚡', title: 'Publication en 2 min', desc: 'Formulaire simplifié adapté au marché local. Publication immédiate après validation. Jusqu\'à 10 photos par annonce en Bronze.' },
              { icon: '📊', title: 'Données du marché', desc: 'Accédez aux prix moyens par wilaya et quartier pour vendre au juste prix. Statistiques de vues en temps réel pour les offres Argent et Gold.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '3rem', marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: '1.3rem', color: '#6B7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POUR LES ACHETEURS ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 64, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pour les acheteurs</p>
              <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.4rem', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: 20 }}>
                Trouvez votre bien idéal
              </h2>
              <p style={{ fontSize: '1.5rem', color: '#4B5563', lineHeight: 1.8, marginBottom: 28 }}>
                Des milliers d'annonces vérifiées dans toutes les wilayas d'Algérie. Filtrez par type, budget, surface et wilaya. Contactez directement le propriétaire — sans intermédiaire, sans commission, en toute transparence.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Recherche avancée par wilaya, quartier et budget', 'Contact direct via WhatsApp — zéro commission', 'Alertes pour les nouvelles annonces', 'Estimation gratuite de la valeur d\'un bien', 'Darni est 100% gratuit pour les acheteurs'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle style={{ width: 20, height: 20, color: '#1B4FD8', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '1.4rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/search')} style={{ marginTop: 28, background: '#1B4FD8', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Explorer les biens <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)', borderRadius: 24, padding: '40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { emoji: '🔍', title: 'Recherche intelligente', desc: 'Filtres puissants par wilaya, type, prix et surface' },
                { emoji: '📸', title: 'Photos haute qualité', desc: 'Jusqu\'à 20 photos par annonce pour bien choisir' },
                { emoji: '💬', title: 'Contact immédiat', desc: 'Appelez ou WhatsApp le vendeur en un clic' },
                { emoji: '🗺️', title: 'Localisation précise', desc: 'Wilaya, commune et quartier pour chaque annonce' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '2.4rem' }}>{item.emoji}</span>
                  <div>
                    <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: '1.2rem', color: '#6B7280' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── POUR LES VENDEURS & AGENTS ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: '#F7F8FA' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 64, alignItems: 'center' }}>
            {isMobile ? null : (
              <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderRadius: 24, padding: '40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { emoji: '🚀', title: 'Publication rapide', desc: 'Annonce en ligne en moins de 2 minutes' },
                  { emoji: '👁️', title: 'Visibilité maximale', desc: 'Affiché à des milliers d\'acheteurs qualifiés' },
                  { emoji: '📈', title: 'Statistiques en temps réel', desc: 'Suivez les vues, clics et contacts reçus' },
                  { emoji: '✅', title: 'Badge de confiance', desc: 'Badge "Vérifié Darni" pour inspirer confiance' },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '2.4rem' }}>{item.emoji}</span>
                    <div>
                      <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</p>
                      <p style={{ fontSize: '1.2rem', color: '#6B7280' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00705A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pour les vendeurs & agents</p>
              <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.4rem', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: 20 }}>
                Vendez plus vite, mieux et sans commission
              </h2>
              <p style={{ fontSize: '1.5rem', color: '#4B5563', lineHeight: 1.8, marginBottom: 28 }}>
                Que vous soyez propriétaire particulier, agent indépendant ou agence immobilière, Darni vous offre la visibilité que vous méritez. Publiez, gérez et analysez vos annonces depuis votre téléphone.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {['Publication gratuite pour les particuliers (offre Bronze)', 'Jusqu\'à 20 annonces actives pour les agents (offre Argent)', 'Annonces illimitées et profil agence dédié (offre Gold)', 'Badge vérifié sur toutes vos annonces', 'Mise en vedette sur la page d\'accueil'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle style={{ width: 20, height: 20, color: '#00705A', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: '1.4rem', color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/publish')} style={{ background: '#00705A', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Publier une annonce <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── AMBITIONS ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Notre vision</p>
          <h2 style={{ fontSize: isMobile ? '2.6rem' : '4rem', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: 32 }}>
            Darni en 2026 et au-delà
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20, marginBottom: 48 }}>
            {[
              { icon: <Globe style={{ width: 28, height: 28, color: '#1B4FD8' }} />, title: 'Couvrir toute l\'Algérie', desc: 'Atteindre les 48 wilayas avec des annonces dans chaque commune d\'Algérie d\'ici 2027.' },
              { icon: <TrendingUp style={{ width: 28, height: 28, color: '#00705A' }} />, title: '100 000 annonces', desc: 'Devenir la première base de données immobilières en Algérie, devant Ouedkniss et Immovlan.' },
              { icon: <Heart style={{ width: 28, height: 28, color: '#EF4444' }} />, title: 'Confiance & transparence', desc: 'Généraliser la vérification des vendeurs et la notation des agents pour éliminer les arnaques.' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#F7F8FA', borderRadius: 16, padding: '28px 20px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: '1.3rem', color: '#6B7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)', borderRadius: 20, padding: isMobile ? '28px 20px' : '40px', border: '1px solid #BFDBFE' }}>
            <p style={{ fontSize: isMobile ? '1.6rem' : '2rem', color: '#1B4FD8', fontWeight: 700, lineHeight: 1.7, fontStyle: 'italic' }}>
              "Notre ambition est de faire de Darni la référence de l'immobilier en Algérie — la plateforme que chaque Algérien utilise, qu'il cherche à acheter, à louer, ou à vendre son bien."
            </p>
            <p style={{ fontSize: '1.3rem', color: '#6B7280', marginTop: 16, fontWeight: 600 }}>— L'équipe Darni</p>
          </div>
        </div>
      </div>

      {/* ── TARIFICATION ── */}
      <div style={{ padding: isMobile ? '60px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B4FD8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Nos offres</p>
            <h2 style={{ fontSize: isMobile ? '2.4rem' : '3.8rem', fontWeight: 900, color: '#111827', marginBottom: 12 }}>Simple et transparent</h2>
            <p style={{ fontSize: '1.5rem', color: '#6B7280', maxWidth: 560, margin: '0 auto' }}>
              Commencez gratuitement avec l'offre Bronze. Passez à Argent ou Gold quand vous êtes prêt à aller plus loin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <div key={i}
                onClick={() => setActivePlan(i)}
                style={{ background: plan.bg, borderRadius: 20, border: `2px solid ${i === activePlan ? plan.border : '#E5E7EB'}`, padding: '32px 24px', position: 'relative', boxShadow: i === activePlan ? `0 8px 32px rgba(0,0,0,0.1)` : '0 2px 8px rgba(0,0,0,0.05)', transform: i === activePlan && !isMobile ? 'scale(1.03)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>

                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: '1.1rem', fontWeight: 800, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '3.6rem', marginBottom: 10 }}>{plan.emoji}</div>
                  <p style={{ fontSize: '2.2rem', fontWeight: 900, color: plan.color, marginBottom: 4 }}>{plan.name}</p>
                  <p style={{ fontSize: '1.3rem', color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{plan.tier}</p>
                  <p style={{ fontSize: '1.4rem', color: '#374151', fontWeight: 700 }}>{plan.tagline}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: f.ok ? 1 : 0.4 }}>
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

                {plan.ctaContact ? (
                  <a href="mailto:contact@darni.app?subject=Offre%20Darni%20Pro"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'block', width: '100%', padding: '14px 0', borderRadius: 10, fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box', ...plan.ctaStyle }}>
                    ✉️ {plan.cta}
                  </a>
                ) : (
                  <button onClick={e => { e.stopPropagation(); navigate('/publish'); }}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 10, fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', ...plan.ctaStyle }}>
                    {plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tableau comparatif desktop */}
          {!isMobile && (
            <div style={{ marginTop: 48, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F7F8FA' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '1.3rem', color: '#6B7280', fontWeight: 600, width: '40%' }}>Fonctionnalité</th>
                    {PLANS.map(p => (
                      <th key={p.name} style={{ padding: '16px 20px', textAlign: 'center', fontSize: '1.4rem', color: p.color, fontWeight: 800 }}>
                        {p.emoji} {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLANS[0].features.map((f, fi) => (
                    <tr key={fi} style={{ borderTop: '1px solid #F3F4F6', background: fi % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 24px', fontSize: '1.3rem', color: '#374151' }}>{f.label}</td>
                      {PLANS.map((plan, pi) => {
                        const feat = plan.features[fi];
                        return (
                          <td key={pi} style={{ padding: '14px 20px', textAlign: 'center' }}>
                            {feat.ok
                              ? feat.value
                                ? <span style={{ fontSize: '1.2rem', fontWeight: 700, color: plan.color }}>{feat.value}</span>
                                : <CheckCircle style={{ width: 18, height: 18, color: plan.color, margin: '0 auto', display: 'block' }} />
                              : <X style={{ width: 16, height: 16, color: '#D1D5DB', margin: '0 auto', display: 'block' }} />
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

      {/* ── CTA FINAL ── */}
      <div style={{ background: 'linear-gradient(135deg, #00513F 0%, #00705A 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: isMobile ? '2.8rem' : '4rem', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
          Prêt à rejoindre Darni ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? '1.5rem' : '1.8rem', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
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