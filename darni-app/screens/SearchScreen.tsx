import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, ActivityIndicator, Dimensions,
  Linking, Modal, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { fetchVerifiedUserIds } from '../lib/verifiedSellers';

const { width } = Dimensions.get('window');
const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const GRAY_LT = '#9CA3AF';
const BORDER = '#E5E7EB'; const BG = '#F7F8FA';

const TYPES = ['Appartement', 'Villa', 'Bureau', 'Local', 'Terrain', 'Autre'];
const WILAYAS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tlemcen'];
const PRICE_RANGES = [
  { label: '< 1M DA',   min: '',         max: '1000000'  },
  { label: '1–3M DA',  min: '1000000',  max: '3000000'  },
  { label: '3–5M DA',  min: '3000000',  max: '5000000'  },
  { label: '5–10M DA', min: '5000000',  max: '10000000' },
  { label: '10–20M DA',min: '10000000', max: '20000000' },
  { label: '> 20M DA', min: '20000000', max: ''         },
];

function smartPrice(price: number, transaction?: string): string {
  if (!price) return '— DA';
  const suffix = transaction === 'location' ? '/mois' : '';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA${suffix}`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA${suffix}`;
  return price.toLocaleString('fr-DZ') + ` DA${suffix}`;
}
function firstPhoto(listing: any): string {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const photos = listing.photos;
  if (!photos || !Array.isArray(photos) || photos.length === 0) return fb;
  const p = photos[0];
  return typeof p === 'string' ? p : p?.url ?? fb;
}
function getPhotos(listing: any): string[] {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const photos = listing.photos;
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [fb];
  return photos.map((p: any) => typeof p === 'string' ? p : p?.url ?? '').filter(Boolean);
}
function isNew(created_at?: string): boolean {
  if (!created_at) return false;
  return Date.now() - new Date(created_at).getTime() < 48 * 60 * 60 * 1000;
}
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

type SortOption = 'recent' | 'prix-asc' | 'prix-desc';

/* ── Icône carte (pin + cercle, sans emoji) ── */
function MapPinIcon({ color = GRAY }: { color?: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 20, height: 22 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: color }} />
      <View style={{ width: 2.5, height: 7, backgroundColor: color, marginTop: -2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />
    </View>
  );
}

