import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
  status: string
  created_at: string
  user_id: string
}

const AMENITY_LABELS: Record<string, string> = {
  ascenseur: 'Ascenseur',
  parking: 'Parking',
  balcon: 'Balcon',
  terrasse: 'Terrasse',
  jardin: 'Jardin',
  piscine: 'Piscine',
  securite: 'Sécurité / Gardien',
  meuble: 'Meublé',
  climatisation: 'Climatisation',
  cave: 'Cave / Box',
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement',
  villa: 'Villa',
  bureau: 'Bureau',
  local: 'Local commercial',
  terrain: 'Terrain',
  autre: 'Autre',
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  const BLUE = '#1B4FD8'

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) setListing(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Lato, sans-serif' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement de l'annonce...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'Lato, sans-serif' }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-2">Annonce introuvable</p>
          <p className="text-gray-500 mb-4">Cette annonce n'existe pas ou a été supprimée.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 rounded-lg text-white text-sm font-bold" style={{ background: BLUE }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  const photos = listing.photos?.length ? listing.photos : [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  ]

  const whatsappNumber = listing.whatsapp?.replace(/\D/g, '') || listing.phone?.replace(/\D/g, '') || ''
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.startsWith('213') ? whatsappNumber : '213' + whatsappNumber}`
    : '#'

  const location = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ')

  const formatPrice = (p: number) => p.toLocaleString('fr-DZ') + ' DA'

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: listing.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié !')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Lato, sans-serif' }}>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-blue-600 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <span>›</span>
          <Link to="/" className="hover:text-blue-600 transition">Accueil</Link>
          <span>›</span>
          <span className="hover:text-blue-600 cursor-pointer">{listing.wilaya}</span>
          <span>›</span>
          <span className="hover:text-blue-600 cursor-pointer">{TYPE_LABELS[listing.type] || listing.type}</span>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ─── GALERIE ─── */}
        <div className="mb-6">
          {/* Desktop galerie */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-xl overflow-hidden">
            {/* Grande photo */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:brightness-90 transition"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>
            {/* Miniatures */}
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => { setActivePhoto(i); setShowAllPhotos(true) }}
              >
                {photos[i] ? (
                  <img
                    src={photos[i]}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:brightness-90 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {i === 4 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{photos.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile galerie slider */}
          <div className="md:hidden relative rounded-xl overflow-hidden h-64">
            <img
              src={photos[activePhoto]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {activePhoto + 1}/{photos.length}
            </div>
            {activePhoto > 0 && (
              <button
                onClick={() => setActivePhoto(p => p - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow"
              >
                ‹
              </button>
            )}
            {activePhoto < photos.length - 1 && (
              <button
                onClick={() => setActivePhoto(p => p + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow"
              >
                ›
              </button>
            )}
          </div>

          {/* Bouton voir toutes les photos */}
          {photos.length > 1 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="mt-2 text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: BLUE }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Voir toutes les photos ({photos.length})
            </button>
          )}
        </div>

        {/* ─── CONTENU 2 COLONNES ─── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Colonne gauche */}
          <div className="flex-1 space-y-4">

            {/* Prix + titre */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <p className="text-3xl font-black" style={{ color: BLUE }}>
                    {formatPrice(listing.price)}
                    {listing.transaction === 'location' && (
                      <span className="text-base font-normal text-gray-500 ml-1">/mois</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: BLUE }}>
                    {TYPE_LABELS[listing.type] || listing.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: listing.transaction === 'vente' ? '#059669' : '#7c3aed' }}>
                    {listing.transaction === 'vente' ? 'Vente' : 'Location'}
                  </span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{listing.title}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Publié le {new Date(listing.created_at).toLocaleDateString('fr-DZ')}
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 mb-1" fill="none" stroke={BLUE} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span className="text-lg font-black" style={{ color: BLUE }}>{listing.surface}</span>
                  <span className="text-xs text-gray-500">m² Surface</span>
                </div>
                {listing.rooms && (
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke={BLUE} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-lg font-black" style={{ color: BLUE }}>{listing.rooms}</span>
                    <span className="text-xs text-gray-500">Pièces</span>
                  </div>
                )}
                {listing.bedrooms && (
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke={BLUE} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-lg font-black" style={{ color: BLUE }}>{listing.bedrooms}</span>
                    <span className="text-xs text-gray-500">Chambres</span>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 mb-1" fill="none" stroke={BLUE} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h.01M8 11h.01M12 7h.01M12 11h.01M16 7h.01M16 11h.01M3 5h18M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5" />
                    </svg>
                    <span className="text-lg font-black" style={{ color: BLUE }}>{listing.bathrooms}</span>
                    <span className="text-xs text-gray-500">Salles de bain</span>
                  </div>
                )}
                {listing.floor !== null && listing.floor !== undefined && (
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-lg font-black" style={{ color: BLUE }}>F{listing.floor}</span>
                    <span className="text-xs text-gray-500">Étage</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h2 className="text-base font-bold text-gray-800 mb-3">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Équipements */}
            {listing.amenities?.length > 0 && (
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <h2 className="text-base font-bold text-gray-800 mb-3">Équipements</h2>
                <div className="grid grid-cols-2 gap-2">
                  {listing.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>
                      {AMENITY_LABELS[a] || a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <h2 className="text-base font-bold text-gray-800 mb-3">Informations</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Wilaya</p>
                  <p className="font-semibold text-gray-700">{listing.wilaya}</p>
                </div>
                {listing.commune && (
                  <div>
                    <p className="text-gray-400 text-xs">Commune</p>
                    <p className="font-semibold text-gray-700">{listing.commune}</p>
                  </div>
                )}
                {listing.quartier && (
                  <div>
                    <p className="text-gray-400 text-xs">Quartier</p>
                    <p className="font-semibold text-gray-700">{listing.quartier}</p>
                  </div>
                )}
                {listing.document_type && (
                  <div>
                    <p className="text-gray-400 text-xs">Document</p>
                    <p className="font-semibold text-gray-700">{listing.document_type}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs">Type</p>
                  <p className="font-semibold text-gray-700">{TYPE_LABELS[listing.type] || listing.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Transaction</p>
                  <p className="font-semibold text-gray-700 capitalize">{listing.transaction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Colonne droite (sticky) ─── */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border p-5 md:sticky md:top-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: BLUE }}>
                  D
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Vendeur Darni</p>
                  <p className="text-xs text-gray-400">Membre Darni</p>
                </div>
              </div>

              <div className="space-y-3">
                {(listing.phone || listing.whatsapp) && (
                  <a
                    href={`tel:${listing.phone || listing.whatsapp}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                    style={{ background: BLUE }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                )}

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>

                <button
                  onClick={share}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 text-gray-600 font-bold text-sm transition hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Partager
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Réf. annonce #{listing.id?.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Boutons mobile fixés en bas ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 z-50">
        {(listing.phone || listing.whatsapp) && (
          <a
            href={`tel:${listing.phone || listing.whatsapp}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: BLUE }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Appeler
          </a>
        )}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
          style={{ background: '#25D366' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>

      {/* ─── Modal toutes les photos ─── */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <p className="text-white font-semibold">{activePhoto + 1} / {photos.length}</p>
            <button onClick={() => setShowAllPhotos(false)} className="text-white text-2xl hover:text-gray-300">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <img src={photos[activePhoto]} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
          </div>
          <div className="flex gap-2 p-4 overflow-x-auto">
            {photos.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                onClick={() => setActivePhoto(i)}
                className="h-16 w-24 object-cover rounded cursor-pointer shrink-0 transition"
                style={{ opacity: i === activePhoto ? 1 : 0.5, border: i === activePhoto ? '2px solid white' : 'none' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}