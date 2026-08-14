/**
 * AboutScreen.tsx — Darni
 * Page "À propos" rich : hero, stats, mission, offres, valeurs, contact
 * + pages CGU / Confidentialité / Contact (text)
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { BLUE, DARK, GRAY, GRAY_LT, BORDER } from '../lib/theme';

const { width: W } = Dimensions.get('window');

type ContentKey = 'about' | 'cgu' | 'privacy' | 'contact';

/* ────────────────────────────────────────────
   TEXTES CGU / PRIVACY / CONTACT (inchangés)
──────────────────────────────────────────── */
const TEXT_CONTENT: Record<Exclude<ContentKey,'about'>, { title: string; body: string }> = {
  cgu: {
    title: "Conditions d'utilisation",
    body: `Dernière mise à jour : juin 2025

1. ACCEPTATION DES CONDITIONS
En utilisant l'application Darni, vous acceptez les présentes conditions d'utilisation.

2. UTILISATION DU SERVICE
Darni est une plateforme de mise en relation immobilière. Les annonces publiées sont sous la responsabilité de leurs auteurs.

3. CONTENU DES ANNONCES
Les utilisateurs s'engagent à publier des annonces exactes et conformes à la réalité. Darni se réserve le droit de supprimer tout contenu inapproprié.

4. LIMITATION DES ANNONCES GRATUITES
Chaque utilisateur peut publier jusqu'à 5 annonces gratuitement. Au-delà, un abonnement Pro est requis.

5. PROPRIÉTÉ INTELLECTUELLE
Le contenu de l'application Darni (logo, design, code) est protégé par les droits de propriété intellectuelle.

6. MODIFICATION DES CONDITIONS
Darni peut modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants.`,
  },
  privacy: {
    title: 'Politique de confidentialité',
    body: `Dernière mise à jour : juin 2025

1. DONNÉES COLLECTÉES
• Email et informations de profil (inscription)
• Données de navigation et recherches
• Contenu des annonces publiées

2. UTILISATION DES DONNÉES
• Gérer votre compte et vos annonces
• Améliorer nos services et recommandations
• Vous envoyer des notifications pertinentes

3. PARTAGE DES DONNÉES
Darni ne vend jamais vos données personnelles. Elles peuvent être partagées avec des prestataires techniques (Supabase, Google).

4. SÉCURITÉ
Vos données sont stockées de manière sécurisée sur des serveurs chiffrés.

5. VOS DROITS
Vous pouvez demander la suppression de votre compte à tout moment : support@darni.app`,
  },
  contact: {
    title: 'Nous contacter',
    body: `Nous sommes là pour vous aider.

Support général :
support@darni.app
Réponse sous 24-48h (jours ouvrables)

Signaler une annonce frauduleuse :
signalement@darni.app

Partenariats & agences :
pro@darni.app

Presse :
presse@darni.app`,
  },
};

/* ────────────────────────────────────────────
   COMPOSANTS ABOUT
──────────────────────────────────────────── */
function StatBox({ num, label }: { num: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OfferCard({ icon, title, desc, bg }: { icon: string; title: string; desc: string; bg: string }) {
  return (
    <View style={[styles.offerCard, { backgroundColor: bg }]}>
      <View style={styles.offerIconWrap}>
        <Text style={styles.offerIcon}>{icon}</Text>
      </View>
      <Text style={styles.offerTitle}>{title}</Text>
      <Text style={styles.offerDesc}>{desc}</Text>
    </View>
  );
}

function ValueRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.valueRow}>
      <View style={styles.valueIconWrap}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.valueTitle}>{title}</Text>
        <Text style={styles.valueDesc}>{desc}</Text>
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────
   PAGE À PROPOS COMPLÈTE