export function SearchScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();          // ← safe area Samsung

  const [listings,          setListings]          = useState<any[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [loadError,         setLoadError]         = useState('');
  const [searchText,        setSearchText]        = useState(route?.params?.q ?? '');
  const [filterTransaction, setFilterTransaction] = useState(route?.params?.type ?? '');
  const [filterType,        setFilterType]        = useState('');
  const [filterWilaya,      setFilterWilaya]      = useState('');
  const [priceMin,          setPriceMin]          = useState('');
  const [priceMax,          setPriceMax]          = useState('');
  const [sortBy,            setSortBy]            = useState<SortOption>('recent');
  const [showFilters,       setShowFilters]       = useState(false);
  const [showSort,          setShowSort]          = useState(false);
  const [savedIds,          setSavedIds]          = useState<string[]>([]);
  const [verifiedUserIds,   setVerifiedUserIds]   = useState<Set<string>>(new Set());

  const [tmpTransaction, setTmpTransaction] = useState('');
  const [tmpType,        setTmpType]        = useState('');
  const [tmpWilaya,      setTmpWilaya]      = useState('');
  const [tmpPriceMin,    setTmpPriceMin]    = useState('');
  const [tmpPriceMax,    setTmpPriceMax]    = useState('');

  const loadListings = () => {
    setLoading(true);
    setLoadError('');
    supabase.from('listings').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setLoadError("Impossible de charger les annonces. Vérifiez votre connexion."); setLoading(false); return; }
        setListings(data ?? []);
        setLoading(false);
        fetchVerifiedUserIds((data ?? []).map((l: any) => l.user_id)).then(setVerifiedUserIds);
      });
  };

  useEffect(() => { loadListings(); }, []);

  let filtered = listings;
  if (filterTransaction) filtered = filtered.filter(l => l.transaction?.toLowerCase() === filterTransaction);
  if (filterType)        filtered = filtered.filter(l => l.type?.toLowerCase() === filterType.toLowerCase());
  if (filterWilaya)      filtered = filtered.filter(l => l.wilaya?.toLowerCase().includes(filterWilaya.toLowerCase()));
  if (priceMin)          filtered = filtered.filter(l => (l.price ?? 0) >= Number(priceMin));
  if (priceMax)          filtered = filtered.filter(l => (l.price ?? 0) <= Number(priceMax));
  if (searchText.trim()) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(l =>
      l.wilaya?.toLowerCase().includes(q) || l.commune?.toLowerCase().includes(q) ||
      l.quartier?.toLowerCase().includes(q) || l.title?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q)
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'prix-asc')  return (a.price ?? 0) - (b.price ?? 0);
    if (sortBy === 'prix-desc') return (b.price ?? 0) - (a.price ?? 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeFilters = [filterTransaction, filterType, filterWilaya, priceMin || priceMax ? '1' : ''].filter(Boolean).length;

  const openFilters = () => {
    setTmpTransaction(filterTransaction); setTmpType(filterType);
    setTmpWilaya(filterWilaya); setTmpPriceMin(priceMin); setTmpPriceMax(priceMax);
    setShowFilters(true);
  };
  const applyFilters = () => {
    setFilterTransaction(tmpTransaction); setFilterType(tmpType);
    setFilterWilaya(tmpWilaya); setPriceMin(tmpPriceMin); setPriceMax(tmpPriceMax);
    setShowFilters(false);
  };
  const resetFilters = () => {
    setFilterTransaction(''); setFilterType(''); setFilterWilaya('');
    setPriceMin(''); setPriceMax('');
    setTmpTransaction(''); setTmpType(''); setTmpWilaya('');
    setTmpPriceMin(''); setTmpPriceMax('');
  };

  /* ── Navigation vers la carte avec les résultats filtrés ── */
  const goToMap = () => navigation.navigate('Map', { listings: sorted });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER — paddingTop dynamique pour Samsung */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>

        {/* Ligne 1 : Transaction */}
        <View style={styles.headerRow1}>
          <View style={styles.transactionSelect}>
            {[{ val: '', label: 'Tous' }, { val: 'vente', label: 'Vente' }, { val: 'location', label: 'Location' }].map(opt => (
              <TouchableOpacity key={opt.val}
                onPress={() => setFilterTransaction(opt.val)}
                style={[styles.transChip, filterTransaction === opt.val && styles.transChipActive]}>
                <Text style={[styles.transChipText, filterTransaction === opt.val && styles.transChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ligne 2 : Input + bouton Carte + bouton Filtres */}
        <View style={styles.headerRow2}>
          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              placeholder="Wilaya, commune, quartier..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              placeholderTextColor={GRAY_LT}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={{ color: GRAY_LT, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── NOUVEAU : bouton Vue carte ── */}
          <TouchableOpacity style={styles.mapBtn} onPress={goToMap}>
            <MapPinIcon color={BLUE} />
          </TouchableOpacity>

          {/* Filtres */}
          <TouchableOpacity
            style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
            onPress={openFilters}>
            <Text style={styles.filterBtnIcon}>⚙</Text>
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Ligne 3 : Résultats + Tri */}
        <View style={styles.headerRow3}>
          <Text style={styles.resultCount}>
            <Text style={{ fontWeight: '700', color: DARK }}>{loading ? '...' : sorted.length}</Text>
            {' '}annonce{sorted.length > 1 ? 's' : ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Lien texte carte pour rappel */}
            <TouchableOpacity onPress={goToMap} style={styles.mapTextBtn}>
              <Text style={styles.mapTextBtnText}>Vue carte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
              <Text style={styles.sortBtnText}>
                {sortBy === 'recent' ? 'Récent' : sortBy === 'prix-asc' ? 'Prix ↑' : 'Prix ↓'} ▾
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chips actifs */}
        {activeFilters > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            {filterTransaction && (
              <TouchableOpacity style={styles.chip} onPress={() => setFilterTransaction('')}>
                <Text style={styles.chipText}>{capitalize(filterTransaction)} ✕</Text>
              </TouchableOpacity>
            )}
            {filterType && (
              <TouchableOpacity style={styles.chip} onPress={() => setFilterType('')}>
                <Text style={styles.chipText}>{capitalize(filterType)} ✕</Text>
              </TouchableOpacity>
            )}
            {filterWilaya && (
              <TouchableOpacity style={styles.chip} onPress={() => setFilterWilaya('')}>
                <Text style={styles.chipText}>{filterWilaya} ✕</Text>
              </TouchableOpacity>
            )}
            {(priceMin || priceMax) && (
              <TouchableOpacity style={styles.chip} onPress={() => { setPriceMin(''); setPriceMax(''); }}>
                <Text style={styles.chipText}>{priceMin ? smartPrice(Number(priceMin)) : '0'} – {priceMax ? smartPrice(Number(priceMax)) : '∞'} ✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.clearAll}>Tout effacer</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <>
          <TouchableOpacity style={styles.sortOverlay} onPress={() => setShowSort(false)} />
          <View style={styles.sortMenu}>
            {[{ v: 'recent', l: 'Plus récent' }, { v: 'prix-asc', l: 'Prix croissant' }, { v: 'prix-desc', l: 'Prix décroissant' }].map((opt, i) => (
              <TouchableOpacity key={opt.v}
                style={[styles.sortMenuItem, i > 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}
                onPress={() => { setSortBy(opt.v as SortOption); setShowSort(false); }}>
                <Text style={[styles.sortMenuText, sortBy === opt.v && { color: BLUE, fontWeight: '700' }]}>
                  {opt.l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* LISTE */}
      {loading ? (
        <ActivityIndicator color={BLUE} size="large" style={{ marginTop: 40 }} />
      ) : loadError !== '' ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity onPress={loadListings} style={styles.retryBtn}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aucune annonce trouvée</Text>
          {activeFilters > 0 && (
            <TouchableOpacity onPress={resetFilters} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          {sorted.map(l => {
            const photos  = getPhotos(l);
            const isSaved = savedIds.includes(l.id);
            const newListing = isNew(l.created_at);
            return (
              <TouchableOpacity key={l.id} style={styles.card}
                onPress={() => navigation.navigate('ListingDetail', { listing: l })}>

                <View style={styles.photoWrap}>
                  <Image source={{ uri: photos[0] }} style={styles.photo} resizeMode="cover" />
                  <View style={styles.photoGradient} />
                  <View style={styles.photoBadges}>
                    <View style={[styles.badge, { backgroundColor: l.transaction === 'location' ? '#0369a1' : BLUE }]}>
                      <Text style={styles.badgeText}>{l.transaction === 'location' ? 'Location' : 'Vente'}</Text>
                    </View>
                    {newListing && <View style={[styles.badge, { backgroundColor: '#DC2626' }]}><Text style={styles.badgeText}>Nouveau</Text></View>}
                  </View>
                  {verifiedUserIds.has(l.user_id) && (
                    <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Vérifié</Text></View>
                  )}
                  <TouchableOpacity style={styles.saveBtn}
                    onPress={() => setSavedIds(prev => prev.includes(l.id) ? prev.filter(i => i !== l.id) : [...prev, l.id])}>
                    <Text style={{ fontSize: 16, color: isSaved ? '#EF4444' : '#fff' }}>{isSaved ? '♥' : '♡'}</Text>
                  </TouchableOpacity>
                  {photos.length > 1 && (
                    <View style={styles.photoCountBadge}>
                      <Text style={styles.photoCountText}>⊡ {photos.length}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.price}>{smartPrice(l.price, l.transaction)}</Text>
                      <Text style={styles.priceSub}>{l.transaction === 'location' ? 'Loyer mensuel' : 'Prix de vente'}</Text>
                    </View>
                  </View>
                  {l.title && <Text style={styles.cardTitle} numberOfLines={1}>{l.title}</Text>}
                  <Text style={styles.specs}>
                    {[capitalize(l.type), l.surface ? `${l.surface} m²` : null, l.bedrooms ? `${l.bedrooms} ch` : null, l.rooms ? `${l.rooms} pièces` : null].filter(Boolean).join(' · ')}
                  </Text>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationPin}>⊙</Text>
                    <Text style={styles.location} numberOfLines={1}>
                      {[l.commune, l.wilaya].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.ctaRow}>
                    <TouchableOpacity style={styles.callBtn}
                      onPress={() => { const p = l.phone ?? l.whatsapp; if (p) Linking.openURL(`tel:${p}`); }}>
                      <Text style={styles.callBtnText}>Appeler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.waBtn}
                      onPress={() => { const p = (l.whatsapp ?? l.phone ?? '').replace(/\D/g, ''); if (p) Linking.openURL(`https://wa.me/${p}`); }}>
                      <Text style={styles.waBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <View style={styles.darniProBadge}>
                      <View style={styles.darniProDot} />
                      <Text style={styles.darniProText}>Darni Pro</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* MODAL FILTRES */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={{ fontSize: 20, color: GRAY }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Transaction</Text>
              <View style={styles.filterChips}>
                {[{ val: '', label: 'Tous' }, { val: 'vente', label: 'Vente' }, { val: 'location', label: 'Location' }].map(opt => (
                  <TouchableOpacity key={opt.val} onPress={() => setTmpTransaction(opt.val)}
                    style={[styles.filterChip, tmpTransaction === opt.val && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, tmpTransaction === opt.val && styles.filterChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.filterLabel}>Type de bien</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity onPress={() => setTmpType('')}
                  style={[styles.filterChip, !tmpType && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, !tmpType && styles.filterChipTextActive]}>Tous</Text>
                </TouchableOpacity>
                {TYPES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setTmpType(t.toLowerCase())}
                    style={[styles.filterChip, tmpType === t.toLowerCase() && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, tmpType === t.toLowerCase() && styles.filterChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.filterLabel}>Wilaya</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity onPress={() => setTmpWilaya('')}
                  style={[styles.filterChip, !tmpWilaya && styles.filterChipActive]}>
                  <Text style={[styles.filterChipText, !tmpWilaya && styles.filterChipTextActive]}>Toutes</Text>
                </TouchableOpacity>
                {WILAYAS.map(w => (
                  <TouchableOpacity key={w} onPress={() => setTmpWilaya(w)}
                    style={[styles.filterChip, tmpWilaya === w && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, tmpWilaya === w && styles.filterChipTextActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.filterLabel}>Budget</Text>
              <View style={styles.budgetRow}>
                {[{ label: 'Min', val: tmpPriceMin, set: setTmpPriceMin, ph: '0' },
                  { label: 'Max', val: tmpPriceMax, set: setTmpPriceMax, ph: 'Illimité' }].map(({ label, val, set, ph }) => (
                  <View key={label} style={{ flex: 1 }}>
                    <Text style={styles.budgetLabel}>{label}</Text>
                    <TextInput value={val} onChangeText={set} placeholder={ph}
                      keyboardType="numeric" placeholderTextColor={GRAY_LT} style={styles.budgetInput} />
                  </View>
                ))}
              </View>
              <View style={styles.filterChips}>
                {PRICE_RANGES.map(s => {
                  const active = tmpPriceMin === s.min && tmpPriceMax === s.max;
                  return (
                    <TouchableOpacity key={s.label}
                      onPress={() => { setTmpPriceMin(s.min); setTmpPriceMax(s.max); }}
                      style={[styles.filterChip, active && styles.filterChipActive]}>
                      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn}
                onPress={() => { setTmpTransaction(''); setTmpType(''); setTmpWilaya(''); setTmpPriceMin(''); setTmpPriceMax(''); }}>
                <Text style={styles.resetBtnText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Voir {sorted.length} résultats</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  headerRow1: { paddingHorizontal: 16, marginBottom: 10 },
  transactionSelect: { flexDirection: 'row', gap: 6 },
  transChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER },
  transChipActive: { backgroundColor: '#EEF2FF', borderColor: BLUE },
  transChipText: { fontSize: 13, fontWeight: '500', color: GRAY },
  transChipTextActive: { color: BLUE, fontWeight: '700' },

  headerRow2: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  searchInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 10 },
  searchIcon: { fontSize: 18, color: GRAY_LT, marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: DARK, paddingVertical: 10 },

  /* ── Bouton carte — NOUVEAU ── */
  mapBtn: {
    width: 42, height: 42,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5, borderColor: BLUE,
    borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },

  filterBtn: { width: 42, height: 42, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  filterBtnActive: { backgroundColor: '#EEF2FF', borderColor: BLUE },
  filterBtnIcon: { fontSize: 18, color: GRAY },
  filterBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  headerRow3: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  resultCount: { fontSize: 13, color: GRAY },

  /* ── Lien "Vue carte" en texte ── */
  mapTextBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  mapTextBtnText: { fontSize: 11, fontWeight: '700', color: BLUE },

  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1.5, borderColor: BORDER, borderRadius: 20 },
  sortBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EEF2FF', borderRadius: 20, borderWidth: 1, borderColor: '#C7D2FE' },
  chipText: { fontSize: 12, fontWeight: '600', color: BLUE },
  clearAll: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  sortOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 },
  sortMenu: { position: 'absolute', top: 120, right: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 8, zIndex: 50, overflow: 'hidden', minWidth: 170 },
  sortMenuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  sortMenuText: { fontSize: 14, color: '#374151' },

  card: { backgroundColor: '#fff', marginBottom: 1, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  photoWrap: { position: 'relative', height: 240 },
  photo: { width: '100%', height: '100%' },
  photoGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.0)' },
  photoBadges: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  verifiedBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  saveBtn: { position: 'absolute', top: 10, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  photoCountBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  photoCountText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  cardBody: { padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  price: { fontSize: 24, fontWeight: '900', color: DARK, letterSpacing: -0.5 },
  priceSub: { fontSize: 12, color: GRAY_LT, marginTop: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 5 },
  specs: { fontSize: 13, color: GRAY, marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  locationPin: { fontSize: 13, color: GRAY_LT },
  location: { fontSize: 13, color: GRAY_LT, flex: 1 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  callBtn: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  callBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  waBtn: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#86EFAC' },
  waBtnText: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  darniProBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  darniProDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: BLUE },
  darniProText: { fontSize: 11, color: GRAY_LT, fontWeight: '500' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  errorBox:  { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 16, alignItems: 'center', gap: 10, marginTop: 20, marginHorizontal: 16 },
  errorText: { fontSize: 13, color: '#991B1B', textAlign: 'center' },
  retryBtn:  { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  retryText: { fontSize: 13, fontWeight: '700', color: '#991B1B' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 12 },
  emptyBtn: { paddingHorizontal: 22, paddingVertical: 10, backgroundColor: BLUE, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '88%' },
  modalHandle: { width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: DARK },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 16 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#EEF2FF', borderColor: BLUE },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  filterChipTextActive: { color: BLUE, fontWeight: '700' },
  budgetRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  budgetLabel: { fontSize: 12, color: GRAY_LT, marginBottom: 6 },
  budgetInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: DARK },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 20 },
  resetBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center' },
  resetBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  applyBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center' },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});