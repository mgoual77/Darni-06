import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
  Dimensions,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');
const BLUE     = '#1B4FD8';
const DARK     = '#111827';
const GRAY     = '#6B7280';
const GRAY_LT  = '#9CA3AF';
const BORDER   = '#E5E7EB';
const BG       = '#F7F8FA';
const MAX_FREE = 5;
const GOOGLE_API_KEY = 'AIzaSyCbCrbbocArzRzzr0MYohUw6h0goJEhKlc';

const TYPES = [
  { key: 'appartement', label: 'Appartement' },
  { key: 'villa',       label: 'Villa'        },
  { key: 'bureau',      label: 'Bureau'       },
  { key: 'local',       label: 'Local commercial' },
  { key: 'terrain',     label: 'Terrain'      },
  { key: 'autre',       label: 'Autre'        },
];

const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif',
  'Tizi Ouzou', 'Béjaïa', 'Batna', 'Tlemcen', 'Djelfa', 'Biskra',
  'Médéa', 'Mostaganem', "M'Sila",
];

const STEPS = ['Type', 'Détails', 'Contact'];

function formatPriceLabel(val: string): string {
  const n = Number(val);
  if (!n) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Mrd DA`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} M DA`;
  return `${n.toLocaleString('fr-DZ')} DA`;
}

