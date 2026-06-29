import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Dimensions, Linking, FlatList,
  StatusBar, Share, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const BLUE = '#1B4FD8';
const DARK = '#111827';
const GRAY = '#6B7280';
const GRAY_LT = '#9CA3AF';
const BORDER = '#E5E7EB';
const BG = '#F7F8FA';

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', bureau: 'Bureau',
  local: 'Local commercial', terrain: 'Terrain', autre: 'Autre',
};

const AMENITY_LABELS: Record<string, string> = {
  ascenseur: 'Ascenseur', parking: 'Parking', balcon: 'Balcon',
  terrasse: 'Terrasse', jardin: 'Jardin', piscine: 'Piscine',
  securite: 'Sécurité', meuble: 'Meublé', climatisation: 'Climatisation', cave: 'Cave',
};

function smartPrice(price: number, transaction?: string): string {
  if (!price) return '— DA';
  const suffix = transaction === 'location' ? '/mois' : '';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1).replace('.0', '')} Mrd DA${suffix}`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace('.0', '')} M DA${suffix}`;
  return price.toLocaleString('fr-DZ') + ` DA${suffix}`;
}

function getPhotos(listing: any): string[] {
  const fb = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900';
  const photos = listing.photos;
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [fb];
  const urls = photos.map((p: any) => typeof p === 'string' ? p : p?.url ?? '').filter(Boolean);
  return urls.length ? urls : [fb];
}

function buildWA(raw: string | null): string {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '');
  return `https://wa.me/${d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d}`;
}

function buildTel(raw: string | null): string {
  if (!raw) return '';
  const d = raw.replace(/\D/g, '');
  return `tel:+${d.startsWith('213') ? d : d.startsWith('0') ? '213' + d.slice(1) : '213' + d}`;
}

