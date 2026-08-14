/**
 * MapScreen.tsx — Darni v2
 * Corrections : zoom centré Alger, tracksViewChanges, marqueurs visibles
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const BORDER = '#E5E7EB';

const WILAYA_COORDS: Record<string, { lat: number; lng: number }> = {
  'alger':       { lat: 36.7538, lng:  3.0588 },
  'oran':        { lat: 35.6969, lng: -0.6331 },
  'constantine': { lat: 36.3650, lng:  6.6147 },
  'annaba':      { lat: 36.9000, lng:  7.7667 },
  'blida':       { lat: 36.4700, lng:  2.8300 },
  'setif':       { lat: 36.1898, lng:  5.4107 },
  'tizi':        { lat: 36.7169, lng:  4.0497 },
  'bejaia':      { lat: 36.7500, lng:  5.0833 },
  'batna':       { lat: 35.5559, lng:  6.1742 },
  'tlemcen':     { lat: 34.8828, lng: -1.3167 },
  'mostaganem':  { lat: 35.9315, lng:  0.0892 },
  'medea':       { lat: 36.2637, lng:  2.7539 },
  'boumerdes':   { lat: 36.7588, lng:  3.4776 },
  'tipaza':      { lat: 36.5833, lng:  2.4500 },
  'djelfa':      { lat: 34.6742, lng:  3.2632 },
  'msila':       { lat: 35.7061, lng:  4.5417 },
  'biskra':      { lat: 34.8500, lng:  5.7333 },
};

function normalizeStr(s: string): string {
  return s.toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c');
}

/* Offset déterministe (stable entre rendus) basé sur l'id */
function stableOffset(id: string, axis: 'lat' | 'lng'): number {
  let h = axis === 'lat' ? 17 : 31;
  for (let i = 0; i < id.length; i++) h = (h * 37 + id.charCodeAt(i)) >>> 0;
  return ((h % 80) / 80 - 0.4) * 0.05;
}

function getCoords(listing: any): { latitude: number; longitude: number } {
  if (listing.lat && listing.lng) {
    return { latitude: Number(listing.lat), longitude: Number(listing.lng) };
  }
  const w = normalizeStr(listing.wilaya ?? 'alger');
  const key = Object.keys(WILAYA_COORDS).find(k => w.startsWith(k) || w.includes(k));
  const base = WILAYA_COORDS[key ?? 'alger'];
  return {
    latitude:  base.lat + stableOffset(String(listing.id), 'lat'),
    longitude: base.lng + stableOffset(String(listing.id), 'lng'),
  };
}

function smartPrice(price: number, transaction?: string): string {
  if (!price) return '–';
  const s = transaction === 'location' ? '/m' : '';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd${s}`;
  if (price >= 1_000_000)     return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M${s}`;
  return price.toLocaleString('fr-DZ') + ` DA${s}`;
}

function firstPhoto(listing: any): string {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
  const p = listing.photos;
  if (!p || !Array.isArray(p) || p.length === 0) return fb;
  return typeof p[0] === 'string' ? p[0] : (p[0]?.url ?? fb);
}

