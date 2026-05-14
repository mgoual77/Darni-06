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
  wilaya: string
  commune: string | null
  photos: any[]
  status: 'active' | 'inactive'
  created_at: string
}

const BLUE  = '#1B4FD8'
const GREEN = '#16A34A'

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  villa:       'Villa',
  bureau:      'Bureau',
  local:       'Local commercial',
  terrain:     'Terrain',
  autre:       'Autre',
}

function firstPhoto(photos: any[]): string {
  if (!photos || !Array.isArray(photos) || photos.length === 0)
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
  const p = photos[0]
  if (typeof p === 'string') return p
  if (p?.url) return p.url
  return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', height: 140 }}>
      <div style={{ width: 180, flexShrink: 0, background: '#F3F4F6', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 16, width: '60%', background: '#F3F4F6', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '40%', background: '#F3F4F6', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '30%', background: '#F3F4F6', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function DeleteModal({ listing, onConfirm, onCancel, deleting }: {
  listing: Listing; onConfirm: () => void; onCancel: () => void; deleting: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width={26} height={26} fill="none" stroke="#EF4444" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: 8 }}>Supprimer l'annonce ?</h2>
        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>Vous êtes sur le point de supprimer :</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', textAlign: 'center', background: '#F9FAFB', padding: '10px 16px', borderRadius: 10, marginBottom: 12 }}>"{listing.title}"</p>
        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 }}>Cette action est irréversible.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={onCancel} disabled={deleting}
            style={{ padding: '12px 0', border: '1.5px solid #E5E7EB', borderRadius: 12, background: '#fff', color: '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ padding: '12px 0', border: 'none', borderRadius: 12, background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {deleting ? (
              <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Suppression…</>
            ) : 'Oui, supprimer'}
          </button>
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
      // ✅ getSession au lieu de getUser
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
      .select('id, title, type, transaction, price, surface, wilaya, commune, photos, status, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (!error && data) setListings(data as Listing[])
    else console.error('Erreur fetch listings:', error)
    setLoading(false)
  }

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleStatus = async (listing: Listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active'
    setTogglingId(listing.id)
    const { error } = await supabase
      .from('listings').update({ status: newStatus }).eq('id', listing.id)
    if (error) {
      showToast('Erreur lors de la mise à jour', false)
    } else {
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l))
      showToast(newStatus === 'active' ? 'Annonce activée ✓' : 'Annonce désactivée')
    }
    setTogglingId(null)
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const { error } = await supabase.from('listings').delete().eq('id', toDelete.id)
    if (error) {
      showToast('Erreur lors de la suppression', false)
    } else {
      setListings(prev => prev.filter(l => l.id !== toDelete.id))
      showToast('Annonce supprimée')
    }
    setDeleting(false)
    setToDelete(null)
  }

  const filtered      = listings.filter(l => filter === 'all' ? true : l.status === filter)
  const countActive   = listings.filter(l => l.status === 'active').length
  const countInactive = listings.filter(l => l.status === 'inactive').length

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: 'Lato, sans-serif', paddingBottom: 60 }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 300, background: toast.ok ? '#111827' : '#EF4444', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'slideIn 0.25s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Modal suppression */}
      {toDelete && (
        <DeleteModal listing={toDelete} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} deleting={deleting} />
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Mes annonces</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '4px 0 0' }}>
              {listings.length} annonce{listings.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <button onClick={() => navigate('/publish')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Publier une annonce
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: listings.length, color: '#6B7280', bg: '#F9FAFB' },
            { label: 'Actives',   value: countActive,     color: GREEN,     bg: '#F0FDF4' },
            { label: 'Inactives', value: countInactive,   color: '#EF4444', bg: '#FEF2F2' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: '16px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0' }}>{s.label}</p>
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
              style={{ padding: '8px 18px', borderRadius: 20, border: '1.5px solid', borderColor: filter === f.key ? BLUE : '#E5E7EB', background: filter === f.key ? '#EEF2FF' : '#fff', color: filter === f.key ? BLUE : '#6B7280', fontWeight: filter === f.key ? 700 : 500, fontSize: 13, cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width={36} height={36} fill="none" stroke={BLUE} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {filter === 'all' ? 'Aucune annonce publiée' : `Aucune annonce ${filter === 'active' ? 'active' : 'inactive'}`}
            </p>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
              {filter === 'all' ? 'Publiez votre premier bien en quelques minutes.' : 'Changez le filtre pour voir vos autres annonces.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/publish')}
                style={{ padding: '12px 28px', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Publier une annonce
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                togglingId={togglingId}
                onView={() => navigate(`/listing/${listing.id}`)}
                onEdit={() => navigate(`/publish?id=${listing.id}`)}
                onToggle={() => toggleStatus(listing)}
                onDelete={() => setToDelete(listing)}
              />
            ))}
          </div>
        )}
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
  const location   = [listing.commune, listing.wilaya].filter(Boolean).join(', ')

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>

      {/* Photo */}
      <div style={{ width: 180, flexShrink: 0, position: 'relative', cursor: 'pointer' }} onClick={onView}>
        <img src={firstPhoto(listing.photos)} alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' }} />
        <span style={{ position: 'absolute', top: 8, left: 8, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#fff', background: isActive ? GREEN : '#9CA3AF' }}>
          {isActive ? '● Actif' : '● Inactif'}
        </span>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1B4FD8', background: '#EEF2FF', padding: '2px 8px', borderRadius: 6 }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: listing.transaction === 'vente' ? '#059669' : '#7C3AED', background: listing.transaction === 'vente' ? '#F0FDF4' : '#F5F3FF', padding: '2px 8px', borderRadius: 6 }}>
              {listing.transaction === 'vente' ? 'Vente' : 'Location'}
            </span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 2px' }}>
            📍 {location} · {listing.surface} m²
          </p>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#1B4FD8', margin: '4px 0 0' }}>
            {listing.price?.toLocaleString('fr-DZ')} DA
            {listing.transaction === 'location' && <span style={{ fontSize: 12, fontWeight: 400, color: '#9CA3AF', marginLeft: 4 }}>/mois</span>}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={onView}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
            <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Voir
          </button>

          <button onClick={onEdit}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
            <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier
          </button>

          <button onClick={onToggle} disabled={isToggling}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid', borderColor: isActive ? '#FCA5A5' : '#86EFAC', borderRadius: 8, background: isActive ? '#FEF2F2' : '#F0FDF4', color: isActive ? '#DC2626' : '#16A34A', fontSize: 12, fontWeight: 600, cursor: isToggling ? 'not-allowed' : 'pointer', opacity: isToggling ? 0.6 : 1 }}>
            {isToggling
              ? <div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isActive ? 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' : 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                </svg>
            }
            {isActive ? 'Désactiver' : 'Activer'}
          </button>

          <button onClick={onDelete}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid #FCA5A5', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}>
            <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      {/* Date */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap' }}>
          {new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <p style={{ fontSize: 10, color: '#D1D5DB', margin: '2px 0 0' }}>Publication</p>
      </div>
    </div>
  )
}