export function ListingDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { listing } = route.params;
  const photos = getPhotos(listing);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const phone = listing.phone ?? listing.whatsapp ?? null;
  const waLink = buildWA(listing.whatsapp ?? listing.phone);
  const telLink = buildTel(listing.phone ?? listing.whatsapp);
  const location = [listing.quartier, listing.commune, listing.wilaya].filter(Boolean).join(', ');
  const refCode = listing.id?.toString().slice(0, 8).toUpperCase() ?? '—';
  const amenities = listing.amenities ?? [];

  const stats = [
    listing.surface && { val: `${listing.surface}`, label: 'm²' },
    listing.bedrooms && { val: `${listing.bedrooms}`, label: 'Chambres' },
    listing.bathrooms && { val: `${listing.bathrooms}`, label: 'SDB' },
    listing.rooms && { val: `${listing.rooms}`, label: 'Pièces' },
    listing.floor != null && { val: `${listing.floor}`, label: 'Étage' },
  ].filter(Boolean) as { val: string; label: string }[];

  const infoRows = [
    { label: 'Type', value: TYPE_LABELS[listing.type] ?? listing.type },
    { label: 'Transaction', value: listing.transaction === 'location' ? 'Location' : 'Vente' },
    { label: 'Wilaya', value: listing.wilaya },
    listing.commune && { label: 'Commune', value: listing.commune },
    listing.quartier && { label: 'Quartier', value: listing.quartier },
    listing.surface && { label: 'Superficie', value: `${listing.surface} m²` },
    listing.rooms && { label: 'Pièces', value: `${listing.rooms}` },
    listing.bedrooms && { label: 'Chambres', value: `${listing.bedrooms}` },
    listing.bathrooms && { label: 'Salles de bain', value: `${listing.bathrooms}` },
    listing.floor != null && { label: 'Étage', value: `${listing.floor}` },
  ].filter(Boolean) as { label: string; value: string }[];

  const onShare = async () => {
    try {
      await Share.share({
        message: `${listing.title ?? 'Bien immobilier'} — ${smartPrice(listing.price, listing.transaction)} sur Darni.app`,
      });
    } catch (e) {}
  };

  // Hauteur footer dynamique selon safe area
  const footerPaddingBottom = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* GALERIE PHOTOS */}
      <View style={styles.galleryContainer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={e => {
            setCurrentPhoto(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.95} onPress={() => setShowGallery(true)}>
              <Image source={{ uri: item }} style={styles.galleryPhoto} resizeMode="cover" />
            </TouchableOpacity>
          )}
        />

        <View style={styles.galleryGradient} />

        {/* Bouton retour — respecte la status bar */}
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        {/* Actions haut droite — respecte la status bar */}
        <View style={[styles.topActions, { top: insets.top + 8 }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <Text style={styles.actionBtnText}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, saved && styles.actionBtnSaved]}
            onPress={() => setSaved(!saved)}>
            <Text style={{ fontSize: 16 }}>{saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentPhoto && styles.dotActive]} />
            ))}
          </View>
        )}

        {photos.length > 1 && (
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>{currentPhoto + 1}/{photos.length}</Text>
          </View>
        )}
      </View>

      {/* CONTENU */}
      <ScrollView
        style={styles.sheet}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footerPaddingBottom + 80 }}>

        <View style={styles.handle} />

        <View style={styles.priceSection}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: listing.transaction === 'location' ? '#0369a1' : BLUE }]}>
              <Text style={styles.badgeText}>
                {listing.transaction === 'location' ? 'Location' : 'Vente'}
              </Text>
            </View>
            {listing.is_featured && (
              <View style={[styles.badge, { backgroundColor: '#7C3AED' }]}>
                <Text style={styles.badgeText}>Vedette</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: '#059669' }]}>
              <Text style={styles.badgeText}>✓ Vérifié</Text>
            </View>
          </View>

          <Text style={styles.price}>{smartPrice(listing.price, listing.transaction)}</Text>
          {listing.transaction === 'location' && (
            <Text style={styles.priceSub}>Loyer mensuel</Text>
          )}
          {listing.title && <Text style={styles.title}>{listing.title}</Text>}
          <Text style={styles.refText}>
            Réf. #{refCode}
            {listing.created_at && ` · ${new Date(listing.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </Text>
        </View>

        {stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Localisation</Text>
          <Text style={styles.cardText}>{location}</Text>
        </View>

        {listing.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.cardText}>
              {showFullDesc || listing.description.length <= 280
                ? listing.description
                : listing.description.slice(0, 280) + '…'}
            </Text>
            {listing.description.length > 280 && (
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)} style={{ marginTop: 8 }}>
                <Text style={{ color: BLUE, fontSize: 13, fontWeight: '700' }}>
                  {showFullDesc ? 'Voir moins ↑' : 'Lire la suite ↓'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {amenities.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Équipements</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((a: string) => (
                <View key={a} style={styles.amenityItem}>
                  <Text style={styles.amenityCheck}>✓</Text>
                  <Text style={styles.amenityText}>{AMENITY_LABELS[a] ?? a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations du bien</Text>
          {infoRows.map((row, i) => (
            <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.agentCard}>
          <View style={styles.agentHeader}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>D</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.agentName}>Vendeur Darni</Text>
              <View style={styles.agentBadges}>
                <View style={styles.agentBadge}>
                  <Text style={styles.agentBadgeText}>✓ Vérifié</Text>
                </View>
                <View style={[styles.agentBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.agentBadgeText, { color: '#92400E' }]}>Pro</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.reportBtn}>
          <Text style={styles.reportBtnText}>Signaler cette annonce</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* CTA FIXE BAS — safe area dynamique */}
      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        <TouchableOpacity style={styles.emailBtn}
          onPress={() => Linking.openURL('mailto:contact@darni.app')}>
          <Text style={styles.emailBtnText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn}
          onPress={() => telLink && Linking.openURL(telLink)}>
          <Text style={styles.callBtnText}>Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.waBtn}
          onPress={() => waLink && Linking.openURL(waLink)}>
          <Text style={styles.waBtnText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL GALERIE FULLSCREEN */}
      <Modal visible={showGallery} animationType="fade" statusBarTranslucent>
        <View style={styles.galleryModal}>
          <View style={[styles.galleryModalHeader, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.galleryModalCount}>{currentPhoto + 1} / {photos.length}</Text>
            <TouchableOpacity onPress={() => setShowGallery(false)}
              style={styles.galleryModalClose}>
              <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            initialScrollIndex={currentPhoto}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={e => {
              setCurrentPhoto(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => (
              <View style={{ width, height: height * 0.75, justifyContent: 'center' }}>
                <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </View>
            )}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryThumbs}>
            {photos.map((p, i) => (
              <TouchableOpacity key={i} onPress={() => setCurrentPhoto(i)}>
                <Image source={{ uri: p }} style={[styles.galleryThumb, i === currentPhoto && styles.galleryThumbActive]} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  galleryContainer: { height: height * 0.45, position: 'relative' },
  galleryPhoto: { width, height: height * 0.45 },
  galleryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.12)' },
  backBtn: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 34 },
  topActions: { position: 'absolute', right: 16, flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  actionBtnSaved: { backgroundColor: 'rgba(239,68,68,0.8)' },
  actionBtnText: { color: '#fff', fontSize: 18 },
  dots: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  photoCounter: { position: 'absolute', bottom: 14, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  photoCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  sheet: { flex: 1, backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { width: 40, height: 4, backgroundColor: BORDER, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },

  priceSection: { paddingHorizontal: 16, marginBottom: 16 },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  price: { fontSize: 32, fontWeight: '900', color: DARK, letterSpacing: -1, marginBottom: 4 },
  priceSub: { fontSize: 14, color: GRAY_LT, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '700', color: DARK, lineHeight: 26, marginBottom: 8 },
  refText: { fontSize: 12, color: GRAY_LT },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: BG, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: BORDER },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRightWidth: 1, borderRightColor: BORDER },
  statVal: { fontSize: 18, fontWeight: '900', color: DARK },
  statLabel: { fontSize: 11, color: GRAY_LT, marginTop: 2 },

  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER },
  cardTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 10 },
  cardText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: BG, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  amenityCheck: { fontSize: 12, color: BLUE, fontWeight: '700' },
  amenityText: { fontSize: 13, color: '#374151' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoLabel: { fontSize: 14, color: GRAY_LT },
  infoValue: { fontSize: 14, fontWeight: '600', color: DARK },

  agentCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: BORDER },
  agentHeader: { flexDirection: 'row', alignItems: 'center' },
  agentAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  agentAvatarText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  agentName: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 6 },
  agentBadges: { flexDirection: 'row', gap: 6 },
  agentBadge: { backgroundColor: '#E8F8F0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  agentBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },

  reportBtn: { marginHorizontal: 16, marginBottom: 8, padding: 14, alignItems: 'center' },
  reportBtnText: { fontSize: 13, color: GRAY_LT },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: BORDER },
  emailBtn: { flex: 1, backgroundColor: BG, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  emailBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  callBtn: { flex: 1, backgroundColor: BLUE, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  waBtn: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#86EFAC' },
  waBtnText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },

  galleryModal: { flex: 1, backgroundColor: '#000' },
  galleryModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  galleryModalCount: { color: '#fff', fontSize: 14, fontWeight: '600' },
  galleryModalClose: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  galleryThumbs: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  galleryThumb: { width: 64, height: 48, borderRadius: 6, opacity: 0.5 },
  galleryThumbActive: { opacity: 1, borderWidth: 2, borderColor: '#fff' },
});