──────────────────────────────────────────── */
function AboutPage() {
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [agentsCount,   setAgentsCount]   = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active')
      .then(({ count }) => { if (isMounted) setListingsCount(count ?? 0); });
    supabase.from('profiles').select('id', { count: 'exact', head: true }).in('badge_level', ['verified', 'pro'])
      .then(({ count }) => { if (isMounted) setAgentsCount(count ?? 0); });
    return () => { isMounted = false; };
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={styles.heroLogo}>darni</Text>
        <Text style={styles.heroTagline}>L'immobilier en Algérie,{'\n'}en toute sérénité.</Text>
        <Text style={styles.heroSub}>
          La première application immobilière dédiée au marché algérien — pour les particuliers et les professionnels.
        </Text>
      </View>

      {/* ── Stats — chiffres réels depuis Supabase, pas de valeurs inventées ── */}
      <View style={styles.statsRow}>
        <StatBox num="48" label="Wilayas" />
        <View style={styles.statDivider} />
        <StatBox num={listingsCount === null ? '…' : String(listingsCount)} label="Annonces actives" />
        <View style={styles.statDivider} />
        <StatBox num={agentsCount === null ? '…' : String(agentsCount)} label="Agents vérifiés" />
      </View>

      {/* ── Mission ── */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabelText}>Notre mission</Text>
        </View>
        <Text style={styles.missionTitle}>
          Rendre l'immobilier algérien transparent et accessible à tous.
        </Text>
        <Text style={styles.missionBody}>
          Darni a été créé pour répondre à un besoin réel : simplifier la recherche, la vente et la location de biens immobiliers en Algérie. Que vous soyez acheteur, vendeur, locataire ou agent, Darni vous accompagne à chaque étape.
        </Text>
      </View>

      {/* ── Ce que nous offrons ── */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabelText}>Ce que nous offrons</Text>
        </View>
        <View style={styles.offersGrid}>
          <OfferCard
            icon="⊕"
            title="Annonces vérifiées"
            desc="Chaque annonce est contrôlée pour garantir l'authenticité des informations."
            bg="#EEF2FF"
          />
          <OfferCard
            icon="◉"
            title="Agents certifiés"
            desc="Un réseau d'agents immobiliers professionnels et vérifiés dans toute l'Algérie."
            bg="#F0FDF4"
          />
          <OfferCard
            icon="⌕"
            title="Recherche avancée"
            desc="Filtrez par wilaya, type de bien, budget et superficie pour trouver le bien idéal."
            bg="#FFF7ED"
          />
          <OfferCard
            icon="⊞"
            title="Vue sur carte"
            desc="Explorez les biens disponibles sur une carte interactive centrée sur l'Algérie."
            bg="#F0F9FF"
          />
        </View>
      </View>

      {/* ── Couverture ── */}
      <View style={styles.coverageBanner}>
        <Text style={styles.coverageTitle}>Présent dans toute l'Algérie</Text>
        <Text style={styles.coverageBody}>
          D'Alger à Tamanrasset, d'Oran à Annaba — Darni couvre les 48 wilayas d'Algérie avec des annonces locales et des agents de proximité.
        </Text>
        {/* Représentation visuelle simple des régions */}
        <View style={styles.coverageRegions}>
          {['Nord', 'Centre', 'Est', 'Ouest', 'Sud'].map(r => (
            <View key={r} style={styles.regionChip}>
              <Text style={styles.regionChipText}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Nos valeurs ── */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabelText}>Nos valeurs</Text>
        </View>
        <View style={styles.valuesCard}>
          <ValueRow
            icon="◈"
            title="Transparence"
            desc="Des annonces vérifiées, des prix affichés, des agents identifiés."
          />
          <View style={styles.valueSep} />
          <ValueRow
            icon="⊛"
            title="Innovation"
            desc="Google Maps intégré, recherche intelligente, interface moderne."
          />
          <View style={styles.valueSep} />
          <ValueRow
            icon="◎"
            title="Confiance"
            desc="Une communauté d'acheteurs, vendeurs et professionnels de confiance."
          />
        </View>
      </View>

      {/* ── Pour les professionnels ── */}
      <View style={[styles.proBanner]}>
        <View style={{ flex: 1 }}>
          <View style={styles.proNewBadge}>
            <Text style={styles.proNewText}>DARNI PRO</Text>
          </View>
          <Text style={styles.proTitle}>Vous êtes agent ou agence ?</Text>
          <Text style={styles.proBody}>
            Rejoignez le réseau Darni Pro — annonces illimitées, profil vérifié et accès à des milliers d'acheteurs et locataires.
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 32, opacity: 0.5 }}>⊕</Text>
      </View>

      {/* ── Contact CTA ── */}
      <View style={[styles.section, { marginBottom: 8 }]}>
        <Text style={styles.ctaTitle}>Une question ? Contactez-nous.</Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => Linking.openURL('mailto:support@darni.app?subject=Darni Support')}
        >
          <Text style={styles.ctaBtnText}>support@darni.app</Text>
        </TouchableOpacity>
        <Text style={styles.version}>darni · Version 1.0.0 · Fait avec passion en Algérie</Text>
      </View>

    </ScrollView>
  );
}

