/**
 * MoreScreen.tsx — Darni
 * Favoris, Langue (FR/AR/EN), Contact, À propos, CGU, Confidentialité
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BLUE, DARK, GRAY, BORDER } from '../lib/theme';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية',  flag: '🇩🇿' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
];

function MenuItem({ icon, label, sublabel, onPress, danger = false, value }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, danger && { backgroundColor: '#FEE2E2' }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, danger && { color: '#EF4444' }]}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
      {value
        ? <Text style={{ color: GRAY, fontSize: 13, marginRight: 6 }}>{value}</Text>
        : <Text style={{ color: '#D1D5DB', fontSize: 18 }}>›</Text>
      }
    </TouchableOpacity>
  );
}

export function MoreScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [lang, setLang] = useState(LANGUAGES[0]);

  const switchLang = () => {
    Alert.alert('Langue / Language / اللغة', '', [
      ...LANGUAGES.map(l => ({
        text: `${l.flag}  ${l.label}`,
        onPress: () => {
          setLang(l);
          if (l.code === 'ar') {
            Alert.alert(
              'Redémarrage requis',
              "Pour activer l'arabe (RTL), redémarrez l'application.",
              [{ text: 'OK' }]
            );
          }
        },
      })),
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const goAbout   = (type: string) => navigation.navigate('About', { type });
  const goAgences = () => navigation.navigate('Agences');
  const goMap     = () => navigation.navigate('Map');

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Plus</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* Découvrir */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Découvrir</Text>
          <View style={styles.card}>
            <MenuItem icon="♡" label="Mes favoris"
              sublabel="Biens sauvegardés"
              onPress={() => Alert.alert('Bientôt disponible', 'Les favoris arrivent dans la prochaine version.')} />
            <View style={styles.sep} />
            <MenuItem icon="⊙" label="Recherches sauvegardées"
              sublabel="Alertes activées"
              onPress={() => Alert.alert('Bientôt disponible', 'Les alertes arrivent dans la prochaine version.')} />
            <View style={styles.sep} />
            <MenuItem icon="◉" label="Agents & Agences"
              sublabel="Trouvez un professionnel"
              onPress={goAgences} />
            <View style={styles.sep} />
            <MenuItem icon="⊕" label="Vue carte"
              sublabel="Explorer les biens sur la carte"
              onPress={goMap} />
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Préférences</Text>
          <View style={styles.card}>
            <MenuItem icon="◎" label="Langue"
              value={`${lang.flag} ${lang.label}`}
              onPress={switchLang} />
            <View style={styles.sep} />
            <MenuItem icon="⚙" label="Paramètres"
              onPress={() => Alert.alert('Bientôt disponible')} />
            <View style={styles.sep} />
            <MenuItem icon="◑" label="Notifications"
              sublabel="Alertes et nouveautés"
              onPress={() => Alert.alert('Bientôt disponible')} />
          </View>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>À propos</Text>
          <View style={styles.card}>
            <MenuItem icon="✉" label="Nous contacter"
              sublabel="support@darni.app"
              onPress={() => goAbout('contact')} />
            <View style={styles.sep} />
            <MenuItem icon="◈" label="À propos de Darni"
              sublabel="L'immobilier en Algérie"
              onPress={() => goAbout('about')} />
            <View style={styles.sep} />
            <MenuItem icon="☰" label="Conditions d'utilisation"
              onPress={() => goAbout('cgu')} />
            <View style={styles.sep} />
            <MenuItem icon="⊛" label="Politique de confidentialité"
              onPress={() => goAbout('privacy')} />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>darni · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle:  { fontSize: 26, fontWeight: '900', color: BLUE, letterSpacing: -0.5 },
  section:      { paddingHorizontal: 16, marginTop: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: GRAY, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  card:         { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  menuItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  iconWrap:     { width: 34, height: 34, borderRadius: 8, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  label:        { fontSize: 15, fontWeight: '600', color: DARK },
  sublabel:     { fontSize: 12, color: GRAY, marginTop: 1 },
  sep:          { height: 1, backgroundColor: BORDER, marginLeft: 62 },
  version:      { textAlign: 'center', color: GRAY, fontSize: 12, marginTop: 32, marginBottom: 8 },
});