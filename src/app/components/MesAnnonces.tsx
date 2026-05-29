import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../utils/formatPrice'

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

function DeleteModal({ title, onConfirm, onCancel, loading }: {
  title: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, textAlign: 'center', marginBottom: 10 }}>Supprimer cette annonce ?</h3>
        <p style={{ fontSize: 13, color: GRAY, textAlign: 'center', marginBottom: 6 }}>Cette action est irréversible.</p>
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
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', color: isActive ? '#16A34A' : '#9CA3AF', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16A34A' : '#9CA3AF', display: 'inline-block' }} />
            {isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>
        {photoCount > 1 && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
            📷 {photoCount}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, background: BLUE_LT, padding: '3px 9px', borderRadius: 4 }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: listing.transaction === 'vente' ? '#059669' : '#7C3AED', background: listing.transaction === 'vente' ? '#F0FDF4' : '#F5F3FF', padding: '3px 9px', borderRadius: 4 }}>
              {listing.transaction === 'vente' ? 'Vente' : 'Location'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
              {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* ✅ Prix formaté */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: DARK, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatPrice(listing.price, listing.transaction)}
            </span>
          </div>

          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
            {[
              listing.surface ? { val: listing.surface, unit: 'm²' }       : null,
              listing.bedrooms ? { val: listing.bedrooms, unit: 'ch.' }     : null,
              listing.bathrooms ? { val: listing.bathrooms, unit: 'SDB' }   : null,
            ].filter(Boolean).map((s, i, arr) => (
              <span key={i} style={{ fontSize: 13, color: '#374151', paddingRight: 12, marginRight: 12, borderRight: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <strong style={{ color: DARK }}>{s!.val}</strong> {s!.unit}
              </span>
            ))}
          </div>

          <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>📍 {location}</p>
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {phoneLink && (
              <a href={phoneLink}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                Appeler
              </a>
            )}
            <a href={whatsapp} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1.5px solid ${BORDER}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#25D366'; (e.currentTarget as HTMLElement).style.color = '#16A34A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
              WhatsApp
            </a>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'Voir',     fn: onView },
              { label: 'Modifier', fn: onEdit },
            ].map(a => (
              <button key={a.label} onClick={a.fn}
                style={{ padding: '7px 13px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                {a.label}
              </button>
            ))}

            <button onClick={onToggle} disabled={isToggling}
              style={{ padding: '7px 13px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: GRAY, fontSize: 12, fontWeight: 600, cursor: isToggling ? 'not-allowed' : 'pointer', opacity: isToggling ? 0.6 : 1 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = BG}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
              {isToggling
                ? <div style={{ width: 12, height: 12, border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : isActive ? 'Désactiver' : 'Activer'}
            </button>

            <button onClick={onDelete}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#fff', color: GRAY, cursor: 'pointer' }}
              title="Supprimer"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; (e.currentTarget as HTMLElement).style.color = DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = GRAY; }}>
              <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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

      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, background: DARK, color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', animation: 'slide 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

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
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            + Publier une annonce
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: listings.length, accent: DARK },
            { label: 'Actives',   value: countActive,     accent: '#16A34A' },
            { label: 'Inactives', value: countInactive,   accent: GRAY },
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
              style={{ padding: '7px 18px', borderRadius: 20, border: `1.5px solid ${filter === f.key ? BLUE : BORDER}`, background: filter === f.key ? BLUE_LT : '#fff', color: filter === f.key ? BLUE : GRAY, fontWeight: filter === f.key ? 700 : 500, fontSize: 13, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
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