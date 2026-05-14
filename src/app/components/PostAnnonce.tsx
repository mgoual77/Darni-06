import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const WILAYAS = [
  'Adrar', 'Ain Defla', 'Ain Témouchent', 'Alger', 'Annaba',
  'Batna', 'Béchar', 'Béjaïa', 'Biskra', 'Blida',
  'Bordj Bou Arréridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine',
  'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaïa',
  'Guelma', 'Illizi', 'Jijel', 'Khenchela', 'Laghouat',
  'Mascara', 'Médéa', 'Mila', 'Mostaganem', "M'Sila",
  'Naâma', 'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane',
  'Saïda', 'Sétif', 'Sidi Bel Abbès', 'Skikda', 'Souk Ahras',
  'Tamanrasset', 'Tébessa', 'Tiaret', 'Tindouf', 'Tipaza',
  'Tissemsilt', 'Tizi Ouzou', 'Tlemcen',
]

const AMENITIES = [
  { key: 'ascenseur',     label: 'Ascenseur'         },
  { key: 'parking',       label: 'Parking'            },
  { key: 'balcon',        label: 'Balcon'             },
  { key: 'terrasse',      label: 'Terrasse'           },
  { key: 'jardin',        label: 'Jardin'             },
  { key: 'piscine',       label: 'Piscine'            },
  { key: 'securite',      label: 'Sécurité / Gardien' },
  { key: 'meuble',        label: 'Meublé'             },
  { key: 'climatisation', label: 'Climatisation'      },
  { key: 'cave',          label: 'Cave / Box'         },
]

const DOCUMENT_TYPES = [
  { key: 'acte_notarie',   label: 'Acte notarié'              },
  { key: 'livret_foncier', label: 'Livret foncier'             },
  { key: 'sans_titre',     label: 'Sans titre (à régulariser)' },
]

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Bien',
}

// ✅ Formatage prix intelligent
function formatPrice(raw: string): string {
  const n = Number(raw.replace(/\s/g, ''))
  if (!n) return ''
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)} Mds DA`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M DA`
  return `${n.toLocaleString('fr-DZ')} DA`
}

interface FormState {
  description: string
  type: string
  transaction: string
  document_types: string[]  // ✅ multi-select
  price: string
  surface: string
  rooms: string
  bedrooms: string
  bathrooms: string
  floor: string
  wilaya: string
  commune: string
  quartier: string
  amenities: string[]
  phone: string
  whatsapp: string
}

const initialForm: FormState = {
  description: '', type: 'appartement', transaction: 'vente',
  document_types: [], price: '', surface: '', rooms: '', bedrooms: '',
  bathrooms: '', floor: '', wilaya: '', commune: '', quartier: '', amenities: [],
  phone: '', whatsapp: '',
}

const BLUE = '#1B4FD8'

