/**
 * AgentProfileScreen.tsx — Darni
 * Profil détaillé d'un agent — annonces, spécialités et zones dérivées de ses vraies annonces.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Linking, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { BLUE, DARK, GRAY, GRAY_LT, BORDER } from '../lib/theme';
import { smartPrice, firstPhoto } from '../lib/format';
import { AgentAvatar } from '../components/AgentAvatar';

// Forme plurielle pour l'affichage en tags ("Spécialités : Appartements, Villas") —
// distincte de TYPE_LABELS (lib/labels.ts) qui est au singulier pour une annonce isolée.
const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartements', villa: 'Villas', bureau: 'Bureaux',
  local: 'Locaux commerciaux', terrain: 'Terrains', autre: 'Autres',
};

export function AgentProfileScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { agent } = route.params;

  const [listings, setListings] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let isMounted = true;
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', agent.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!isMounted) return;
        if (fetchError) {
          setError("Impossible de charger les annonces de cet agent.");
        } else {
          setListings(data ?? []);
        }
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [agent.id]);

  const specialites = [...new Set(listings.map(l => l.type).filter(Boolean))]
    .map(t => TYPE_LABELS[t] ?? t);
  const zones = [...new Set(listings.map(l => l.wilaya).filter(Boolean))];

  const callAgent = () => {
    if (!agent.phone) { Alert.alert('Indisponible', 'Numéro non renseigné.'); return; }
    Linking.openURL(`tel:${agent.phone}`).catch(() =>
      Alert.alert('Erreur', 'Impossible d\'ouvrir le téléphone.')
    );
  };

  const whatsappAgent = () => {
    if (!agent.phone) { Alert.alert('Indisponible', 'Numéro non renseigné.'); return; }
    const phone = agent.phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=Bonjour, j'ai vu votre profil sur Darni.`)
      .catch(() => Alert.alert('Erreur', 'WhatsApp non disponible.'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: DARK }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil agent</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        <View style={styles.profileCard}>
          <AgentAvatar
            name={agent.name}
            color={agent.color}
            avatarUrl={agent.avatarUrl}
            size={88}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Text style={styles.agentName}>{agent.name}</Text>
            {agent.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Vérifié</Text>
              </View>
            )}
          </View>

          <Text style={styles.agentMeta}>{agent.wilaya}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{agent.listings}</Text>
              <Text style={styles.statLabel}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{zones.length || 1}</Text>
              <Text style={styles.statLabel}>Zone{zones.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.callBtn} onPress={callAgent}>
            <Text style={styles.callBtnText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappBtn} onPress={whatsappAgent}>
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {specialites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spécialités</Text>
            <View style={styles.tagsRow}>
              {specialites.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {zones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zones couvertes</Text>
            <View style={styles.tagsRow}>
              {zones.map(w => (
                <View key={w} style={[styles.tag, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={[styles.tagText, { color: BLUE }]}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.section, { marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>Annonces récentes</Text>

          {loading && (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator color={BLUE} />
            </View>
          )}

          {!loading && error !== '' && (
            <View style={styles.aboutCard}>
              <Text style={{ color: '#991B1B', fontSize: 13, textAlign: 'center' }}>{error}</Text>
            </View>
          )}

          {!loading && error === '' && listings.length === 0 && (
            <View style={styles.aboutCard}>
              <Text style={{ color: GRAY_LT, fontSize: 14, textAlign: 'center', paddingVertical: 12 }}>
                Aucune annonce active pour le moment.
              </Text>
            </View>
          )}

          {!loading && listings.slice(0, 5).map(listing => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingRow}
              onPress={() => navigation.navigate('ListingDetail', { listing })}
            >
              <Image source={{ uri: firstPhoto(listing) }} style={styles.listingPhoto} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.listingPrice}>{smartPrice(listing.price, listing.transaction)}</Text>
                <Text style={styles.listingMeta}>{listing.wilaya}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:   { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: DARK },

  profileCard:   { backgroundColor: '#fff', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: BORDER },
  agentName:     { fontSize: 20, fontWeight: '800', color: DARK },
  agentMeta:     { fontSize: 13, color: GRAY_LT, marginTop: 4 },
  verifiedBadge: { backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText:  { fontSize: 12, color: '#065F46', fontWeight: '700' },

  statsRow:    { flexDirection: 'row', marginTop: 20, width: '100%', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 16 },
  statBox:     { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 18, fontWeight: '900', color: BLUE },
  statLabel:   { fontSize: 12, color: GRAY, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: BORDER },

  contactRow:    { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  callBtn:       { flex: 1, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  callBtnText:   { fontSize: 15, fontWeight: '700', color: DARK },
  whatsappBtn:   { flex: 1, backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  whatsappBtnText:{ fontSize: 15, fontWeight: '700', color: '#fff' },

  section:      { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 10 },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:          { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tagText:      { fontSize: 13, color: GRAY, fontWeight: '500' },
  aboutCard:    { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER },

  listingRow:    { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: BORDER, marginBottom: 8, alignItems: 'center' },
  listingPhoto:  { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F3F4F6' },
  listingTitle:  { fontSize: 13, fontWeight: '600', color: DARK },
  listingPrice:  { fontSize: 14, fontWeight: '800', color: BLUE, marginTop: 2 },
  listingMeta:   { fontSize: 12, color: GRAY_LT, marginTop: 2 },
});
