import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { BLUE, DARK, GRAY, GRAY_LT, BORDER } from '../lib/theme';

WebBrowser.maybeCompleteAuthSession();

// Vrai logo "G" Google (tracé officiel multicolore), identique à celui utilisé
// par les apps qui suivent les Google Sign-In Branding Guidelines.
function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
        c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
        c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
        l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
        c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
        c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
        C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </Svg>
  );
}

type Mode = 'login' | 'signup' | 'forgot';

export function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [mode,          setMode]          = useState<Mode>('login');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  useEffect(() => {
    // Nettoyage session WebBrowser au montage
    WebBrowser.warmUpAsync();
    return () => { WebBrowser.coolDownAsync(); };
  }, []);

  const signInWithGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      // createURL() renvoie exp://<hôte>/--/ sous Expo Go et darni:// en build natif :
      // un scheme figé en dur ne reviendrait jamais dans l'app pendant les tests Expo Go.
      const redirectUrl = Linking.createURL('/');
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });
      if (err || !data?.url) {
        setError('Erreur Google. Réessayez.');
        setGoogleLoading(false);
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (result.type === 'success' && result.url) {
        const { error: sessErr } = await supabase.auth.exchangeCodeForSession(result.url);
        if (!sessErr) navigation.replace('Main');
        else setError('Erreur de session. Réessayez.');
      } else if (result.type === 'cancel') {
        setError('Connexion annulée.');
      }
    } catch {
      setError('Une erreur est survenue.');
    }
    setGoogleLoading(false);
  };

  const handleForgot = async () => {
    if (!email) { setError("Entrez votre email d'abord."); return; }
    setLoading(true); setError(''); setSuccess('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('/reset-password'),
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

  // ── Mode "Mot de passe oublié" ──
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

  // ── Mode Login / Signup ──
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
          {googleLoading
            ? <ActivityIndicator color="#444" size="small" />
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

        <View style={[styles.inputWrap, { flexDirection: 'row', alignItems: 'center' }]}>
          <TextInput
            placeholder="Mot de passe" value={password}
            onChangeText={t => { setPassword(t); setError(''); }}
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
            placeholderTextColor={GRAY_LT}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ paddingHorizontal: 8 }}>
            <Text style={{ color: GRAY_LT, fontSize: 13 }}>{showPassword ? 'Cacher' : 'Voir'}</Text>
          </TouchableOpacity>
        </View>

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