function LimiteAtteinte({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>🔒</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Limite gratuite atteinte</h2>
      <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 6 }}>
        Vous avez atteint la limite de <strong>3 annonces gratuites</strong>.
      </p>
      <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 28 }}>
        Passez en <strong style={{ color: BLUE }}>Darni Pro</strong> pour publier en illimité.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
        <button onClick={() => navigate('/mes-annonces')}
          style={{ padding: '13px 0', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Gérer mes annonces
        </button>
        <button onClick={onBack}
          style={{ padding: '12px 0', background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          ← Retour
        </button>
      </div>
      <div style={{ marginTop: 32, background: 'linear-gradient(135deg, #1B4FD8, #7C3AED)', borderRadius: 16, padding: '20px 24px', color: '#fff', textAlign: 'left' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.8, marginBottom: 6 }}>BIENTÔT DISPONIBLE</p>
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Darni Pro ✨</p>
        <ul style={{ fontSize: 13, opacity: 0.9, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
          <li>Annonces illimitées</li>
          <li>Badge "Vendeur vérifié"</li>
          <li>Mise en vedette de vos biens</li>
          <li>Statistiques de vues</li>
        </ul>
      </div>
    </div>
  )
}

export default function PostAnnonce() {
  const { user, loading: authLoading } = useAuth()
  const navigate     = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user && !authLoading) { navigate('/'); return null }

  const [form, setForm]         = useState<FormState>(initialForm)
  const [photos, setPhotos]     = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [step, setStep]         = useState(1)
  const [limitReached, setLimitReached] = useState(false)

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // ✅ Toggle document type (multi-select)
  const toggleDocType = (key: string) =>
    setForm(prev => ({
      ...prev,
      document_types: prev.document_types.includes(key)
        ? prev.document_types.filter(d => d !== key)
        : [...prev.document_types, key],
    }))

  const toggleAmenity = (key: string) =>
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key],
    }))

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files     = Array.from(e.target.files || [])
    const remaining = 10 - photos.length
    if (files.length > remaining) { setError(`Maximum 10 photos. Tu peux encore en ajouter ${remaining}.`); return }
    setError('')
    setPhotos(prev => [...prev, ...files.slice(0, remaining)])
    setPreviews(prev => [...prev, ...files.slice(0, remaining).map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setPhotos(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  const validateStep = () => {
    setError('')
    if (step === 2 && !form.surface)      { setError('La superficie est obligatoire.'); return false }
    if (step === 3 && !form.wilaya)       { setError('La wilaya est obligatoire.'); return false }
    if (step === 4) {
      if (!form.price)        { setError('Le prix est obligatoire.'); return false }
      if (!form.phone.trim()) { setError('Le numéro de téléphone est obligatoire.'); return false }
    }
    return true
  }

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)) }

  const handleSubmit = async () => {
    if (!validateStep() || !user) return
    setLoading(true); setError('')

    try {
      const location  = form.commune.trim() || form.wilaya
      const autoTitle = `${TYPE_LABELS[form.type] || form.type} ${form.surface}m² à ${location}`

      const photoUrls: string[] = []
      for (const photo of photos) {
        const ext      = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const path     = `${user.id}/${fileName}`
        const { error: uploadError } = await supabase.storage
          .from('listing-photos').upload(path, photo, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(path)
        photoUrls.push(urlData.publicUrl)
      }

      const { error: insertError } = await supabase.from('listings').insert({
        user_id:        user.id,
        title:          autoTitle,
        description:    form.description.trim(),
        type:           form.type,
        transaction:    form.transaction,
        document_type:  form.document_types[0] || null,   // compat colonne existante
        document_types: form.document_types,               // ✅ nouvelle colonne multi
        price:          Number(form.price.replace(/\s/g, '')),
        surface:        parseFloat(form.surface),
        rooms:          form.rooms     ? parseInt(form.rooms)     : null,
        bedrooms:       form.bedrooms  ? parseInt(form.bedrooms)  : null,
        bathrooms:      form.bathrooms ? parseInt(form.bathrooms) : null,
        floor:          form.floor     ? parseInt(form.floor)     : null,
        wilaya:         form.wilaya,
        commune:        form.commune.trim()  || null,
        quartier:       form.quartier.trim() || null,
        amenities:      form.amenities,
        photos:         photoUrls,
        phone:          form.phone.trim(),
        whatsapp:       form.whatsapp.trim() || null,
        status:         'active',
      })

      if (insertError) {
        const msg = insertError.message ?? ''
        if (msg.toLowerCase().includes('limite') || msg.toLowerCase().includes('3 annonces') || insertError.code === 'P0001') {
          setLimitReached(true); return
        }
        throw insertError
      }
      navigate('/mes-annonces')
    } catch (err: unknown) {
      const msg = (err as any)?.message ?? 'Une erreur est survenue.'
      if (msg.toLowerCase().includes('limite') || msg.toLowerCase().includes('3 annonces')) {
        setLimitReached(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Type de bien', 'Caractéristiques', 'Localisation', 'Photos & Prix']

  const previewTitle = form.surface && form.wilaya
    ? `${TYPE_LABELS[form.type] || form.type} ${form.surface}m² à ${form.commune.trim() || form.wilaya}`
    : null

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Lato, sans-serif' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800">Poster une annonce</h1>
        </div>
      </div>

      {!limitReached && (
        <div className="bg-white border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-0">
              {steps.map((label, i) => {
                const n = i + 1; const done = step > n; const active = step === n
                return (
                  <div key={n} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{ background: active ? BLUE : done ? '#10b981' : '#e5e7eb', color: active || done ? 'white' : '#6b7280' }}>
                        {done ? '✓' : n}
                      </div>
                      <span className="text-xs hidden sm:block"
                        style={{ color: active ? BLUE : done ? '#10b981' : '#9ca3af', fontWeight: active ? 700 : 400 }}>
                        {label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mt-[-10px]" style={{ background: done ? '#10b981' : '#e5e7eb' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {limitReached ? <LimiteAtteinte onBack={() => setLimitReached(false)} /> : (
            <>
              {/* ─── ÉTAPE 1 ─── */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-gray-800">Type de bien</h2>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Transaction *</label>
                    <div className="flex gap-3">
                      {['vente', 'location'].map(t => (
                        <button key={t} onClick={() => set('transaction', t)}
                          className="flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all"
                          style={{ borderColor: form.transaction === t ? BLUE : '#e5e7eb', background: form.transaction === t ? '#eff4ff' : 'white', color: form.transaction === t ? BLUE : '#6b7280' }}>
                          {t === 'vente' ? '🏷️ Vente' : '🔑 Location'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Catégorie *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'appartement', label: 'Appartement', icon: '🏢' },
                        { key: 'villa',        label: 'Villa',        icon: '🏠' },
                        { key: 'bureau',       label: 'Bureau',       icon: '🏗️' },
                        { key: 'local',        label: 'Local com.',   icon: '🏪' },
                        { key: 'terrain',      label: 'Terrain',      icon: '🌿' },
                        { key: 'autre',        label: 'Autre',        icon: '📦' },
                      ].map(({ key, label, icon }) => (
                        <button key={key} onClick={() => set('type', key)}
                          className="py-3 px-2 rounded-lg border-2 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
                          style={{ borderColor: form.type === key ? BLUE : '#e5e7eb', background: form.type === key ? '#eff4ff' : 'white', color: form.type === key ? BLUE : '#6b7280' }}>
                          <span className="text-xl">{icon}</span>{label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Document multi-select */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      Type de document <span className="text-gray-400 font-normal">(plusieurs choix possibles)</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {DOCUMENT_TYPES.map(({ key, label }) => {
                        const selected = form.document_types.includes(key)
                        return (
                          <button key={key} onClick={() => toggleDocType(key)}
                            className="flex items-center gap-3 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all text-left"
                            style={{ borderColor: selected ? BLUE : '#e5e7eb', background: selected ? '#eff4ff' : 'white', color: selected ? BLUE : '#6b7280' }}>
                            {/* Checkbox visuel */}
                            <span style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? BLUE : '#d1d5db'}`, background: selected ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                              {selected && (
                                <svg width={11} height={11} fill="none" stroke="#fff" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {form.document_types.length > 0 && (
                      <p className="text-xs mt-2" style={{ color: BLUE }}>
                        ✓ {form.document_types.length} document{form.document_types.length > 1 ? 's' : ''} sélectionné{form.document_types.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Info titre auto */}
                  <div className="p-3 rounded-lg text-xs" style={{ background: '#EEF2FF', color: '#374151' }}>
                    ℹ️ Le titre sera généré automatiquement : <em>Type + superficie + localisation</em>
                    {previewTitle && (
                      <p className="mt-1 font-semibold" style={{ color: BLUE }}>Aperçu : {previewTitle}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ─── ÉTAPE 2 ─── */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-gray-800">Caractéristiques</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { field: 'surface',   label: 'Surface (m²) *', placeholder: 'Ex: 95', min: 1 },
                      { field: 'rooms',     label: 'Nb de pièces',   placeholder: 'Ex: 4',  min: 1 },
                      { field: 'bedrooms',  label: 'Chambres',       placeholder: 'Ex: 3',  min: 0 },
                      { field: 'bathrooms', label: 'Salles de bain', placeholder: 'Ex: 2',  min: 0 },
                      { field: 'floor',     label: 'Étage',          placeholder: 'Ex: 3',  min: 0 },
                    ].map(({ field, label, placeholder, min }) => (
                      <div key={field}>
                        <label className="text-sm font-semibold text-gray-600 mb-1.5 block">{label}</label>
                        <input type="number" value={form[field as keyof FormState] as string}
                          onChange={e => set(field as keyof FormState, e.target.value)}
                          placeholder={placeholder} min={min}
                          className="w-full border-2 rounded-lg px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: (form[field as keyof FormState] as string) ? BLUE : '#e5e7eb' }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">Équipements</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map(({ key, label }) => {
                        const active = form.amenities.includes(key)
                        return (
                          <button key={key} onClick={() => toggleAmenity(key)}
                            className="px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all"
                            style={{ borderColor: active ? BLUE : '#e5e7eb', background: active ? '#eff4ff' : 'white', color: active ? BLUE : '#6b7280' }}>
                            {active ? '✓ ' : ''}{label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ÉTAPE 3 ─── */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-gray-800">Localisation</h2>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Wilaya *</label>
                    <select value={form.wilaya} onChange={e => set('wilaya', e.target.value)}
                      className="w-full border-2 rounded-lg px-3 py-2.5 text-sm outline-none bg-white"
                      style={{ borderColor: form.wilaya ? BLUE : '#e5e7eb' }}>
                      <option value="">-- Sélectionner une wilaya --</option>
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Commune / Ville</label>
                    <input type="text" value={form.commune} onChange={e => set('commune', e.target.value)}
                      placeholder="Ex: Bab El Oued, Dely Brahim, Hydra..."
                      className="w-full border-2 rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: form.commune ? BLUE : '#e5e7eb' }} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                      Quartier <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <input type="text" value={form.quartier} onChange={e => set('quartier', e.target.value)}
                      placeholder="Ex: Les Pins Maritimes, Cité Djamel..."
                      className="w-full border-2 rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: form.quartier ? BLUE : '#e5e7eb' }} />
                  </div>

                  {previewTitle && (
                    <div className="p-3 rounded-lg" style={{ background: '#EEF2FF' }}>
                      <p className="text-xs text-gray-500 mb-1">Titre généré automatiquement :</p>
                      <p className="text-sm font-bold" style={{ color: BLUE }}>{previewTitle}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ÉTAPE 4 ─── */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-base font-bold text-gray-800">Photos & Prix</h2>

                  {previewTitle && (
                    <div className="p-3 rounded-lg" style={{ background: '#EEF2FF' }}>
                      <p className="text-xs text-gray-500 mb-1">Votre annonce sera publiée sous :</p>
                      <p className="text-sm font-bold" style={{ color: BLUE }}>{previewTitle}</p>
                    </div>
                  )}

                  {/* Photos */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      Photos <span className="text-gray-400 font-normal">({photos.length}/10)</span>
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} disabled={photos.length >= 10}
                      className="w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-all"
                      style={{ borderColor: photos.length >= 10 ? '#e5e7eb' : BLUE, background: photos.length >= 10 ? '#f9fafb' : '#f5f8ff', opacity: photos.length >= 10 ? 0.5 : 1 }}>
                      <svg className="w-8 h-8" fill="none" stroke={BLUE} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold" style={{ color: BLUE }}>
                        {photos.length === 0 ? 'Ajouter des photos' : "Ajouter d'autres photos"}
                      </span>
                      <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 10 photos</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                      multiple className="hidden" onChange={handlePhotos} />
                    {previews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {previews.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                            {i === 0 && <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-semibold">Principale</div>}
                            <button onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                      Prix * <span className="text-gray-400 font-normal">(en DZD)</span>
                    </label>
                    <div className="relative">
                      <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                        placeholder={form.transaction === 'location' ? 'Ex: 80000' : 'Ex: 18000000'} min="0"
                        className="w-full border-2 rounded-lg px-3 py-2.5 pr-20 text-sm outline-none"
                        style={{ borderColor: form.price ? BLUE : '#e5e7eb' }} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">
                        {form.transaction === 'location' ? 'DA/mois' : 'DA'}
                      </span>
                    </div>
                    {/* ✅ Formatage prix intelligent */}
                    {form.price && (
                      <p className="text-xs mt-1 font-semibold" style={{ color: BLUE }}>
                        ≈ {formatPrice(form.price)}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                      Téléphone * <span className="text-gray-400 font-normal">(affiché aux acheteurs)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🇩🇿</span>
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="0555 00 00 00"
                        className="w-full border-2 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: form.phone ? BLUE : '#e5e7eb' }} />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">
                      WhatsApp <span className="text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">💬</span>
                      <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                        placeholder="0555 00 00 00 (si différent du tél)"
                        className="w-full border-2 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none"
                        style={{ borderColor: form.whatsapp ? '#25D366' : '#e5e7eb' }} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                      placeholder="Décrivez votre bien : état, atouts, environnement, accès..."
                      rows={5} maxLength={2000}
                      className="w-full border-2 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ borderColor: form.description ? BLUE : '#e5e7eb' }} />
                    <p className="text-xs text-gray-400 mt-1">{form.description.length}/2000 caractères</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)} disabled={loading}
                    className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                    ← Retour
                  </button>
                )}
                {step < 4 ? (
                  <button onClick={nextStep}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: BLUE }}>
                    Suivant →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: loading ? '#93a3d1' : BLUE }}>
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Publication en cours...
                      </>
                    ) : "🚀 Publier l'annonce"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}