export function MapScreen({ navigation, route }: any) {
  const insets  = useSafeAreaInsets();
  const mapRef  = useRef<MapView>(null);

  const [listings,     setListings]     = useState<any[]>(route?.params?.listings ?? []);
  const [loading,      setLoading]      = useState(listings.length === 0);
  const [loadError,    setLoadError]    = useState('');
  const [selected,     setSelected]     = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vente' | 'location'>('all');
  const [reloadKey,    setReloadKey]    = useState(0);

  useEffect(() => {
    if (listings.length > 0) { setLoading(false); return; }
    setLoading(true);
    setLoadError('');
    supabase.from('listings').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('MapScreen fetch error:', error);
          setLoadError("Impossible de charger les biens sur la carte. Vérifiez votre connexion.");
        } else {
          setListings(data ?? []);
        }
        setLoading(false);
      });
  }, [reloadKey]);

  const filtered = listings.filter(l =>
    activeFilter === 'all' || l.transaction === activeFilter
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: DARK }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vue carte</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filtres + compteur */}
      <View style={styles.filterRow}>
        {([
          { val: 'all',      label: 'Tous'     },
          { val: 'vente',    label: 'Vente'    },
          { val: 'location', label: 'Location' },
        ] as const).map(f => (
          <TouchableOpacity key={f.val}
            onPress={() => { setActiveFilter(f.val); setSelected(null); }}
            style={[styles.filterBtn, activeFilter === f.val && styles.filterBtnActive]}>
            <Text style={[styles.filterText, activeFilter === f.val && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length} biens</Text>
        </View>
      </View>

      {/* Carte */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={BLUE} size="large" />
          <Text style={{ color: GRAY, marginTop: 12, fontSize: 14 }}>Chargement des biens...</Text>
        </View>
      ) : loadError !== '' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#991B1B', fontSize: 14, textAlign: 'center', marginBottom: 14 }}>{loadError}</Text>
          <TouchableOpacity onPress={() => setReloadKey(k => k + 1)}
            style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#991B1B' }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          /* Zoom centré sur Alger — ajusté pour voir les marqueurs */
          initialRegion={{
            latitude:       36.73,
            longitude:       3.10,
            latitudeDelta:   0.45,
            longitudeDelta:  0.55,
          }}
          onPress={() => setSelected(null)}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {filtered.map(listing => {
            const coords   = getCoords(listing);
            const isSel    = selected?.id === listing.id;
            const isLoc    = listing.transaction === 'location';

            return (
              <Marker
                key={listing.id}
                coordinate={coords}
                onPress={() => setSelected(listing)}
                tracksViewChanges={false}
                zIndex={isSel ? 999 : 1}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                {/* Bulle prix — visible sur fond gris et fond carte */}
                <View style={[
                  styles.bubble,
                  isLoc  && styles.bubbleLoc,
                  isSel  && styles.bubbleSel,
                ]}>
                  <Text style={[styles.bubbleText, isSel && styles.bubbleTextSel]}>
                    {smartPrice(listing.price, listing.transaction)}
                  </Text>
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Fiche bien sélectionné */}
      {selected && !loading && (
        <View style={[styles.card, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}
            onPress={() => navigation.navigate('ListingDetail', { listing: selected })}
            activeOpacity={0.85}
          >
            <Image source={{ uri: firstPhoto(selected) }} style={styles.cardThumb} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardPrice}>{smartPrice(selected.price, selected.transaction)}</Text>
              <Text style={styles.cardType}>
                {selected.type?.charAt(0).toUpperCase() + selected.type?.slice(1)}
                {selected.transaction === 'location' ? ' · Location' : ' · Vente'}
              </Text>
              <Text style={styles.cardLoc} numberOfLines={1}>
                {[selected.commune, selected.wilaya].filter(Boolean).join(', ')}
              </Text>
              {(selected.surface || selected.bedrooms) && (
                <Text style={styles.cardSpecs}>
                  {[
                    selected.surface   ? `${selected.surface} m²`   : null,
                    selected.bedrooms  ? `${selected.bedrooms} ch`  : null,
                  ].filter(Boolean).join(' · ')}
                </Text>
              )}
            </View>
            <View style={styles.voirBtn}>
              <Text style={styles.voirBtnText}>Voir</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeCard} onPress={() => setSelected(null)}>
            <Text style={{ color: GRAY, fontSize: 18, lineHeight: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bouton recentrer */}
      <TouchableOpacity
        style={[styles.recenterBtn, { bottom: selected ? 160 : insets.bottom + 20 }]}
        onPress={() => mapRef.current?.animateToRegion({
          latitude: 36.73, longitude: 3.10,
          latitudeDelta: 0.45, longitudeDelta: 0.55,
        }, 500)}
      >
        <Text style={{ fontSize: 18 }}>⊙</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: DARK },

  filterRow:        { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', gap: 8, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BORDER },
  filterBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: BORDER },
  filterBtnActive:  { backgroundColor: '#EEF2FF', borderColor: BLUE },
  filterText:       { fontSize: 13, fontWeight: '500', color: GRAY },
  filterTextActive: { color: BLUE, fontWeight: '700' },
  countBadge:       { marginLeft: 'auto' as any, backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  countText:        { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Bulles prix sur la carte */
  bubble: {
    backgroundColor: BLUE,
    borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5,
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3,
    elevation: 5,
  },
  bubbleLoc:     { backgroundColor: '#00513F' },
  bubbleSel:     { backgroundColor: DARK, transform: [{ scale: 1.2 }] },
  bubbleText:    { color: '#fff', fontSize: 11, fontWeight: '800' },
  bubbleTextSel: { color: '#fff' },

  /* Fiche bien */
  card: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingTop: 14,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 12,
  },
  cardThumb:  { width: 80, height: 80, borderRadius: 10 },
  cardPrice:  { fontSize: 16, fontWeight: '900', color: BLUE, marginBottom: 2 },
  cardType:   { fontSize: 13, fontWeight: '600', color: DARK, marginBottom: 2 },
  cardLoc:    { fontSize: 12, color: GRAY, marginBottom: 2 },
  cardSpecs:  { fontSize: 11, color: '#9CA3AF' },
  voirBtn:    { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  voirBtnText:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  closeCard:  { position: 'absolute', top: 14, right: 16, padding: 4 },

  recenterBtn: {
    position: 'absolute', right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6,
    elevation: 5, borderWidth: 1, borderColor: BORDER,
  },
});