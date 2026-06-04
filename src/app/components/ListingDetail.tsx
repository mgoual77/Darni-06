import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/formatPrice'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

interface Listing {
  id: string; title: string; description: string; type: string; transaction: string;
  price: number; surface: number; rooms: number | null; bedrooms: number | null;
  bathrooms: number | null; floor: number | null; wilaya: string; commune: string | null;
  quartier: string | null; amenities: string[]; photos: string[]; whatsapp: string | null;
  phone: string | null; document_type: string | null; document_types: string[] | null;
  status: string; created_at: string;
}

const AMENITY_LABELS: Record<string, string> = {
  ascenseur: 'Ascenseur', parking: 'Parking', balcon: 'Balcon', terrasse: 'Terrasse',
  jardin: 'Jardin', piscine: 'Piscine', securite: 'Sécurité / Gardien', meuble: 'Meublé',
  climatisation: 'Climatisation', cave: 'Cave / Box',
}
const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Autre',
}
const DOC_LABELS: Record<string, string> = {
  acte_notarie: 'Acte notarié', livret_foncier: 'Livret foncier', sans_titre: 'Sans titre',
}

const BLUE  = '#1B4FD8'
const DARK  = '#111827'
const GRAY  = '#6B7280'
const GRAY_LT = '#9CA3AF'
const BORDER  = '#E5E7EB'
const BG      = '#F7F8FA'

function extractPhotos(raw: any): string[] {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900'
  if (!raw || !Array.isArray(raw) || raw.length === 0) return [fb]
  const urls = raw.map((x: any) => (typeof x === 'string' ? x : x?.url ?? null)).filter(Boolean) as string[]
  return urls.length ? urls : [fb]
}
function buildWA(raw: string | null) {
  if (!raw) return '#'
  const d = raw.replace(/\D/g, '')
  return `https://wa.me/${d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d}`
}
function buildTel(raw: string | null) {
  if (!raw) return null
  const d = raw.replace(/\D/g, '')
  return `tel:+${d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d}`
}
function firstPhoto(raw: any) { return extractPhotos(raw)[0] }

// ── Icônes ──────────────────────────────────────────────────────────────────
const IcoArea  = () => <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
const IcoBed   = () => <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12V8a1 1 0 011-1h1m14 5V8a1 1 0 00-1-1h-1M3 12h18" /></svg>
const IcoBath  = () => <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12h16M4 12V6a2 2 0 012-2h2a2 2 0 012 2v6M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4" /></svg>
const IcoPin   = () => <svg width={13} height={13} fill="none" stroke={BLUE} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const IcoShare = () => <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
const IcoPhone = () => <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
const IcoWA    = () => <svg width={15} height={15} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
const IcoCheck = () => <svg width={12} height={12} fill="none" stroke={BLUE} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
const IcoHeart = ({ filled }: { filled: boolean }) => (
  <svg width={15} height={15} fill={filled ? '#EF4444' : 'none'} stroke={filled ? '#EF4444' : GRAY} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)
const IcoCam = () => <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

// ── Badge dégradé ────────────────────────────────────────────────────────────
function GradientBadge({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'secondary' | 'success' }) {
  const gradients: Record<string, string> = {
    primary:   'linear-gradient(135deg, #1B4FD8 0%, #4F46E5 100%)',
    secondary: 'linear-gradient(135deg, #1B4FD8 0%, #06b6d4 100%)',
    success:   'linear-gradient(135deg, #1B4FD8 0%, #059669 100%)',
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 5, fontSize: '1.05rem', fontWeight: 700, color: '#fff', background: gradients[variant], letterSpacing: '0.01em' }}>
      {label}
    </span>
  )
}