/* ────────────────────────────────────────────
   SCREEN PRINCIPAL
──────────────────────────────────────────── */
export function AboutScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const type: ContentKey = route?.params?.type ?? 'about';

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: DARK }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'about'   ? 'À propos de Darni'
          : type === 'cgu'    ? "Conditions d'utilisation"
          : type === 'privacy'? 'Politique de confidentialité'
          :                     'Nous contacter'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Contenu */}
      {type === 'about' ? (
        <AboutPage />
      ) : (
        <ScrollView contentContainerStyle={styles.textContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.textBody}>{TEXT_CONTENT[type as Exclude<ContentKey,'about'>].body}</Text>
          {type === 'contact' && (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => Linking.openURL('mailto:support@darni.app?subject=Darni Support')}
            >
              <Text style={styles.ctaBtnText}>Envoyer un email</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.version}>darni · Version 1.0.0</Text>
        </ScrollView>
      )}
    </View>
  );
}

/* ────────────────────────────────────────────
   STYLES
──────────────────────────────────────────── */
const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: DARK },

  /* Hero */
  hero: {
    backgroundColor: BLUE,
    paddingHorizontal: 24, paddingTop: 36, paddingBottom: 40,
  },
  heroLogo:    { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 14, opacity: 0.95 },
  heroTagline: { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 32, marginBottom: 14 },
  heroSub:     { fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 22 },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16, marginTop: -20,
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
    alignItems: 'center',
  },
  statBox:     { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: 26, fontWeight: '900', color: BLUE },
  statLabel:   { fontSize: 12, color: GRAY, marginTop: 3, textAlign: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: BORDER },

  /* Section */
  section:        { paddingHorizontal: 16, marginTop: 28 },
  sectionLabelRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionAccent:  { width: 4, height: 18, backgroundColor: BLUE, borderRadius: 2 },
  sectionLabelText:{ fontSize: 13, fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Mission */
  missionTitle: { fontSize: 20, fontWeight: '800', color: DARK, lineHeight: 28, marginBottom: 12 },
  missionBody:  { fontSize: 15, color: GRAY, lineHeight: 24 },

  /* Offres */
  offersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  offerCard:  { width: (W - 44) / 2, borderRadius: 14, padding: 16 },
  offerIconWrap:{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  offerIcon:  { fontSize: 20 },
  offerTitle: { fontSize: 14, fontWeight: '700', color: DARK, marginBottom: 6 },
  offerDesc:  { fontSize: 12, color: GRAY, lineHeight: 18 },

  /* Couverture */
  coverageBanner: {
    marginHorizontal: 16, marginTop: 28,
    backgroundColor: '#0F2D4A',
    borderRadius: 16, padding: 20,
  },
  coverageTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 10 },
  coverageBody:    { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginBottom: 16 },
  coverageRegions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionChip:      { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  regionChipText:  { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* Valeurs */
  valuesCard:   { backgroundColor: '#F8F9FF', borderRadius: 14, padding: 6, borderWidth: 1, borderColor: BORDER },
  valueRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14 },
  valueIconWrap:{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  valueTitle:   { fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 4 },
  valueDesc:    { fontSize: 13, color: GRAY, lineHeight: 20 },
  valueSep:     { height: 1, backgroundColor: BORDER, marginHorizontal: 14 },

  /* Pro banner */
  proBanner: {
    marginHorizontal: 16, marginTop: 28,
    backgroundColor: '#00513F',
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  proNewBadge: { backgroundColor: '#EF4444', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 8 },
  proNewText:  { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  proTitle:    { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  proBody:     { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  /* CTA */
  ctaTitle:  { fontSize: 16, fontWeight: '700', color: DARK, textAlign: 'center', marginBottom: 14, marginTop: 28 },
  ctaBtn:    { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  ctaBtnText:{ color: '#fff', fontSize: 15, fontWeight: '700' },
  version:   { textAlign: 'center', color: GRAY_LT, fontSize: 12, marginTop: 8 },

  /* Text pages (CGU etc.) */
  textContainer: { padding: 20, paddingBottom: 60 },
  textBody:      { fontSize: 15, color: DARK, lineHeight: 26 },
});