/**
 * AgentProfileScreen.tsx — Darni
 * Profil détaillé d'un agent ou agence
 */
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const GRAY_LT = '#9CA3AF'; const BORDER = '#E5E7EB';

export function AgentProfileScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { agent } = route.params;

  const initials = agent.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  const callAgent = () => {
    const phone = agent.phone ?? '+213555000000';
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Erreur', 'Impossible d\'ouvrir le téléphone.')
    );
  };

  const whatsappAgent = () => {
    const phone = (agent.phone ?? '+213555000000').replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=Bonjour, j'ai vu votre profil sur Darni.`)
      .catch(() => Alert.alert('Erreur', 'WhatsApp non disponible.'));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: DARK }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil agent</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Carte profil */}
        <View style={styles.profileCard}>
          {/* Avatar large */}
          <View style={[styles.avatar, { backgroundColor: agent.color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {/* Nom + badges */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Text style={styles.agentName}>{agent.name}</Text>
            {agent.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Vérifié</Text>
              </View>
            )}
          </View>

          <Text style={styles.agencyName}>{agent.agency}</Text>
          <Text style={styles.agentMeta}>{agent.wilaya}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{agent.listings}</Text>
              <Text style={styles.statLabel}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>4.8</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>3 ans</Text>
              <Text style={styles.statLabel}>Exp.</Text>
            </View>
          </View>
        </View>

        {/* Boutons contact */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.callBtn} onPress={callAgent}>
            <Text style={styles.callBtnText}>Appeler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappBtn} onPress={whatsappAgent}>
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Spécialités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spécialités</Text>
          <View style={styles.tagsRow}>
            {['Appartements', 'Villas', 'Terrains'].map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wilayas couvertes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones couvertes</Text>
          <View style={styles.tagsRow}>
            {[agent.wilaya, 'Blida', 'Tipaza'].map(w => (
              <View key={w} style={[styles.tag, { backgroundColor: '#EEF2FF' }]}>
                <Text style={[styles.tagText, { color: BLUE }]}>{w}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Agent immobilier certifié avec {Math.floor(Math.random() * 5) + 2} ans d'expérience dans la région de {agent.wilaya}.
              Spécialisé dans la vente et la location de biens résidentiels et commerciaux.
              Disponible 7j/7 pour accompagner vos projets immobiliers.
            </Text>
          </View>
        </View>

        {/* Annonces récentes — placeholder */}
        <View style={[styles.section, { marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>Annonces récentes</Text>
          <View style={styles.aboutCard}>
            <Text style={{ color: GRAY_LT, fontSize: 14, textAlign: 'center', paddingVertical: 12 }}>
              Les annonces de cet agent s'afficheront ici.
            </Text>
          </View>
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
  avatar:        { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { color: '#fff', fontSize: 30, fontWeight: '800' },
  agentName:     { fontSize: 20, fontWeight: '800', color: DARK },
  agencyName:    { fontSize: 15, color: GRAY, marginTop: 4 },
  agentMeta:     { fontSize: 13, color: GRAY_LT, marginTop: 2 },
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
  aboutText:    { fontSize: 14, color: GRAY, lineHeight: 22 },
});