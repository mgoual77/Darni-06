import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/formatPrice'

interface Listing {
  id: string
  title: string
  description: string
  type: string
  transaction: string
  price: number
  surface: number
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  wilaya: string
  commune: string | null
  quartier: string | null
  amenities: string[]
  photos: string[]
  whatsapp: string | null
  phone: string | null
  document_type: string | null
  document_types: string[] | null
  status: string
  created_at: string
}

const AMENITY_LABELS: Record<string, string> = {
  ascenseur: 'Ascenseur', parking: 'Parking', balcon: 'Balcon',
  terrasse: 'Terrasse', jardin: 'Jardin', piscine: 'Piscine',
  securite: 'Sécurité / Gardien', meuble: 'Meublé',
  climatisation: 'Climatisation', cave: 'Cave / Box',
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Autre',
}

const DOC_LABELS: Record<string, string> = {
  acte_notarie: 'Acte notarié',
  livret_foncier: 'Livret foncier',
  sans_titre: 'Sans titre (à régulariser)',
}

const BLUE  = '#1B4FD8'
const GREEN = '#25D366'
const DARK  = '#111827'
const GRAY  = '#6B7280'
const GRAY_LT = '#9CA3AF'
const BORDER  = '#E5E7EB'
const BG      = '#F3F4F6'

function extractPhotos(raw: any): string[] {
  const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900'
  if (!raw || !Array.isArray(raw) || raw.length === 0) return [fallback]
  const urls = raw.map((item: any) =>
    typeof item === 'string' ? item : item?.url ?? null
  ).filter(Boolean) as string[]
  return urls.length ? urls : [fallback]
}

function buildWA(raw: string | null): string {
  if (!raw) return '#'
  const d = raw.replace(/\D/g, '')
  const intl = d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d
  return `https://wa.me/${intl}`
}

function buildPhone(raw: string | null): string | null {
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  return `tel:+${d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d}`
}

// ── Icônes SVG propres ───────────────────────────────────────────────────────
const IcoArea = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
const IcoBed  = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12V8a1 1 0 011-1h1m14 5V8a1 1 0 00-1-1h-1M3 12h18M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" /></svg>
const IcoBath = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12h16M4 12V6a2 2 0 012-2h2a2 2 0 012 2v6M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4" /></svg>
const IcoFloor = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" /></svg>
const IcoPin  = () => <svg width={14} height={14} fill="none" stroke={BLUE} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const IcoShare = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
const IcoCheck = () => <svg width={13} height={13} fill="none" stroke="#16A34A" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
const IcoPhone = () => <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
const IcoWA = () => <svg width={17} height={17} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>

// ────────────────────────────────────────────────────────────────────────────

