import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  user_id: string
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

// ── Design tokens alignés avec Home.tsx ─────────────────────────────────────
const BLUE    = '#1B4FD8'   // bleu principal — badges, boutons, liens
const GREEN   = '#25D366'   // WhatsApp
const DARK    = '#111827'   // texte principal, prix
const GRAY    = '#6B7280'   // texte secondaire
const GRAY_LT = '#9CA3AF'   // texte tertiaire
const BORDER  = '#E5E7EB'   // bordures
const BG      = '#F7F8FA'   // fond de page
const BLUE_LT = '#EEF2FF'   // fond badges bleus

function extractPhotos(raw: any): string[] {
  if (!raw || !Array.isArray(raw) || raw.length === 0)
    return ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']
  return raw.map((item: any) => {
    if (typeof item === 'string') return item
    if (item?.url) return item.url
    return null
  }).filter(Boolean) as string[]
}

function buildWhatsappLink(raw: string | null): string {
  if (!raw) return '#'
  const digits = raw.replace(/\D/g, '')
  if (!digits) return '#'
  const intl = digits.startsWith('213') ? digits
    : digits.startsWith('0') ? '213' + digits.slice(1)
    : '213' + digits
  return `https://wa.me/${intl}`
}

// ── Composant stat box ───────────────────────────────────────────────────────
function StatBox({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: DARK, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: GRAY, marginTop: 4, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}

// ── Composant section card ───────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: `1px solid ${BORDER}` }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{title}</h2>
      {children}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

export default function ListingDetail() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing]             = useState<Listing | null>(null)
  const [loading, setLoading]             = useState(true)
  const [activePhoto, setActivePhoto]     = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchListing = async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
      if (!error && data) setListing(data)
      setLoading(false)
    }
    fetchListing()
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BORDER}`, borderTopColor: BLUE, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!listing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: DARK, marginBottom: 8 }}>Annonce introuvable</p>
        <p style={{ color: GRAY, marginBottom: 20 }}>Cette annonce n'existe pas ou a été supprimée.</p>
        <button onClick={() => navigate('/')}
          style={{ padding: '10px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )

  const photos       = extractPhotos(listing.photos)
  const whatsappLink = buildWhatsappLink(listing.whatsapp ?? listing.phone)
  const phoneRaw     = (listing.phone || listing.whatsapp || '').replace(/\D/g, '')
  const phoneLink    = phoneRaw
    ? `tel:+${phoneRaw.startsWith('213') ? phoneRaw : '213' + (phoneRaw.startsWith('0') ? phoneRaw.slice(1) : phoneRaw)}`
    : null
  const location = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')
  const refCode  = listing.id?.slice(0, 8).toUpperCase()
  const docs     = listing.document_types?.length ? listing.document_types
    : listing.document_type ? [listing.document_type] : []

  const share = () => {
    if (navigator.share) navigator.share({ title: listing.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !') }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Lato, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: GRAY_LT, flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_LT, fontSize: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUE}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = GRAY_LT}>
            ← Retour
          </button>
          <span>›</span>
          <Link to="/" style={{ color: GRAY_LT, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = BLUE}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = GRAY_LT}>
            Accueil
          </Link>
          <span>›</span><span>{listing.wilaya}</span>
          <span>›</span><span>{TYPE_LABELS[listing.type] || listing.type}</span>
          <span>›</span>
          <span style={{ color: '#374151', fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 100px' }}>

        {/* ── Galerie ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 8, borderRadius: 16, overflow: 'hidden' }}>
            {/* Grande photo */}
            <div style={{ gridRow: '1 / 3', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => { setActivePhoto(0); setShowAllPhotos(true) }}>
              <img src={photos[0]} alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.35s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' }} />
            </div>
            {/* 4 miniatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 8 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', background: BORDER }}
                  onClick={() => { setActivePhoto(i); setShowAllPhotos(true) }}>
                  {photos[i] ? (
                    <img src={photos[i]} alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                      onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width={28} height={28} fill="none" stroke={GRAY_LT} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {i === 4 && photos.length > 5 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>+{photos.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {photos.length > 1 && (
            <button onClick={() => setShowAllPhotos(true)}
              style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
              <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Voir toutes les photos ({photos.length})
            </button>
          )}
        </div>

        {/* ── Contenu 2 colonnes ── */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── Colonne gauche ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Prix + titre + localisation */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: `1px solid ${BORDER}` }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', background: BLUE }}>
                  {TYPE_LABELS[listing.type] || listing.type}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', background: listing.transaction === 'vente' ? '#059669' : '#7C3AED' }}>
                  {listing.transaction === 'vente' ? 'Vente' : 'Location'}
                </span>
              </div>

              {/* ✅ Prix en noir comme Home — formaté intelligent */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: DARK, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {formatPrice(listing.price, listing.transaction)}
                </span>
              </div>

              {/* Titre */}
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#374151', margin: '0 0 10px', lineHeight: 1.4 }}>
                {listing.title}
              </h1>

              {/* Localisation */}
              <p style={{ fontSize: 13, color: GRAY, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width={13} height={13} fill="none" stroke={BLUE} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>

              <p style={{ fontSize: 11, color: GRAY_LT, margin: 0 }}>
                Publié le {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Stats */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Surface',        value: `${listing.surface} m²`,  show: true },
                  { label: 'Pièces',         value: listing.rooms,             show: !!listing.rooms },
                  { label: 'Chambres',       value: listing.bedrooms,          show: !!listing.bedrooms },
                  { label: 'Salles de bain', value: listing.bathrooms,         show: !!listing.bathrooms },
                  { label: 'Étage',          value: listing.floor !== null && listing.floor !== undefined ? `F${listing.floor}` : null, show: listing.floor !== null && listing.floor !== undefined },
                ].filter(s => s.show).map(s => (
                  <StatBox key={s.label} value={s.value} label={s.label} />
                ))}
              </div>
            </div>

            {/* ✅ Équipements EN PREMIER */}
            {listing.amenities?.length > 0 && (
              <Card title="Équipements">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                  {listing.amenities.map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width={11} height={11} fill="none" stroke="#16A34A" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {AMENITY_LABELS[a] || a}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ✅ Description EN SECOND */}
            {listing.description && (
              <Card title="Description">
                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>
                  {listing.description}
                </p>
              </Card>
            )}

            {/* ✅ Informations EN DERNIER */}
            <Card title="Informations">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Wilaya',       value: listing.wilaya },
                  { label: 'Commune',      value: listing.commune,   hide: !listing.commune },
                  { label: 'Quartier',     value: listing.quartier,  hide: !listing.quartier },
                  { label: 'Type de bien', value: TYPE_LABELS[listing.type] || listing.type },
                  { label: 'Transaction',  value: listing.transaction === 'vente' ? 'Vente' : 'Location' },
                ].filter(f => !f.hide).map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: 11, color: GRAY_LT, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>{f.value}</p>
                  </div>
                ))}
                {docs.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, color: GRAY_LT, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</p>
                    {docs.map(d => (
                      <p key={d} style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width={12} height={12} fill="none" stroke="#16A34A" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {DOC_LABELS[d] || d}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── Colonne droite sticky ── */}
          <div style={{ width: 316, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: 24, position: 'sticky', top: 24 }}>

              {/* Vendeur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>D</div>
                <div>
                  <p style={{ fontWeight: 700, color: DARK, fontSize: 14, margin: '0 0 2px' }}>Vendeur Darni</p>
                  <p style={{ fontSize: 11, color: GRAY_LT, margin: 0 }}>Membre vérifié</p>
                </div>
              </div>

              {/* Prix recap — ✅ noir comme Home */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, color: GRAY, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix demandé</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: DARK, margin: 0, letterSpacing: '-0.02em' }}>
                  {formatPrice(listing.price, listing.transaction)}
                </p>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* WhatsApp — CTA principal */}
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                  <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contacter sur WhatsApp
                </a>

                {/* Appeler */}
                {phoneLink && (
                  <a href={phoneLink}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 10, background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                )}

                {/* Partager */}
                <button onClick={share}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Partager l'annonce
                </button>
              </div>

              <p style={{ fontSize: 11, color: GRAY_LT, textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
                Réf. #{refCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Boutons mobiles fixes ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '10px 16px', display: 'flex', gap: 10, zIndex: 50 }}>
        {phoneLink && (
          <a href={phoneLink}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 0', borderRadius: 10, background: BLUE, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Appeler
          </a>
        )}
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 0', borderRadius: 10, background: GREEN, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* ── Modal galerie plein écran ── */}
      {showAllPhotos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexShrink: 0 }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0 }}>{activePhoto + 1} / {photos.length}</p>
            <button onClick={() => setShowAllPhotos(false)}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', position: 'relative' }}>
            <img src={photos[activePhoto]} alt=""
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
            {activePhoto > 0 && (
              <button onClick={() => setActivePhoto(p => p - 1)}
                style={{ position: 'absolute', left: 12, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            )}
            {activePhoto < photos.length - 1 && (
              <button onClick={() => setActivePhoto(p => p + 1)}
                style={{ position: 'absolute', right: 12, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '16px 20px', overflowX: 'auto', flexShrink: 0 }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                style={{ height: 64, width: 96, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, opacity: i === activePhoto ? 1 : 0.4, border: i === activePhoto ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}