/* ─────────────────────────────────────────────
   ÉCRAN PAYWALL — limite 5 annonces atteinte
───────────────────────────────────────────── */
function PaywallScreen({ used, navigation }: { used: number; navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={[styles.paywallContainer, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paywallIcon}>
          <Text style={{ fontSize: 36 }}>⊕</Text>
        </View>

        <Text style={styles.paywallTitle}>Limite atteinte</Text>
        <Text style={styles.paywallSub}>
          Vous avez utilisé <Text style={{ fontWeight: '800', color: BLUE }}>{used}/{MAX_FREE}</Text> annonces gratuites.{'\n'}
          Passez à Darni Pro pour continuer à publier sans limite.
        </Text>

        <View style={styles.progressBarWrap}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((used / MAX_FREE) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{used}/{MAX_FREE} annonces</Text>
        </View>

        <TouchableOpacity style={styles.proCard} activeOpacity={0.88}
          onPress={() => Alert.alert('Darni Pro', 'Le paiement Chargily (DA) arrive très bientôt.')}>
          <View style={styles.proCardHeader}>
            <View style={styles.proBadge}><Text style={styles.proBadgeText}>POPULAIRE</Text></View>
            <Text style={styles.proCardTitle}>Darni Pro Algérie</Text>
            <View style={styles.priceRow}>
              <Text style={styles.proPrice}>2 000</Text>
              <Text style={styles.proPriceSuffix}> DA / mois</Text>
            </View>
          </View>
          <View style={styles.proFeatures}>
            {[
              'Annonces illimitées',
              'Badge "Pro" sur votre profil',
              'Mise en avant dans les résultats',
              'Boost d\'annonce 1 000 DA/annonce',
              'Support prioritaire',
            ].map((f, i) => (
              <View key={i} style={styles.proFeatureRow}>
                <Text style={styles.proFeatureCheck}>✓</Text>
                <Text style={styles.proFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.proCardCta}>
            <Text style={styles.proCardCtaText}>Passer à Pro — 2 000 DA/mois</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.proCardAlt} activeOpacity={0.88}
          onPress={() => Alert.alert('Darni Pro International', 'Le paiement Stripe (€) arrive très bientôt.')}>
          <View>
            <Text style={styles.proCardAltTitle}>Darni Pro Diaspora</Text>
            <Text style={styles.proCardAltSub}>Pour les Algériens à l'étranger</Text>
          </View>
          <View style={styles.proAltRight}>
            <Text style={styles.proAltPrice}>7 €</Text>
            <Text style={styles.proAltSuffix}>/mois</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backFreeBtn}
          onPress={() => navigation.navigate('Accueil')}>
          <Text style={styles.backFreeBtnText}>Continuer sans abonnement</Text>
        </TouchableOpacity>

        <Text style={styles.paywallNote}>
          Paiement sécurisé · Annulation à tout moment · Sans engagement
        </Text>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────────────────────────
   ÉCRAN LOGIN REQUIS
───────────────────────────────────────────── */
function LoginRequiredScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.loginRequired, { paddingTop: insets.top + 40 }]}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>⊕</Text>
      <Text style={styles.loginTitle}>Connectez-vous pour publier</Text>
      <Text style={styles.loginSub}>
        Créez un compte gratuit pour publier vos annonces et les gérer facilement.
      </Text>
      <TouchableOpacity style={styles.loginBtn}
        onPress={() => navigation.navigate('Connexion')}>
        <Text style={styles.loginBtnText}>Se connecter / S'inscrire</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 14 }}
        onPress={() => navigation.navigate('Accueil')}>
        <Text style={{ color: GRAY, fontSize: 14 }}>Continuer sans compte</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─────────────────────────────────────────────
   POST SCREEN PRINCIPAL
───────────────────────────────────────────── */
export function PostScreen({ navigation }: any) {
  const insets  = useSafeAreaInsets();
  const [authReady,    setAuthReady]    = useState(false);
  const [user,         setUser]         = useState<any>(null);
  const [listingCount, setListingCount] = useState(0);
  const [step,         setStep]         = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [form, setForm] = useState({
    transaction: 'vente', type: '', title: '', description: '',
    price: '', surface: '', bedrooms: '', rooms: '',
    wilaya: '', commune: '', quartier: '', phone: '', whatsapp: '',
    lat: null as number | null, lng: null as number | null,
  });

  const update = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const { count } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', u.id);
        setListingCount(count ?? 0);
      }
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user ?? null;
      setUser(u);
      if (u) {
        const { count } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', u.id);
        setListingCount(count ?? 0);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, [navigation]);

  const canGoNext = () => {
    if (step === 0) return form.type !== '' && form.wilaya !== '';
    if (step === 1) return form.price !== '';
    return true;
  };

  const submit = async () => {
    if (!form.phone) { Alert.alert('Requis', 'Entrez votre numéro de téléphone.'); return; }
    setLoading(true);
    const { error } = await supabase.from('listings').insert([{
      transaction:  form.transaction,
      type:         form.type,
      title:        form.title || null,
      description:  form.description || null,
      price:        Number(form.price),
      surface:      form.surface   ? Number(form.surface)   : null,
      bedrooms:     form.bedrooms  ? Number(form.bedrooms)  : null,
      rooms:        form.rooms     ? Number(form.rooms)     : null,
      wilaya:       form.wilaya,
      commune:      form.commune  || null,
      quartier:     form.quartier || null,
      lat:          form.lat,
      lng:          form.lng,
      phone:        form.phone,
      whatsapp:     form.whatsapp || form.phone,
      status:       'active',
      user_id:      user?.id ?? null,
    }]);
    setLoading(false);
    if (error) { Alert.alert('Erreur', error.message); return; }
    setListingCount(c => c + 1);
    Alert.alert('Annonce publiée !', 'Votre annonce est maintenant visible sur Darni.', [
      { text: 'OK', onPress: () => {
        setStep(0);
        setForm({ transaction: 'vente', type: '', title: '', description: '', price: '', surface: '', bedrooms: '', rooms: '', wilaya: '', commune: '', quartier: '', phone: '', whatsapp: '', lat: null, lng: null });
      }}
    ]);
  };

  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={BLUE} size="large" />
      </View>
    );
  }

  if (!user) return <LoginRequiredScreen navigation={navigation} />;
  if (listingCount >= MAX_FREE) return <PaywallScreen used={listingCount} navigation={navigation} />;

  /* ── Formulaire normal ── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER — fix SafeAreaView Samsung */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Publier une annonce</Text>
          <View style={[
            styles.quotaBadge,
            listingCount >= MAX_FREE - 1 && { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }
          ]}>
            <Text style={[
              styles.quotaText,
              listingCount >= MAX_FREE - 1 && { color: '#EF4444' }
            ]}>
              {MAX_FREE - listingCount} gratuite{MAX_FREE - listingCount > 1 ? 's' : ''} restante{MAX_FREE - listingCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Gratuit · Rapide · Efficace</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} />
        </View>
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, i < step && styles.stepDone, i === step && styles.stepActive]}>
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
                  {i < step ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ÉTAPE 1 */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>Transaction</Text>
            <View style={styles.transRow}>
              {[{ val: 'vente', label: 'Vendre' }, { val: 'location', label: 'Louer' }].map(opt => (
                <TouchableOpacity key={opt.val} onPress={() => update('transaction', opt.val)}
                  style={[styles.transCard, form.transaction === opt.val && styles.transCardActive]}>
                  <Text style={[styles.transLabel, form.transaction === opt.val && styles.transLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Type de bien *</Text>
            <View style={styles.typeGrid}>
              {TYPES.map(t => (
                <TouchableOpacity key={t.key} onPress={() => update('type', t.key)}
                  style={[styles.typeChip, form.type === t.key && styles.typeChipActive]}>
                  <Text style={[styles.typeChipText, form.type === t.key && styles.typeChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Wilaya *</Text>
            <View style={styles.wilayaGrid}>
              {WILAYAS.map(w => (
                <TouchableOpacity key={w} onPress={() => update('wilaya', w)}
                  style={[styles.wilayaChip, form.wilaya === w && styles.wilayaChipActive]}>
                  <Text style={[styles.wilayaChipText, form.wilaya === w && styles.wilayaChipTextActive]}>
                    {w}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Localisation précise (Google)</Text>
            <GooglePlacesAutocomplete
              placeholder="Quartier, rue, commune..."
              onPress={(data, details) => {
                const components = details?.address_components ?? [];
                let commune = '', quartier = '';
                for (const c of components) {
                  if (c.types.includes('locality')) commune = c.long_name;
                  if (c.types.includes('sublocality') || c.types.includes('neighborhood')) quartier = c.long_name;
                }
                update('commune', commune);
                update('quartier', quartier);
                update('lat', details?.geometry?.location?.lat ?? null);
                update('lng', details?.geometry?.location?.lng ?? null);
              }}
              query={{ key: GOOGLE_API_KEY, language: 'fr', components: 'country:dz' }}
              fetchDetails
              styles={{
                container: { flex: 0, zIndex: 100 },
                textInput: { ...styles.input, height: 44, fontSize: 13 },
                listView: { backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 10, elevation: 4 },
                row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
                description: { fontSize: 13, color: DARK },
              }}
              enablePoweredByContainer={false}
              textInputProps={{ placeholderTextColor: GRAY_LT }}
            />
          </View>
        )}

        {/* ÉTAPE 2 */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>Titre de l'annonce</Text>
            <TextInput placeholder="Ex: Appartement F3 rénové avec vue mer..."
              value={form.title} onChangeText={v => update('title', v)}
              style={styles.input} placeholderTextColor={GRAY_LT} />

            <Text style={styles.sectionLabel}>Prix (DA) *</Text>
            <View style={styles.priceWrap}>
              <TextInput placeholder="Ex: 8500000" value={form.price}
                onChangeText={v => update('price', v)} keyboardType="numeric"
                style={[styles.input, { marginBottom: 0, flex: 1 }]}
                placeholderTextColor={GRAY_LT} />
              <Text style={styles.priceSuffix}>DA</Text>
            </View>
            {form.price ? <Text style={styles.priceHint}>{formatPriceLabel(form.price)}</Text> : null}

            <View style={styles.specsRow}>
              {[
                { key: 'surface',  label: 'Surface (m²)', ph: '90' },
                { key: 'bedrooms', label: 'Chambres',     ph: '3'  },
                { key: 'rooms',    label: 'Pièces',       ph: '4'  },
              ].map(f => (
                <View key={f.key} style={{ flex: 1 }}>
                  <Text style={styles.sectionLabel}>{f.label}</Text>
                  <TextInput placeholder={f.ph} value={(form as any)[f.key]}
                    onChangeText={v => update(f.key, v)} keyboardType="numeric"
                    style={[styles.input, { textAlign: 'center' }]}
                    placeholderTextColor={GRAY_LT} />
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput placeholder="Décrivez votre bien..."
              value={form.description} onChangeText={v => update('description', v)}
              style={[styles.input, styles.textarea]} multiline numberOfLines={4}
              placeholderTextColor={GRAY_LT} textAlignVertical="top" />
          </View>
        )}

        {/* ÉTAPE 3 */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionLabel}>Téléphone *</Text>
            <TextInput placeholder="0555 123 456" value={form.phone}
              onChangeText={v => update('phone', v)} keyboardType="phone-pad"
              style={styles.input} placeholderTextColor={GRAY_LT} />

            <Text style={styles.sectionLabel}>WhatsApp (optionnel)</Text>
            <TextInput placeholder="Si différent du téléphone" value={form.whatsapp}
              onChangeText={v => update('whatsapp', v)} keyboardType="phone-pad"
              style={styles.input} placeholderTextColor={GRAY_LT} />

            <View style={styles.recap}>
              <Text style={styles.recapTitle}>Récapitulatif</Text>
              {[
                { l: 'Transaction', v: form.transaction === 'vente' ? 'Vente' : 'Location' },
                { l: 'Type',        v: form.type     },
                { l: 'Wilaya',      v: form.wilaya   },
                form.commune ? { l: 'Commune', v: form.commune } : null,
                { l: 'Prix',        v: formatPriceLabel(form.price) },
                form.surface  ? { l: 'Surface', v: `${form.surface} m²` } : null,
              ].filter(Boolean).map((row: any, i) => (
                <View key={i} style={styles.recapRow}>
                  <Text style={styles.recapLabel}>{row.l}</Text>
                  <Text style={styles.recapValue}>{row.v}</Text>
                </View>
              ))}
            </View>

            {listingCount === MAX_FREE - 1 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Attention : c'est votre dernière annonce gratuite. Au-delà, un abonnement Pro sera requis.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        )}
        {step < 2 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canGoNext() && styles.nextBtnDisabled]}
            onPress={() => canGoNext() && setStep(s => s + 1)}
            disabled={!canGoNext()}>
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>Publier l'annonce</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header:       { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: DARK },
  headerSub:    { fontSize: 12, color: GRAY_LT, marginBottom: 12 },
  quotaBadge:   { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#C7D2FE' },
  quotaText:    { fontSize: 11, fontWeight: '700', color: BLUE },
  progressBar:  { height: 3, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: BLUE, borderRadius: 2 },
  stepsRow:     { flexDirection: 'row', justifyContent: 'space-around' },
  stepItem:     { alignItems: 'center', gap: 4 },
  stepCircle:   { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  stepActive:   { backgroundColor: BLUE },
  stepDone:     { backgroundColor: '#059669' },
  stepNum:      { fontSize: 12, fontWeight: '700', color: GRAY_LT },
  stepNumActive:{ color: '#fff' },
  stepLabel:    { fontSize: 11, color: GRAY_LT },
  stepLabelActive: { color: BLUE, fontWeight: '700' },

  body:        { padding: 16, paddingBottom: 100 },
  stepContent: { gap: 4 },
  sectionLabel:{ fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 14 },

  transRow:        { flexDirection: 'row', gap: 12, marginBottom: 4 },
  transCard:       { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: BORDER, backgroundColor: '#fff', alignItems: 'center' },
  transCardActive: { borderColor: BLUE, backgroundColor: '#EEF2FF' },
  transLabel:      { fontSize: 14, fontWeight: '600', color: GRAY },
  transLabelActive:{ color: BLUE },

  typeGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff' },
  typeChipActive:    { borderColor: BLUE, backgroundColor: '#EEF2FF' },
  typeChipText:      { fontSize: 12, fontWeight: '500', color: GRAY },
  typeChipTextActive:{ color: BLUE, fontWeight: '700' },

  wilayaGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  wilayaChip:          { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff' },
  wilayaChipActive:    { borderColor: BLUE, backgroundColor: '#EEF2FF' },
  wilayaChipText:      { fontSize: 12, fontWeight: '500', color: GRAY },
  wilayaChipTextActive:{ color: BLUE, fontWeight: '700' },

  input:       { backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: DARK, marginBottom: 4 },
  textarea:    { height: 90, textAlignVertical: 'top' },
  priceWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingRight: 12, marginBottom: 4 },
  priceSuffix: { fontSize: 13, color: GRAY_LT, fontWeight: '600' },
  priceHint:   { fontSize: 12, color: BLUE, fontWeight: '600', marginBottom: 4 },
  specsRow:    { flexDirection: 'row', gap: 10 },

  recap:       { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: BORDER },
  recapTitle:  { fontSize: 13, fontWeight: '700', color: DARK, marginBottom: 10 },
  recapRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  recapLabel:  { fontSize: 12, color: GRAY_LT },
  recapValue:  { fontSize: 12, fontWeight: '600', color: DARK },

  warningBox:  { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FCD34D' },
  warningText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: BORDER, elevation: 8 },
  backBtn:     { flex: 1, backgroundColor: BG, borderRadius: 10, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: BORDER },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  nextBtn:     { flex: 2, backgroundColor: BLUE, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  submitBtn:   { flex: 2, backgroundColor: BLUE, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },

  paywallContainer: { paddingHorizontal: 24, paddingBottom: 60, alignItems: 'center' },
  paywallIcon:      { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  paywallTitle:     { fontSize: 26, fontWeight: '900', color: DARK, marginBottom: 12, textAlign: 'center' },
  paywallSub:       { fontSize: 15, color: GRAY, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  progressBarWrap:  { width: '100%', marginBottom: 32 },
  progressBarBg:    { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFill:  { height: 8, backgroundColor: '#EF4444', borderRadius: 4 },
  progressText:     { fontSize: 12, color: GRAY, textAlign: 'right' },

  proCard:       { width: '100%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: BLUE, overflow: 'hidden', marginBottom: 12, elevation: 4, shadowColor: BLUE, shadowOpacity: 0.15, shadowRadius: 8 },
  proCardHeader: { backgroundColor: BLUE, padding: 20 },
  proBadge:      { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 },
  proBadgeText:  { fontSize: 10, fontWeight: '800', color: BLUE, letterSpacing: 0.5 },
  proCardTitle:  { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  priceRow:      { flexDirection: 'row', alignItems: 'baseline' },
  proPrice:      { fontSize: 32, fontWeight: '900', color: '#fff' },
  proPriceSuffix:{ fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  proFeatures:   { padding: 20, gap: 10 },
  proFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proFeatureCheck:{ fontSize: 15, color: '#059669', fontWeight: '800' },
  proFeatureText: { fontSize: 14, color: DARK },
  proCardCta:    { backgroundColor: BLUE, margin: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  proCardCtaText:{ color: '#fff', fontSize: 15, fontWeight: '700' },

  proCardAlt:    { width: '100%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  proCardAltTitle:{ fontSize: 15, fontWeight: '700', color: DARK },
  proCardAltSub: { fontSize: 12, color: GRAY, marginTop: 2 },
  proAltRight:   { alignItems: 'flex-end' },
  proAltPrice:   { fontSize: 22, fontWeight: '900', color: BLUE },
  proAltSuffix:  { fontSize: 12, color: GRAY },

  backFreeBtn:     { paddingVertical: 14, alignItems: 'center', marginBottom: 4 },
  backFreeBtnText: { color: GRAY, fontSize: 14, fontWeight: '600' },
  paywallNote:     { fontSize: 11, color: GRAY_LT, textAlign: 'center' },

  loginRequired: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, alignItems: 'center' },
  loginTitle:    { fontSize: 22, fontWeight: '800', color: DARK, marginBottom: 12, textAlign: 'center' },
  loginSub:      { fontSize: 15, color: GRAY, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  loginBtn:      { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center' },
  loginBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});