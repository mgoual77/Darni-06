import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Listing {
  id: string
  title: string
  type: string
  transaction: string
  price: number
  surface: number
  rooms: number | null
  bedrooms: number | null
  bathrooms: number | null
  wilaya: string
  commune: string | null
  quartier: string | null
  photos: any[]
  status: 'active' | 'inactive'
  created_at: string
  phone: string | null
  whatsapp: string | null
}

const BLUE    = '#1B4FD8'
const BLUE_LT = '#EEF2FF'
const GRAY    = '#6B7280'
const DARK    = '#111827'
const BORDER  = '#E5E7EB'
const BG      = '#F7F8FA'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Autre',
}

function firstPhoto(photos: any[]): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0)
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700'
  const p = photos[0]
  if (typeof p === 'string') return p
  if (p?.url) return p.url
  return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700'
}

function buildWhatsapp(raw: string | null): string {
  if (!raw) return '#'
  const d = raw.replace(/\D/g, '')
  const intl = d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d
  return `https://wa.me/${intl}`
}

// ── Icônes SVG ───────────────────────────────────────────────────────────────
const IcoBed = () => (
  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12V8a1 1 0 011-1h1m14 5V8a1 1 0 00-1-1h-1M3 12h18M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" />
  </svg>
)
const IcoBath = () => (
  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12h16M4 12V6a2 2 0 012-2h2a2 2 0 012 2v6M4 12v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
  </svg>
)
const IcoArea = () => (
  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
)
const IcoPin = () => (
  <svg width={13} height={13} fill="none" stroke={BLUE} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const IcoPhone = () => (
  <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)
const IcoWA = () => (
  <svg width={15} height={15} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)
const IcoEye = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const IcoEdit = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)
const IcoTrash = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', display: 'flex', height: 220 }}>
      <div style={{ width: 300, background: '#F3F4F6', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
      <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[45, 65, 40, 35, 55].map((w, i) => (
          <div key={i} style={{ height: i === 1 ? 22 : 13, width: `${w}%`, background: '#F3F4F6', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  )
}

// ── Modal suppression ─────────────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel, loading }: {
  title: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, textAlign: 'center', marginBottom: 10 }}>Supprimer cette annonce ?</h3>
        <p style={{ fontSize: 13, color: GRAY, textAlign: 'center', lineHeight: 1.6, marginBottom: 6 }}>Cette action est irréversible.</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: DARK, textAlign: 'center', background: BG, padding: '8px 16px', borderRadius: 8, marginBottom: 24, fontStyle: 'italic' }}>"{title}"</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onCancel} disabled={loading}
            style={{ padding: '11px 0', border: `1.5px solid ${BORDER}`, borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ padding: '11px 0', border: 'none', borderRadius: 10, background: DARK, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Suppression…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card Bayut ────────────────────────────────────────────────────────────────
function ListingCard({ listing, togglingId, onView, onEdit, onToggle, onDelete }: {
  listing: Listing; togglingId: string | null
  onView: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  const isActive   = listing.status === 'active'
  const isToggling = togglingId === listing.id
  const location   = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')
  const whatsapp   = buildWhatsapp(listing.whatsapp ?? listing.phone)
  const phoneLink  = listing.phone ? `tel:${listing.phone}` : null
  const photoCount = Array.isArray(listing.photos) ? listing.photos.length : 0

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', display: 'flex', transition: 'box-shadow 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 28px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>

      {/* Photo */}
      <div style={{ width: 300, minHeight: 220, flexShrink: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden', background: '#F3F4F6' }} onClick={onView}>
        <img src={firstPhoto(listing.photos)} alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700' }} />

        {/* Statut */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: isActive ? '#16A34A' : '#9CA3AF', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16A34A' : '#9CA3AF', display: 'inline-block' }} />
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Nb photos */}
        {photoCount > 1 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
            <svg width={11} height={11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {photoCount}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>

        {/* Haut */}
        <div>
          {/* Badges + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: BLUE_LT, padding: '3px 9px', borderRadius: 4, letterSpacing: '0.02em' }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: listing.transaction === 'vente' ? '#059669' : '#7C3AED', background: listing.transaction === 'vente' ? '#F0FDF4' : '#F5F3FF', padding: '3px 9px', borderRadius: 4 }}>
              {listing.transaction === 'vente' ? 'Vente' : 'Location'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
              {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Prix */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: DARK, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {listing.price?.toLocaleString('fr-DZ')}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: GRAY }}>
              DA{listing.transaction === 'location' ? '/mois' : ''}
            </span>
          </div>

          {/* Titre */}
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
            {listing.title}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
            {[
              listing.surface ? { icon: <IcoArea />, val: listing.surface, unit: 'm²' } : null,
              listing.bedrooms ? { icon: <IcoBed />, val: listing.bedrooms, unit: listing.bedrooms > 1 ? 'Chambres' : 'Chambre' } : null,
              listing.bathrooms ? { icon: <IcoBath />, val: listing.bathrooms, unit: 'SDB' } : null,
            ].filter(Boolean).map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#374151', fontSize: 13, paddingRight: 14, marginRight: 14, borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <span style={{ color: GRAY }}>{s!.icon}</span>
                <span style={{ fontWeight: 700, color: DARK }}>{s!.val}</span>
                <span style={{ color: GRAY }}>{s!.unit}</span>
              </div>
            ))}
          </div>

          {/* Localisation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: GRAY }}>
            <IcoPin />
            <span>{location}</span>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: `1px solid ${BORDER}`, margin: '16px 0' }} />

        {/* Bas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>

          {/* Contacts */}
          <div style={{ display: 'flex', gap: 8 }}>
            {phoneLink && (
              <a href={phoneLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                <IcoPhone /> Appeler
              </a>
            )}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1.5px solid ${BORDER}`, transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#25D366'; (e.currentTarget as HTMLElement).style.color = '#16A34A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
              <IcoWA /> WhatsApp
            </a>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Voir',     icon: <IcoEye />,   fn: onView  },
              { label: 'Modifier', icon: <IcoEdit />,  fn: onEdit  },
            ].map(a => (
              <button key={a.label} onClick={a.fn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                {a.icon} {a.label}
              </button>
            ))}

            {/* Toggle */}
            <button onClick={onToggle} disabled={isToggling}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: GRAY, fontSize: 12, fontWeight: 600, cursor: isToggling ? 'not-allowed' : 'pointer', opacity: isToggling ? 0.6 : 1, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
              {isToggling
                ? <div style={{ width: 12, height: 12, border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={isActive
                      ? 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      : 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                  </svg>
              }
              {isActive ? 'Désactiver' : 'Activer'}
            </button>

            {/* Supprimer — discret, juste une icône */}
            <button onClick={onDelete}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: GRAY, cursor: 'pointer', transition: 'all 0.15s' }}
              title="Supprimer"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; (e.currentTarget as HTMLElement).style.color = DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = GRAY; }}>
              <IcoTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesAnnonces() {
  const navigate = useNavigate()
  const [listings, setListings]     = useState<Listing[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<'all' | 'active' | 'inactive'>('all')
  const [toDelete, setToDelete]     = useState<Listing | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/'); return }
      await fetchListings(session.user.id)
    }
    init()
  }, [])

  const fetchListings = async (uid: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, type, transaction, price, surface, rooms, bedrooms, bathrooms, wilaya, commune, quartier, photos, status, created_at, phone, whatsapp')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (!error && data) setListings(data as Listing[])
    setLoading(false)
  }

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active'
    setTogglingId(listing.id)
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id)
    if (error) showToast('Erreur lors de la mise à jour', false)
    else {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l))
      showToast(newStatus === 'active' ? 'Annonce activée ✓' : 'Annonce désactivée')
    }
    setTogglingId(null)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const { error } = await supabase.from('listings').delete().eq('id', toDelete.id)
    if (error) showToast('Erreur lors de la suppression', false)
    else { setListings(prev => prev.filter(l => l.id !== toDelete.id)); showToast('Annonce supprimée') }
    setDeleting(false)
    setToDelete(null)
  }

  const filtered      = listings.filter(l => filter === 'all' ? true : l.status === filter)
  const countActive   = listings.filter(l => l.status === 'active').length
  const countInactive = listings.filter(l => l.status === 'inactive').length

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Lato, sans-serif', paddingBottom: 60 }}>
      <style>{`
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes slide { from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, background: DARK, color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', animation: 'slide 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {toDelete && (
        <DeleteModal title={toDelete.title} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={deleting} />
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: DARK, margin: 0, letterSpacing: '-0.02em' }}>Mes annonces</h1>
            <p style={{ fontSize: 13, color: GRAY, margin: '4px 0 0' }}>{listings.length} annonce{listings.length !== 1 ? 's' : ''} publiée{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/publish')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 2px 10px rgba(27,79,216,0.22)`, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Publier une annonce
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: listings.length, accent: DARK   },
            { label: 'Actives',   value: countActive,     accent: '#16A34A' },
            { label: 'Inactives', value: countInactive,   accent: GRAY   },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: s.accent, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</span>
              <span style={{ fontSize: 13, color: GRAY, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'all',      label: `Toutes (${listings.length})` },
            { key: 'active',   label: `Actives (${countActive})` },
            { key: 'inactive', label: `Inactives (${countInactive})` },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '7px 18px', borderRadius: 20, border: `1.5px solid ${filter === f.key ? BLUE : BORDER}`, background: filter === f.key ? BLUE_LT : '#fff', color: filter === f.key ? BLUE : GRAY, fontWeight: filter === f.key ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton /><Skeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 24px', background: '#fff', borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: BLUE_LT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width={28} height={28} fill="none" stroke={BLUE} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: DARK, marginBottom: 8 }}>
              {filter === 'all' ? 'Aucune annonce publiée' : `Aucune annonce ${filter === 'active' ? 'active' : 'inactive'}`}
            </p>
            <p style={{ fontSize: 14, color: GRAY, marginBottom: 24 }}>
              {filter === 'all' ? 'Publiez votre premier bien en quelques minutes.' : 'Changez de filtre pour voir vos autres annonces.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/publish')}
                style={{ padding: '11px 28px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Publier une annonce
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} togglingId={togglingId}
                onView={() => navigate(`/listing/${listing.id}`)}
                onEdit={() => navigate(`/publish?id=${listing.id}`)}
                onToggle={() => toggleStatus(listing)}
                onDelete={() => setToDelete(listing)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}