export default function ListingDetail() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing]             = useState<Listing | null>(null)
  const [loading, setLoading]             = useState(true)
  const [activePhoto, setActivePhoto]     = useState(0)
  const [showModal, setShowModal]         = useState(false)
  const [showFullDesc, setShowFullDesc]   = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (!error && data) setListing(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!listing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: 'Lato, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 8 }}>Annonce introuvable</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )

  const photos   = extractPhotos(listing.photos)
  const waLink   = buildWA(listing.whatsapp ?? listing.phone)
  const telLink  = buildPhone(listing.phone ?? listing.whatsapp)
  const location = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')
  const docs     = listing.document_types?.length ? listing.document_types : listing.document_type ? [listing.document_type] : []
  const refCode  = listing.id.slice(0, 8).toUpperCase()
  const descCut  = 280

  const share = () => {
    if (navigator.share) navigator.share({ title: listing.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !') }
  }

  // Stats à afficher
  const stats = [
    listing.surface ? { icon: <IcoArea />, val: `${listing.surface} m²`,       label: 'Surface'   } : null,
    listing.bedrooms ? { icon: <IcoBed />,  val: `${listing.bedrooms} Chambre${listing.bedrooms > 1 ? 's' : ''}`, label: 'Chambres'  } : null,
    listing.bathrooms ? { icon: <IcoBath />, val: `${listing.bathrooms} SDB`,    label: 'Salles de bain' } : null,
    listing.rooms ? { icon: <IcoFloor />, val: `${listing.rooms} Pièces`,     label: 'Pièces'    } : null,
    listing.floor !== null && listing.floor !== undefined ? { icon: <IcoFloor />, val: `Étage ${listing.floor}`, label: 'Étage' } : null,
  ].filter(Boolean) as { icon: React.ReactNode; val: string; label: string }[]

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Lato, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── Fil d'Ariane ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 24px', fontSize: 12, color: GRAY_LT, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_LT, fontSize: 12, padding: 0 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUE}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = GRAY_LT}>
            ← Retour
          </button>
          <span>›</span><span>{listing.wilaya}</span>
          <span>›</span><span>{TYPE_LABELS[listing.type] || listing.type}</span>
          <span>›</span>
          <span style={{ color: '#374151', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
            {listing.title}
          </span>
        </div>
      </div>

      {/* ── Galerie style Bayut : 1 grande + 3 stacked ── */}
      <div style={{ background: '#000' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', height: 480, gap: 3 }}>
          {/* Grande photo */}
          <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setShowModal(true)}>
            <img src={photos[0]} alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900' }} />
          </div>
          {/* 3 petites stacked */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 3 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1a1a' }}
                onClick={() => { setActivePhoto(i); setShowModal(true) }}>
                {photos[i] ? (
                  <img src={photos[i]} alt={`Photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2a2a2a' }}>
                    <svg width={24} height={24} fill="none" stroke="#555" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Overlay "+X" sur la dernière */}
                {i === 3 && photos.length > 4 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                    <svg width={22} height={22} fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>+{photos.length - 3} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Corps principal ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 100px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* ── Colonne principale (gauche) ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ─ Prix + titre + partage ─ */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', marginBottom: 16, border: `1px solid ${BORDER}` }}>
            {/* Ligne supérieure : prix + actions */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
              {/* Prix */}
              <div>
                <p style={{ fontSize: 11, color: GRAY, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {listing.transaction === 'vente' ? 'Prix de vente' : 'Loyer mensuel'}
                </p>
                <p style={{ fontSize: 34, fontWeight: 900, color: DARK, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {formatPrice(listing.price, listing.transaction)}
                </p>
              </div>

              {/* Partager */}
              <button onClick={share}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>
                <IcoShare /> Partager
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#fff', background: BLUE }}>
                {TYPE_LABELS[listing.type] || listing.type}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#fff', background: listing.transaction === 'vente' ? '#059669' : '#7C3AED' }}>
                {listing.transaction === 'vente' ? 'À vendre' : 'À louer'}
              </span>
            </div>

            {/* Stats en ligne — style Bayut */}
            {stats.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: i < stats.length - 1 ? 16 : 0, marginRight: i < stats.length - 1 ? 16 : 0, borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : 'none', color: '#374151', fontSize: 14, fontWeight: 500 }}>
                    <span style={{ color: GRAY }}>{s.icon}</span>
                    <span style={{ fontWeight: 700, color: DARK }}>{s.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Localisation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: GRAY, marginBottom: 8 }}>
              <IcoPin />
              <span>{location}</span>
            </div>

            <p style={{ fontSize: 12, color: GRAY_LT, margin: 0 }}>
              Réf. #{refCode} · Publié le {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* ─ Équipements ─ */}
          {listing.amenities?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px 32px', marginBottom: 16, border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: '0 0 18px', letterSpacing: '-0.01em' }}>Équipements</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {listing.amenities.map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', padding: '10px 14px', border: `1px solid ${BORDER}`, borderRadius: 8, background: BG }}>
                    <IcoCheck />
                    {AMENITY_LABELS[a] || a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ Description ─ */}
          {listing.description && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px 32px', marginBottom: 16, border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: '0 0 14px', letterSpacing: '-0.01em' }}>Description</h2>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                {showFullDesc || listing.description.length <= descCut
                  ? listing.description
                  : listing.description.slice(0, descCut) + '…'}
              </p>
              {listing.description.length > descCut && (
                <button onClick={() => setShowFullDesc(v => !v)}
                  style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 700, padding: 0 }}>
                  {showFullDesc ? 'Voir moins ↑' : 'Lire la suite ↓'}
                </button>
              )}
            </div>
          )}

          {/* ─ Informations du bien ─ */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 32px', border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: '0 0 20px', letterSpacing: '-0.01em' }}>Informations du bien</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {[
                { label: 'Type',          value: TYPE_LABELS[listing.type] || listing.type },
                { label: 'Transaction',   value: listing.transaction === 'vente' ? 'Vente' : 'Location' },
                { label: 'Wilaya',        value: listing.wilaya },
                { label: 'Commune',       value: listing.commune || '—' },
                { label: 'Quartier',      value: listing.quartier || '—' },
                listing.surface ? { label: 'Superficie',  value: `${listing.surface} m²` } : null,
                listing.rooms   ? { label: 'Nb pièces',   value: `${listing.rooms}` } : null,
                listing.bedrooms ? { label: 'Chambres',   value: `${listing.bedrooms}` } : null,
                listing.bathrooms ? { label: 'Salles de bain', value: `${listing.bathrooms}` } : null,
                listing.floor !== null && listing.floor !== undefined ? { label: 'Étage', value: `${listing.floor}` } : null,
                docs.length > 0 ? { label: 'Documents', value: docs.map(d => DOC_LABELS[d] || d).join(', ') } : null,
              ].filter(Boolean).map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>{row!.label}</span>
                  <span style={{ fontSize: 13, color: DARK, fontWeight: 700, textAlign: 'right', maxWidth: '55%' }}>{row!.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Colonne droite sticky — Contact ── */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden', position: 'sticky', top: 20 }}>

            {/* Header card */}
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>D</div>
                <div>
                  <p style={{ fontWeight: 700, color: DARK, fontSize: 15, margin: '0 0 2px' }}>Vendeur Darni</p>
                  <p style={{ fontSize: 12, color: GRAY_LT, margin: 0 }}>✓ Membre vérifié</p>
                </div>
              </div>

              {/* Prix dans la sidebar */}
              <div style={{ background: BG, borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 11, color: GRAY, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prix demandé</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: DARK, margin: 0, letterSpacing: '-0.02em' }}>
                  {formatPrice(listing.price, listing.transaction)}
                </p>
              </div>
            </div>

            {/* Boutons CTA */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* WhatsApp — CTA #1 */}
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '14px 0', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'opacity 0.15s', letterSpacing: '0.01em' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                <IcoWA /> WhatsApp
              </a>

              {/* Appeler */}
              {telLink && (
                <a href={telLink}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '13px 0', borderRadius: 10, background: BLUE, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                  <IcoPhone /> Appeler
                </a>
              )}

              {/* Partager */}
              <button onClick={share}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                <IcoShare /> Partager l'annonce
              </button>
            </div>

            <div style={{ padding: '0 24px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: GRAY_LT, margin: 0 }}>Réf. annonce #{refCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre mobile fixe ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '10px 16px', display: 'flex', gap: 10, zIndex: 50, boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
        {telLink && (
          <a href={telLink}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 10, background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <IcoPhone /> Appeler
          </a>
        )}
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <IcoWA /> WhatsApp
        </a>
      </div>

      {/* ── Modal galerie plein écran ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'fade 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexShrink: 0 }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0 }}>{activePhoto + 1} / {photos.length}</p>
            <button onClick={() => setShowModal(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 70px', position: 'relative' }}>
            <img src={photos[activePhoto]} alt=""
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }} />
            {activePhoto > 0 && (
              <button onClick={() => setActivePhoto(p => p - 1)}
                style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 46, height: 46, cursor: 'pointer', color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            {activePhoto < photos.length - 1 && (
              <button onClick={() => setActivePhoto(p => p + 1)}
                style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 46, height: 46, cursor: 'pointer', color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
          </div>
          {/* Miniatures */}
          <div style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto', flexShrink: 0 }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                style={{ height: 60, width: 90, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, opacity: i === activePhoto ? 1 : 0.4, border: i === activePhoto ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}