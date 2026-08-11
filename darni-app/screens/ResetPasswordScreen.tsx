import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const GRAY_LT = '#9CA3AF'; const BORDER = '#E5E7EB';

export function ResetPasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Vérifie qu'on a bien une session active (injectée via le deep link)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
      } else {
        setError('Lien invalide ou expiré. Recommencez depuis l\'application.');
      }
    });
  }, []);

  const handleReset = async () => {
    if (!password || !confirm) {
      setError('Merci de remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true); setError(''); setSuccess('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess('Mot de passe mis à jour ! Vous pouvez vous connecter.');
      setTimeout(() => navigation.replace('Main'), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>darni</Text>
        <Text style={styles.title}>Nouveau mot de passe</Text>
        <Text style={styles.subtitle}>Choisissez un nouveau mot de passe pour votre compte.</Text>

        {!sessionReady && !error && (
          <ActivityIndicator color={BLUE} size="large" style={{ marginTop: 40 }} />
        )}

        {sessionReady && (
          <>
            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Nouveau mot de passe"
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                style={styles.input}
                secureTextEntry={!showPassword}
                placeholderTextColor={GRAY_LT}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                placeholder="Confirmer le mot de passe"
                value={confirm}
                onChangeText={t => { setConfirm(t); setError(''); }}
                style={styles.input}
                secureTextEntry={!showPassword}
                placeholderTextColor={GRAY_LT}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginBottom: 12, marginTop: -4 }}
              onPress={() => setShowPassword(v => !v)}
            >
              <Text style={{ color: GRAY_LT, fontSize: 13 }}>
                {showPassword ? 'Cacher' : 'Voir'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.65 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.btnText}>Changer le mot de passe</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!!success && <Text style={styles.successText}>{success}</Text>}

        <TouchableOpacity
          style={{ marginTop: 20, alignItems: 'center' }}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={{ color: GRAY, fontSize: 14 }}>← Retour à l'accueil</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logo:        { fontSize: 32, fontWeight: '900', color: BLUE, letterSpacing: -1, marginBottom: 36 },
  title:       { fontSize: 26, fontWeight: '800', color: DARK, marginBottom: 8 },
  subtitle:    { fontSize: 15, color: GRAY, marginBottom: 28 },
  inputWrap:   { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12 },
  input:       { fontSize: 15, color: DARK, paddingVertical: 14 },
  errorText:   { color: '#EF4444', fontSize: 13, marginBottom: 12, marginTop: 8 },
  successText: { color: '#059669', fontSize: 13, marginBottom: 12, marginTop: 8 },
  btn:         { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4, elevation: 3 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});