// ── Mini card reco ───────────────────────────────────────────────────────────
function RecoCard({ listing, onClick }: { listing: Listing; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 210, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}>
      <div style={{ height: 120, overflow: 'hidden', background: '#F5F0E8' }}>
        <img src={firstPhoto(listing.photos)} alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 15, fontWeight: 900, color: BLUE, margin: '0 0 3px', letterSpacing: '-0.02em' }}>
          {formatPrice(listing.price, listing.transaction)}
        </p>
        <p style={{ fontSize: 12, color: GRAY, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: GRAY }}>
          {listing.surface  && <span><strong style={{ color: DARK }}>{listing.surface}</strong> m²</span>}
          {listing.bedrooms && <span><strong style={{ color: DARK }}>{listing.bedrooms}</strong> ch.</span>}
        </div>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [listing, setListing]           = useState<Listing | null>(null)
  const [similar, setSimilar]           = useState<Listing[]>([])
  const [loading, setLoading]           = useState(true)
  const [activePhoto, setActivePhoto]   = useState(0)
  const [showModal, setShowModal]       = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [saved, setSaved]               = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (!error && data) {
          setListing(data)
          supabase.from('listings').select('*')
            .eq('wilaya', data.wilaya).eq('type', data.type)
            .eq('status', 'active').neq('id', id).limit(6)
            .then(({ data: sim }) => setSimilar(sim ?? []))
        }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 12 }}>Annonce introuvable</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )

  const photos   = extractPhotos(listing.photos)
  const waLink   = buildWA(listing.whatsapp ?? listing.phone)
  const telLink  = buildTel(listing.phone ?? listing.whatsapp)
  const location = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')
  const docs     = listing.document_types?.length ? listing.document_types : listing.document_type ? [listing.document_type] : []
  const refCode  = listing.id.slice(0, 8).toUpperCase()
  const mapQuery = encodeURIComponent([listing.commune, listing.wilaya, 'Algérie'].filter(Boolean).join(', '))
  const mapUrl   = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`
  const px       = isMobile ? '16px' : '24px'

  const stats = [
    listing.surface   && { icon: <IcoArea />, val: `${listing.surface} m²`, label: 'Surface' },
    listing.bedrooms  && { icon: <IcoBed />,  val: `${listing.bedrooms}`, label: 'Chambres' },
    listing.bathrooms && { icon: <IcoBath />, val: `${listing.bathrooms}`, label: 'SDB' },
    listing.rooms     && { icon: <IcoArea />, val: `${listing.rooms}`, label: 'Pièces' },
    listing.floor !== null && listing.floor !== undefined && { icon: <IcoArea />, val: `${listing.floor}`, label: 'Étage' },
  ].filter(Boolean) as { icon: React.ReactNode; val: string; label: string }[]

  const infoRows = [
    { label: 'Type',        value: TYPE_LABELS[listing.type] || listing.type },
    { label: 'Transaction', value: listing.transaction === 'vente' ? 'Vente' : 'Location' },
    { label: 'Wilaya',      value: listing.wilaya },
    { label: 'Commune',     value: listing.commune || '—' },
    listing.quartier  && { label: 'Quartier',   value: listing.quartier },
    listing.surface   && { label: 'Superficie', value: `${listing.surface} m²` },
    listing.rooms     && { label: 'Pièces',     value: `${listing.rooms}` },
    listing.bedrooms  && { label: 'Chambres',   value: `${listing.bedrooms}` },
    listing.bathrooms && { label: 'SDB',        value: `${listing.bathrooms}` },
    listing.floor !== null && listing.floor !== undefined && { label: 'Étage', value: `${listing.floor}` },
    docs.length > 0   && { label: 'Document',   value: docs.map(d => DOC_LABELS[d] || d).join(' · ') },
  ].filter(Boolean) as { label: string; value: string }[]

  const share = () => {
    if (navigator.share) navigator.share({ title: listing.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !') }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Lato, sans-serif', paddingBottom: isMobile ? 90 : 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fade{from{opacity:0}to{opacity:1}}`}</style>

      {/* ── Fil d'Ariane ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: `10px ${px}`, fontSize: 12, color: GRAY_LT, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: 12, fontWeight: 600, padding: 0 }}>← Retour</button>
          <span>›</span><span>{listing.wilaya}</span>
          <span>›</span><span>{TYPE_LABELS[listing.type] || listing.type}</span>
          {!isMobile && <><span>›</span><span style={{ color: '#374151', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{listing.title}</span></>}
        </div>
      </div>

      {/* ── GALERIE ── */}
      {isMobile ? (
        <div style={{ position: 'relative', background: '#000', height: 280 }}>
          <img src={photos[activePhoto]} alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900' }} />
          {activePhoto > 0 && (
            <button onClick={() => setActivePhoto(p => p - 1)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          )}
          {activePhoto < photos.length - 1 && (
            <button onClick={() => setActivePhoto(p => p + 1)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          )}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
              {photos.map((_, i) => (
                <div key={i} onClick={() => setActivePhoto(i)}
                  style={{ width: i === activePhoto ? 18 : 6, height: 6, borderRadius: 99, background: i === activePhoto ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }} />
              ))}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 9px', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IcoCam /> {activePhoto + 1}/{photos.length}
          </div>
        </div>
      ) : (
        /* Desktop : grande photo gauche + 3 thumbs droite, hauteur fixe 440px */
        <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: `16px ${px}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 6, height: 440, borderRadius: 16, overflow: 'hidden' }}>
              {/* Grande photo */}
              <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#E5E7EB' }}
                onClick={() => setShowModal(true)}>
                <img src={photos[0]} alt={listing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', transition: 'transform 0.4s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900' }} />
                {/* Badge vérifié */}
                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #1B4FD8, #3B6FE8)', color: '#fff', fontSize: '1rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                    <IcoCheck /> <span style={{ color: '#fff' }}>Vérifié Darni</span>
                  </span>
                  <GradientBadge label={listing.transaction === 'vente' ? 'Vente' : 'Location'} variant="secondary" />
                </div>
                {/* Bouton voir toutes photos */}
                <button onClick={e => { e.stopPropagation(); setShowModal(true) }}
                  style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: DARK, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <IcoCam /> Voir les {photos.length} photos
                </button>
              </div>
              {/* 3 thumbs droite */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 6 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#E5E7EB' }}
                    onClick={() => { setActivePhoto(i); setShowModal(true) }}>
                    {photos[i] ? (
                      <img src={photos[i]} alt={`Photo ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', transition: 'transform 0.3s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IcoCam />
                      </div>
                    )}
                    {i === 3 && photos.length > 4 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>+{photos.length - 3} photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CORPS ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? `16px ${px} 20px` : `24px ${px} 60px`, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 14 : 28, alignItems: 'flex-start' }}>

        {/* ── Colonne gauche ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Prix + titre */}
          <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '18px 16px' : '28px 32px', border: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, color: GRAY_LT, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {listing.transaction === 'vente' ? 'Prix de vente' : 'Loyer mensuel'}
                </p>
                <p style={{ fontSize: isMobile ? 28 : 36, fontWeight: 900, color: BLUE, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {formatPrice(listing.price, listing.transaction)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={share} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <IcoShare /> {!isMobile && 'Partager'}
                </button>
                <button onClick={() => setSaved(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', border: `1.5px solid ${saved ? '#FCA5A5' : BORDER}`, borderRadius: 8, background: saved ? '#FEF2F2' : '#fff', color: saved ? '#EF4444' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <IcoHeart filled={saved} /> {!isMobile && (saved ? 'Sauvegardé' : 'Sauvegarder')}
                </button>
              </div>
            </div>

            {/* Titre */}
            {listing.title && (
              <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: DARK, margin: '0 0 12px', lineHeight: 1.3 }}>{listing.title}</h1>
            )}

            {/* Badges dégradés */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <GradientBadge label={TYPE_LABELS[listing.type] || listing.type} variant="primary" />
              <GradientBadge label={listing.transaction === 'vente' ? 'À vendre' : 'À louer'} variant="secondary" />
              {docs.length > 0 && <GradientBadge label={DOC_LABELS[docs[0]] || docs[0]} variant="success" />}
            </div>

            {/* Stats en chips */}
            {stats.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {stats.map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px', background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, minWidth: 64 }}>
                    <span style={{ color: BLUE, marginBottom: 3 }}>{s.icon}</span>
                    <span style={{ fontWeight: 800, color: DARK, fontSize: 14 }}>{s.val}</span>
                    <span style={{ fontSize: 10, color: GRAY_LT, marginTop: 1 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Localisation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: GRAY, marginBottom: 6 }}>
              <IcoPin /> <span>{location}</span>
            </div>
            <p style={{ fontSize: 11, color: GRAY_LT, margin: 0 }}>
              Réf. #{refCode} · Publié le {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Description */}
          {listing.description && (
            <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '16px' : '22px 32px', border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 12px' }}>Description</h2>
              <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line' }}>
                {showFullDesc || listing.description.length <= 300 ? listing.description : listing.description.slice(0, 300) + '…'}
              </p>
              {listing.description.length > 300 && (
                <button onClick={() => setShowFullDesc(v => !v)}
                  style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 700, padding: 0 }}>
                  {showFullDesc ? 'Voir moins ↑' : 'Lire la suite ↓'}
                </button>
              )}
            </div>
          )}

          {/* Équipements */}
          {listing.amenities?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '16px' : '22px 32px', border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 12px' }}>Équipements</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {listing.amenities.map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: BG }}>
                    <IcoCheck /> {AMENITY_LABELS[a] || a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informations */}
          <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '16px' : '22px 32px', border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 14px' }}>Informations du bien</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {infoRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < infoRows.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <td style={{ padding: '9px 0', color: GRAY, fontWeight: 500, width: '45%' }}>{row.label}</td>
                    <td style={{ padding: '9px 0', color: DARK, fontWeight: 700, textAlign: 'right' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Carte */}
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
            <div style={{ padding: isMobile ? '14px 16px 12px' : '18px 32px 14px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 4px' }}>Localisation</h2>
              <p style={{ fontSize: 13, color: GRAY, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IcoPin /> {location}
              </p>
            </div>
            <iframe src={mapUrl} width="100%" height={isMobile ? 200 : 300} style={{ border: 'none', display: 'block' }} loading="lazy" title="Localisation" />
            <div style={{ padding: '10px 32px 14px', display: 'flex', justifyContent: 'flex-end' }}>
              <a href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: 'none' }}>
                Ouvrir dans Google Maps →
              </a>
            </div>
          </div>

          {/* Biens similaires */}
          {similar.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '16px' : '22px 32px', border: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 14px' }}>Biens similaires à {listing.wilaya}</h2>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
                {similar.map(s => <RecoCard key={s.id} listing={s} onClick={() => { navigate(`/listing/${s.id}`); window.scrollTo(0, 0) }} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR desktop ── */}
        {!isMobile && (
          <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

              {/* Header sidebar — dégradé Darni */}
              <div style={{ background: 'linear-gradient(135deg, #0F2D4A 0%, #1B4FD8 100%)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
                  D
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: '#fff', fontSize: 15, margin: '0 0 2px' }}>Vendeur Darni</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      <IcoCheck /> <span style={{ color: 'rgba(255,255,255,0.9)' }}>Membre vérifié</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Prix */}
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 10, color: GRAY_LT, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {listing.transaction === 'vente' ? 'Prix demandé' : 'Loyer mensuel'}
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: BLUE, margin: 0, letterSpacing: '-0.02em' }}>
                  {formatPrice(listing.price, listing.transaction)}
                </p>
              </div>

              {/* CTAs */}
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <IcoWA /> WhatsApp
                </a>
                {telLink && (
                  <a href={telLink}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 10, background: 'linear-gradient(135deg, #1B4FD8, #4F46E5)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <IcoPhone /> Appeler
                  </a>
                )}
                <button onClick={() => setSaved(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${saved ? '#FCA5A5' : BORDER}`, background: saved ? '#FEF2F2' : '#fff', color: saved ? '#EF4444' : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  <IcoHeart filled={saved} /> {saved ? 'Annonce sauvegardée' : "Sauvegarder l'annonce"}
                </button>
                <button onClick={share}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  <IcoShare /> Partager
                </button>
              </div>

              <div style={{ padding: '0 22px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: GRAY_LT, margin: 0 }}>Réf. #{refCode}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Barre CTA fixe mobile ── */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '10px 16px', display: 'flex', gap: 10, zIndex: 50, boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
          {telLink && (
            <a href={telLink} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 10, background: 'linear-gradient(135deg, #1B4FD8, #4F46E5)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <IcoPhone /> Appeler
            </a>
          )}
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 10, background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <IcoWA /> WhatsApp
          </a>
        </div>
      )}

      {/* ── Modal galerie ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'fade 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IcoCam />
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0 }}>{activePhoto + 1} / {photos.length}</p>
            </div>
            <button onClick={() => setShowModal(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0 50px' : '0 70px', position: 'relative' }}>
            <img src={photos[activePhoto]} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }} />
            {activePhoto > 0 && (
              <button onClick={() => setActivePhoto(p => p - 1)}
                style={{ position: 'absolute', left: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer', color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            {activePhoto < photos.length - 1 && (
              <button onClick={() => setActivePhoto(p => p + 1)}
                style={{ position: 'absolute', right: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: 'pointer', color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '16px 24px', overflowX: 'auto', flexShrink: 0 }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                style={{ height: 56, width: 80, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, opacity: i === activePhoto ? 1 : 0.4, border: i === activePhoto ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}