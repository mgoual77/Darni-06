import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const GRAY_LT = '#9CA3AF'; const BORDER = '#E5E7EB';

function GoogleLogo({ size = 22 }: { size?: number }) {
  const r = size / 2;
  return (
    <View style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 0,    left: 0,  width: r, height: r, backgroundColor: '#4285F4' }} />
      <View style={{ position: 'absolute', top: 0,    right: 0, width: r, height: r, backgroundColor: '#EA4335' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0,  width: r, height: r, backgroundColor: '#FBBC05' }} />
      <View style={{ position: 'absolute', bottom: 0, right: 0, width: r, height: r, backgroundColor: '#34A853' }} />
      <View style={{ position: 'absolute', top: size*0.18, left: size*0.18, width: size*0.64, height: size*0.64, borderRadius: size*0.32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#4285F4', fontSize: size*0.38, fontWeight: '800', lineHeight: size*0.42 }}>G</Text>
      </View>
    </View>
  );
}

type Mode = 'login' | 'signup' | 'forgot';

export function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [mode,          setMode]          = useState<Mode>('login');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const { url } = event;
      if (url.includes('access_token') || url.includes('code=')) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(url);
        if (!err) navigation.replace('Main');
      }
    };
    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    return () => sub.remove();
  }, []);

  const signInWithGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      const redirectUrl = Linking.createURL('/');
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (err || !data?.url) { setError('Erreur Google. Réessayez.'); setGoogleLoading(false); return; }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        const { error: sessErr } = await supabase.auth.exchangeCodeForSession(result.url);
        if (!sessErr) navigation.replace('Main');
        else setError('Erreur de session. Réessayez.');
      }
    } catch { setError('Une erreur est survenue.'); }
    setGoogleLoading(false);
  };

  /* Réinitialisation mot de passe */
  const handleForgot = async () => {
    if (!email) { setError('Entrez votre email d\'abord.'); return; }
    setLoading(true); setError(''); setSuccess('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'darni://reset-password',
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSuccess('Email envoyé ! Vérifiez votre boîte mail.');
  };

  const handleAuth = async () => {
    if (!email || !password) { setError('Merci de remplir tous les champs.'); return; }
    setLoading(true); setError(''); setSuccess('');
    const { error: err } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); }
    else if (mode === 'signup') { setSuccess('Compte créé ! Vérifiez votre email.'); }
    else { navigation.replace('Main'); }
  };

  /* ── Mode "Mot de passe oublié" ── */
  if (mode === 'forgot') {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40 }]}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>darni</Text>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Entrez votre email — on vous envoie un lien de réinitialisation.</Text>

          <View style={styles.inputWrap}>
            <TextInput placeholder="Email" value={email} onChangeText={t => { setEmail(t); setError(''); }}
              style={styles.input} keyboardType="email-address" autoCapitalize="none"
              autoCorrect={false} placeholderTextColor={GRAY_LT} />
          </View>

          {!!error   && <Text style={styles.errorText}>{error}</Text>}
          {!!success && <Text style={styles.successText}>{success}</Text>}

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.65 }]} onPress={handleForgot} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Envoyer le lien</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }}
            onPress={() => { setMode('login'); setError(''); setSuccess(''); }}>
            <Text style={styles.switchText}>← Retour à la connexion</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  /* ── Mode Login / Signup ── */
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={styles.logo}>darni</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Accédez à vos annonces et favoris' : 'Publiez vos biens en quelques minutes'}
        </Text>

        <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} disabled={googleLoading}>
          {googleLoading ? <ActivityIndicator color="#444" size="small" />
            : <><GoogleLogo size={24} /><Text style={styles.googleBtnText}>Continuer avec Google</Text></>}
        </TouchableOpacity>

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.inputWrap}>
          <TextInput placeholder="Email" value={email} onChangeText={t => { setEmail(t); setError(''); }}
            style={styles.input} keyboardType="email-address" autoCapitalize="none"
            autoCorrect={false} placeholderTextColor={GRAY_LT} />
        </View>

        <View style={styles.inputWrap}>
          <TextInput placeholder="Mot de passe" value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            style={styles.input} secureTextEntry placeholderTextColor={GRAY_LT} />
        </View>

        {/* Mot de passe oublié — visible uniquement en mode login */}
        {mode === 'login' && (
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 12, marginTop: -4 }}
            onPress={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
            <Text style={{ color: BLUE, fontSize: 13, fontWeight: '600' }}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        )}

        {!!error   && <Text style={styles.errorText}>{error}</Text>}
        {!!success && <Text style={styles.successText}>{success}</Text>}

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.65 }]} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>{mode === 'login' ? 'Se connecter' : "S'inscrire"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }}
          onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
          <Text style={styles.switchText}>
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }}
          onPress={() => navigation.navigate('Accueil')}>
          <Text style={{ color: GRAY, fontSize: 14 }}>Continuer sans compte →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logo:          { fontSize: 32, fontWeight: '900', color: BLUE, letterSpacing: -1, marginBottom: 36 },
  title:         { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 8 },
  subtitle:      { fontSize: 15, color: GRAY, marginBottom: 28 },
  googleBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingVertical: 14, marginBottom: 20, gap: 12, elevation: 2 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: DARK },
  separator:     { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  separatorLine: { flex: 1, height: 1, backgroundColor: BORDER },
  separatorText: { color: GRAY_LT, fontSize: 13 },
  inputWrap:     { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  input:         { fontSize: 15, color: DARK, paddingVertical: 14 },
  errorText:     { color: '#EF4444', fontSize: 13, marginBottom: 12 },
  successText:   { color: '#059669', fontSize: 13, marginBottom: 12 },
  btn:           { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4, elevation: 3 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText:    { color: BLUE, fontSize: 14, fontWeight: '600' },
});