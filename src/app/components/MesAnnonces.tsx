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

const BLUE     = '#1B4FD8'
const BLUE_LT  = '#EEF2FF'
const GRAY     = '#6B7280'
const BORDER   = '#E5E7EB'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Autre',
}

function firstPhoto(photos: any[]): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0)
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'
  const p = photos[0]
  if (typeof p === 'string') return p
  if (p?.url) return p.url
  return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'
}

function buildWhatsapp(raw: string | null): string {
  if (!raw) return '#'
  const d = raw.replace(/\D/g, '')
  const intl = d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d
  return `https://wa.me/${intl}`
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', display: 'flex', height: 200 }}>
      <div style={{ width: 280, background: '#F3F4F6', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[60, 40, 30, 50].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w}%`, background: '#F3F4F6', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  )
}

// ── Modal suppression ────────────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel, loading }: {
  title: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width={22} height={22} fill="none" stroke="#EF4444" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: 10 }}>Supprimer cette annonce ?</h3>
        <p style={{ fontSize: 13, color: GRAY, textAlign: 'center', marginBottom: 8 }}>Cette action est irréversible.</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'center', background: '#F9FAFB', padding: '8px 16px', borderRadius: 8, marginBottom: 24 }}>"{title}"</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onCancel} disabled={loading}
            style={{ padding: '11px 0', border: `1.5px solid ${BORDER}`, borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ padding: '11px 0', border: 'none', borderRadius: 10, background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Suppression…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card annonce style Bayut ─────────────────────────────────────────────────
function ListingCard({ listing, togglingId, onView, onEdit, onToggle, onDelete }: {
  listing: Listing; togglingId: string | null
  onView: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  const isActive   = listing.status === 'active'
  const isToggling = togglingId === listing.id
  const location   = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')
  const whatsapp   = buildWhatsapp(listing.whatsapp ?? listing.phone)
  const phoneLink  = listing.phone ? `tel:${listing.phone}` : null

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', display: 'flex', transition: 'box-shadow 0.2s', cursor: 'default' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.09)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>

      {/* ── Photo ── */}
      <div style={{ width: 280, minHeight: 210, flexShrink: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden' }} onClick={onView}>
        <img src={firstPhoto(listing.photos)} alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600' }} />

        {/* Badge statut */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span style={{ background: isActive ? '#fff' : '#F3F4F6', color: isActive ? '#16A34A' : '#9CA3AF', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: `1px solid ${isActive ? '#86EFAC' : '#E5E7EB'}` }}>
            {isActive ? '● Actif' : '● Inactif'}
          </span>
        </div>

        {/* Nb photos */}
        {listing.photos?.length > 1 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {listing.photos.length}
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>

        {/* Haut */}
        <div>
          {/* Type + transaction */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: BLUE, background: BLUE_LT, padding: '3px 10px', borderRadius: 4 }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: listing.transaction === 'vente' ? '#059669' : '#7C3AED', background: listing.transaction === 'vente' ? '#F0FDF4' : '#F5F3FF', padding: '3px 10px', borderRadius: 4 }}>
              {listing.transaction === 'vente' ? 'Vente' : 'Location'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>
              {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Prix */}
          <p style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {listing.price?.toLocaleString('fr-DZ')} <span style={{ fontSize: 14, fontWeight: 500, color: GRAY }}>DA{listing.transaction === 'location' ? '/mois' : ''}</span>
          </p>

          {/* Titre */}
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            {[
              { icon: '📐', val: listing.surface, unit: 'm²' },
              listing.bedrooms ? { icon: '🛏', val: listing.bedrooms, unit: listing.bedrooms > 1 ? 'chambres' : 'chambre' } : null,
              listing.bathrooms ? { icon: '🚿', val: listing.bathrooms, unit: listing.bathrooms > 1 ? 'SDB' : 'SDB' } : null,
            ].filter(Boolean).map((s, i) => (
              <span key={i} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                {s!.icon} <strong>{s!.val}</strong> {s!.unit}
              </span>
            ))}
          </div>

          {/* Localisation */}
          <p style={{ fontSize: 13, color: GRAY, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width={13} height={13} fill="none" stroke={BLUE} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: `1px solid ${BORDER}`, margin: '14px 0' }} />

        {/* Bas — boutons contact + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>

          {/* Contacts */}
          <div style={{ display: 'flex', gap: 8 }}>
            {phoneLink && (
              <a href={phoneLink}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: 'none' }}>
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler
              </a>
            )}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#F0FDF4', color: '#16A34A', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #86EFAC' }}>
              <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Actions propriétaire */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onView}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
              <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Voir
            </button>

            <button onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
              <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>

            <button onClick={onToggle} disabled={isToggling}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${isActive ? '#FCA5A5' : '#86EFAC'}`, borderRadius: 8, background: isActive ? '#FEF2F2' : '#F0FDF4', color: isActive ? '#DC2626' : '#16A34A', fontSize: 12, fontWeight: 600, cursor: isToggling ? 'not-allowed' : 'pointer', opacity: isToggling ? 0.6 : 1 }}>
              {isToggling
                ? <div style={{ width: 11, height: 11, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : null}
              {isActive ? 'Désactiver' : 'Activer'}
            </button>

            <button onClick={onDelete}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #FCA5A5', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}>
              <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
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
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'Lato, sans-serif', paddingBottom: 60 }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }
        @keyframes slide { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, background: toast.ok ? '#111827' : '#EF4444', color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', animation: 'slide 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {toDelete && (
        <DeleteModal title={toDelete.title} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={deleting} />
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>Mes annonces</h1>
            <p style={{ fontSize: 13, color: GRAY, margin: '4px 0 0' }}>{listings.length} annonce{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/publish')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 10px rgba(27,79,216,0.25)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Publier une annonce
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total',     value: listings.length, color: '#111827', border: BORDER,     bg: '#fff' },
            { label: 'Actives',   value: countActive,     color: '#16A34A', border: '#86EFAC',  bg: '#F0FDF4' },
            { label: 'Inactives', value: countInactive,   color: '#6B7280', border: BORDER,     bg: '#fff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <p style={{ fontSize: 36, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 14, color: GRAY, margin: 0, fontWeight: 500 }}>{s.label}</p>
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
              style={{ padding: '8px 20px', borderRadius: 20, border: `1.5px solid ${filter === f.key ? BLUE : BORDER}`, background: filter === f.key ? BLUE_LT : '#fff', color: filter === f.key ? BLUE : GRAY, fontWeight: filter === f.key ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(2)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: BLUE_LT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width={30} height={30} fill="none" stroke={BLUE} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {filter === 'all' ? 'Aucune annonce publiée' : `Aucune annonce ${filter === 'active' ? 'active' : 'inactive'}`}
            </p>
            <p style={{ fontSize: 14, color: GRAY, marginBottom: 24 }}>
              {filter === 'all' ? 'Publiez votre premier bien en quelques minutes.' : 'Changez de filtre pour voir vos autres annonces.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/publish')}
                style={{ padding: '12px 28px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
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