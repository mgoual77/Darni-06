/**
 * HomeScreen.tsx — Darni
 * Dépendances : react-native-safe-area-context, react-native-google-places-autocomplete
 * Image skyline : darni-app/assets/skyline-alger.png
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator,
  Dimensions, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { supabase } from '../lib/supabase';

const { width: W } = Dimensions.get('window');
const BLUE     = '#1B4FD8';
const DARK     = '#111827';
const GRAY     = '#6B7280';
const GRAY_LT  = '#9CA3AF';
const BORDER   = '#E5E7EB';
const BG       = '#F7F8FA';
const GOOGLE_KEY = 'AIzaSyCbCrbbocArzRzzr0MYohUw6h0goJEhKlc';

const WILAYAS   = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif'];
const HERO_TABS = ['Propriétés', 'Nouveaux', 'Agences'];

const RECENT_SEARCHES = [
  { id: '1', location: 'Alger Centre', type: 'Appartement', filters: '2-3 pièces · Vente' },
  { id: '2', location: 'Hydra, Alger', type: 'Villa',       filters: '5+ pièces · Vente'  },
  { id: '3', location: 'Oran',         type: 'Appartement', filters: 'Location'            },
];

function smartPrice(price: number, transaction?: string): string {
  if (!price) return '— DA';
  const s = transaction === 'location' ? '/mois' : '';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA${s}`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA${s}`;
  return price.toLocaleString('fr-DZ') + ` DA${s}`;
}

function firstPhoto(listing: any): string {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  const p = listing.photos;
  if (!p || !Array.isArray(p) || p.length === 0) return fb;
  return typeof p[0] === 'string' ? p[0] : (p[0]?.url ?? fb);
}

export function HomeScreen({ navigation }: any) {
  const insets    = useSafeAreaInsets();
  const placesRef = useRef<any>(null);

  const [listings,      setListings]      = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [searchType,    setSearchType]    = useState<'vente' | 'location'>('vente');
  const [activeWilaya,  setActiveWilaya]  = useState('Alger');
  const [heroTab,       setHeroTab]       = useState('Propriétés');

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setListings(data ?? []); setLoading(false); });
  }, []);

  const featured = listings.filter(l => l.is_featured).slice(0, 8);
  const byWilaya = listings
    .filter(l => l.wilaya?.toLowerCase().includes(activeWilaya.toLowerCase()))
    .slice(0, 4);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Logo — fond blanc fixe au-dessus du scroll */}
      <View style={[styles.logoHeader, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.logoText}>darni</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Skyline PNG full-width */}
        <Image
          source={{ uri: 'https://etcuelnixtwuazyfmnvm.supabase.co/storage/v1/object/public/listing-photos/file_00000000f80071f4a44b52ee2ba5d079.png' }}
          style={{ width: W, height: 165 }}
          resizeMode="cover"
        />

        {/* Search card — zIndex élevé pour le dropdown autocomplete */}
        <View style={{ zIndex: 999, elevation: 999 }}>
          <View style={styles.searchCard}>

            {/* Tabs */}
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
              keyboardShouldPersistTaps="handled"
            >
              {HERO_TABS.map(tab => (
                <TouchableOpacity
                  key={tab} onPress={() => setHeroTab(tab)}
                  style={[styles.tab, heroTab === tab && styles.tabActive]}
                >
                  <Text style={[styles.tabText, heroTab === tab && styles.tabTextActive]}>{tab}</Text>
                  {tab === 'Nouveaux' && (
                    <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Toggle Acheter / Louer */}
            <View style={styles.toggleRow}>
              {[{ val: 'vente', label: 'Acheter' }, { val: 'location', label: 'Louer' }].map(opt => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setSearchType(opt.val as 'vente' | 'location')}
                  style={[styles.toggleBtn, searchType === opt.val && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, searchType === opt.val && styles.toggleTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Google Places autocomplete */}
            <GooglePlacesAutocomplete
              ref={placesRef}
              placeholder="Ville, quartier, ou wilaya..."
              onPress={(data) => setSelectedPlace(data.description)}
              query={{ key: GOOGLE_KEY, language: 'fr', components: 'country:dz' }}
              fetchDetails={false}
              enablePoweredByContainer={false}
              minLength={2}
              debounce={300}
              keepResultsAfterBlur={false}
              renderLeftButton={() => (
                <Text style={{ fontSize: 16, color: GRAY_LT, marginRight: 6, alignSelf: 'center' }}>⌕</Text>
              )}
              styles={{
                container: { flex: 0, marginBottom: 10, zIndex: 999 },
                textInputContainer: {
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1.5, borderColor: BORDER, borderRadius: 10,
                  paddingHorizontal: 12,
                },
                textInput: {
                  flex: 1, fontSize: 14, color: DARK,
                  backgroundColor: 'transparent', height: 44,
                  marginLeft: 0, paddingHorizontal: 0,
                },
                listView: {
                  backgroundColor: '#fff', borderRadius: 10,
                  borderWidth: 1, borderColor: BORDER, marginTop: 4,
                  elevation: 999, zIndex: 999,
                  shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
                },
                row: { paddingHorizontal: 12, paddingVertical: 12 },
                description: { fontSize: 14, color: DARK },
                separator: { backgroundColor: BORDER, height: 1 },
                poweredContainer: { display: 'none' },
              }}
            />

            {/* Bouton Rechercher */}
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => navigation.navigate('Recherche', { q: selectedPlace, type: searchType })}
            >
              <Text style={styles.searchBtnText}>Rechercher</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={{ paddingTop: 24 }}>

          {/* Recherches récentes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recherches récentes</Text>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 12, paddingRight: 16, marginTop: 12 }}
            >
              {RECENT_SEARCHES.map(s => (
                <TouchableOpacity
                  key={s.id} style={styles.recentCard}
                  onPress={() => navigation.navigate('Recherche', { q: s.location })}
                >
                  <View style={styles.recentThumb} />
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.recentLocation}>{s.location}</Text>
                    <Text style={styles.recentType}>{s.type}</Text>
                    {!!s.filters && (
                      <View style={styles.recentFilterRow}>
                        <View style={styles.recentFilterBadge}>
                          <Text style={styles.recentFilterText}>{s.filters}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Biens en vedette */}
          {featured.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Biens en vedette</Text>
                  <Text style={styles.sectionSub}>Les meilleures opportunités sélectionnées</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Recherche', {})}>
                  <Text style={styles.seeAll}>Voir tout</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: 14, paddingRight: 16 }}
              >
                {featured.map(l => (
                  <TouchableOpacity key={l.id} style={styles.featuredCard}
                    onPress={() => navigation.navigate('ListingDetail', { listing: l })}>
                    <View style={{ position: 'relative', height: 160 }}>
                      <Image source={{ uri: firstPhoto(l) }} style={styles.featuredImage} resizeMode="cover" />
                      <View style={styles.featuredGradient} />
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>
                          {l.transaction === 'location' ? 'Location' : 'Vente'}
                        </Text>
                      </View>
                      <View style={styles.featuredPriceRow}>
                        <Text style={styles.featuredPrice}>{smartPrice(l.price)}</Text>
                        <View style={styles.darniDot}><Text style={styles.darniDotText}>D</Text></View>
                      </View>
                    </View>
                    <View style={styles.featuredContent}>
                      <Text style={styles.featuredType}>{l.type?.charAt(0).toUpperCase() + l.type?.slice(1)}</Text>
                      <Text style={styles.featuredLocation} numberOfLines={1}>
                        {[l.commune, l.wilaya].filter(Boolean).join(', ')}
                      </Text>
                      {(l.surface || l.bedrooms) && (
                        <Text style={styles.featuredSpecs}>
                          {[l.surface ? `${l.surface} m²` : null, l.bedrooms ? `${l.bedrooms} ch` : null]
                            .filter(Boolean).join(' · ')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* CTA Vendeur */}
          <TouchableOpacity style={styles.ctaBanner} onPress={() => navigation.navigate('Publier')}>
            <View style={{ flex: 1 }}>
              <View style={styles.ctaNewBadge}><Text style={styles.ctaNewText}>NOUVEAU</Text></View>
              <Text style={styles.ctaTitle}>Vendez ou louez{'\n'}avec confiance</Text>
              <Text style={styles.ctaSub}>Des milliers d'acheteurs vérifient Darni chaque jour</Text>
            </View>
            <View style={styles.ctaArrow}>
              <Text style={{ color: '#00513F', fontSize: 20, fontWeight: '700' }}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Parcourir par wilaya */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Parcourir en Algérie</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Recherche', {})}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.wilayaTabs}
            >
              {WILAYAS.map(w => (
                <TouchableOpacity key={w} onPress={() => setActiveWilaya(w)}
                  style={[styles.wilayaTab, activeWilaya === w && styles.wilayaTabActive]}>
                  <Text style={[styles.wilayaTabText, activeWilaya === w && styles.wilayaTabTextActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {loading ? (
              <ActivityIndicator color={BLUE} size="large" style={{ marginTop: 20 }} />
            ) : byWilaya.length === 0 ? (
              <Text style={styles.emptyText}>Aucun bien à {activeWilaya} pour le moment.</Text>
            ) : (
              <View style={styles.grid}>
                {byWilaya.map(l => (
                  <TouchableOpacity key={l.id} style={styles.gridCard}
                    onPress={() => navigation.navigate('ListingDetail', { listing: l })}>
                    <View style={{ position: 'relative', height: 130 }}>
                      <Image source={{ uri: firstPhoto(l) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      <View style={styles.gridBadge}>
                        <Text style={styles.gridBadgeText}>{l.transaction === 'location' ? 'Location' : 'Vente'}</Text>
                      </View>
                    </View>
                    <View style={{ padding: 10 }}>
                      <Text style={styles.gridPrice}>{smartPrice(l.price)}</Text>
                      <Text style={styles.gridType}>{l.type?.charAt(0).toUpperCase() + l.type?.slice(1)}</Text>
                      <Text style={styles.gridLocation} numberOfLines={1}>{l.commune ?? l.wilaya}</Text>
                      {(l.surface || l.bedrooms) && (
                        <Text style={styles.gridSpecs}>
                          {[l.surface ? `${l.surface} m²` : null, l.bedrooms ? `${l.bedrooms} ch` : null]
                            .filter(Boolean).join(' · ')}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.seeAllBtn}
              onPress={() => navigation.navigate('Recherche', { q: activeWilaya })}>
              <Text style={styles.seeAllBtnText}>Voir tous les biens à {activeWilaya} →</Text>
            </TouchableOpacity>
          </View>

          {/* Banner agents — navigue vers AgentsScreen */}
          <TouchableOpacity
            style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 8 }}
            onPress={() => navigation.navigate('Agences')}
          >
            <View style={styles.agenceBanner}>
              <View style={{ flexDirection: 'row' }}>
                {['#4A90D9', '#E8A87C', '#7BB8A0', '#D4789C'].map((color, i) => (
                  <View key={i} style={[styles.agenceAvatar, { backgroundColor: color, marginLeft: i === 0 ? 0 : -10 }]}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                  </View>
                ))}
                <View style={[styles.agenceAvatar, { backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: -10 }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>+48</Text>
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.agenceTitle}>Trouvez un agent de confiance</Text>
                <Text style={styles.agenceSub}>Des agents vérifiés dans toute l'Algérie</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 20 }}>›</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoHeader:   { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  logoText:     { fontSize: 28, fontWeight: '900', color: BLUE, letterSpacing: -1 },

  searchCard:   { backgroundColor: '#fff', marginHorizontal: 14, marginTop: -4, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  tabsRow:      { gap: 4, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  tab:          { paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabActive:    { borderBottomColor: BLUE },
  tabText:      { fontSize: 13, fontWeight: '500', color: GRAY },
  tabTextActive:{ color: BLUE, fontWeight: '700' },
  newBadge:     { backgroundColor: '#EF4444', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  toggleRow:        { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 10 },
  toggleBtn:        { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive:  { backgroundColor: BLUE, elevation: 2 },
  toggleText:       { fontSize: 14, fontWeight: '600', color: GRAY },
  toggleTextActive: { color: '#fff' },

  searchBtn:     { backgroundColor: BLUE, borderRadius: 10, paddingVertical: 13, alignItems: 'center', elevation: 3 },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  section:       { paddingHorizontal: 16, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: DARK },
  sectionSub:    { fontSize: 13, color: GRAY, marginTop: 2 },
  seeAll:        { fontSize: 13, color: BLUE, fontWeight: '600' },

  recentCard:        { width: 244, backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BORDER, elevation: 2 },
  recentThumb:       { width: 56, height: 56, borderRadius: 8, backgroundColor: '#E5E7EB' },
  recentLocation:    { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 2 },
  recentType:        { fontSize: 12, color: GRAY, marginBottom: 4 },
  recentFilterRow:   { flexDirection: 'row' },
  recentFilterBadge: { backgroundColor: '#EEF2FF', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  recentFilterText:  { fontSize: 11, color: BLUE, fontWeight: '600' },

  featuredCard:      { width: 230, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8 },
  featuredImage:     { width: '100%', height: 160 },
  featuredGradient:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.30)' },
  featuredBadge:     { position: 'absolute', top: 10, left: 10, backgroundColor: BLUE, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  featuredBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  featuredPriceRow:  { position: 'absolute', bottom: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPrice:     { fontSize: 16, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  darniDot:          { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center' },
  darniDotText:      { color: BLUE, fontSize: 12, fontWeight: '900' },
  featuredContent:   { padding: 12 },
  featuredType:      { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 3 },
  featuredLocation:  { fontSize: 12, color: GRAY, marginBottom: 3 },
  featuredSpecs:     { fontSize: 11, color: GRAY_LT },

  ctaBanner:   { marginHorizontal: 16, marginTop: 24, backgroundColor: '#00513F', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' },
  ctaNewBadge: { backgroundColor: '#EF4444', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 },
  ctaNewText:  { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ctaTitle:    { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6, lineHeight: 24 },
  ctaSub:      { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  ctaArrow:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginLeft: 16 },

  wilayaTabs:          { gap: 8, marginBottom: 16 },
  wilayaTab:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER },
  wilayaTabActive:     { backgroundColor: '#EEF2FF', borderColor: BLUE },
  wilayaTabText:       { fontSize: 13, fontWeight: '500', color: GRAY },
  wilayaTabTextActive: { color: BLUE, fontWeight: '700' },

  grid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard:      { width: (W - 44) / 2, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: BORDER, elevation: 2 },
  gridBadge:     { position: 'absolute', bottom: 8, left: 8, backgroundColor: BLUE, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  gridBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  gridPrice:     { fontSize: 14, fontWeight: '900', color: BLUE, marginBottom: 2 },
  gridType:      { fontSize: 12, color: '#374151', fontWeight: '600', marginBottom: 2 },
  gridLocation:  { fontSize: 11, color: GRAY_LT, marginBottom: 3 },
  gridSpecs:     { fontSize: 11, color: GRAY },
  emptyText:     { textAlign: 'center', color: GRAY_LT, fontSize: 14, marginTop: 20 },

  seeAllBtn:     { marginTop: 16, borderWidth: 1.5, borderColor: BLUE, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  seeAllBtnText: { color: BLUE, fontSize: 14, fontWeight: '700' },

  agenceBanner:  { backgroundColor: '#0F2D4A', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center' },
  agenceAvatar:  { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  agenceTitle:   { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  agenceSub:     { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
});