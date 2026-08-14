/**
 * MesAnnoncesScreen.tsx — Darni
 * Liste des annonces de l'utilisateur connecté : voir, activer/désactiver, supprimer.
 * MVP — pas d'édition inline (PostScreen ne sait pas encore charger une annonce existante).
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { BLUE, DARK, GRAY, GRAY_LT, BORDER, BG } from '../lib/theme';
import { smartPrice, firstPhoto } from '../lib/format';

const GREEN = '#16A34A';
const RED   = '#EF4444';

export function MesAnnoncesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [listings,   setListings]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }
    const { data, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError("Impossible de charger vos annonces. Vérifiez votre connexion et réessayez.");
      setListings([]);
    } else {
      setListings(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = navigation?.addListener?.('focus', load);
    return unsubscribe;
  }, [load, navigation]);

  const toggleStatus = async (listing: any) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    setTogglingId(listing.id);
    const { error: updateError } = await supabase
      .from('listings').update({ status: newStatus }).eq('id', listing.id);
    setTogglingId(null);
    if (updateError) {
      Alert.alert('Erreur', "La mise à jour du statut a échoué. Réessayez.");
      return;
    }
    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
  };

  const handleDelete = (listing: any) => {
    Alert.alert(
      'Supprimer cette annonce ?',
      `"${listing.title}" — cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await supabase.from('listings').delete().eq('id', listing.id);
            if (deleteError) {
              Alert.alert('Erreur', "La suppression a échoué. Réessayez.");
              return;
            }
            setListings(prev => prev.filter(l => l.id !== listing.id));
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: DARK }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes annonces</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={BLUE} />
          </View>
        )}

        {!loading && error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && error === '' && listings.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: DARK, marginBottom: 6 }}>
              Aucune annonce publiée
            </Text>
            <Text style={{ fontSize: 13, color: GRAY, marginBottom: 20, textAlign: 'center' }}>
              Publiez votre premier bien en quelques minutes.
            </Text>
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Publier' })}
            >
              <Text style={styles.publishBtnText}>Publier une annonce</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && listings.map(listing => {
          const isActive = listing.status === 'active';
          const isToggling = togglingId === listing.id;
          const location = [listing.commune, listing.wilaya].filter(Boolean).join(', ');

          return (
            <TouchableOpacity
              key={listing.id}
              style={styles.card}
              onPress={() => navigation.navigate('ListingDetail', { listing })}
              activeOpacity={0.85}
            >
              <Image source={{ uri: firstPhoto(listing) }} style={styles.photo} />
              <View style={{ flex: 1, padding: 12 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusBadge, { backgroundColor: isActive ? '#DCFCE7' : '#F3F4F6' }]}>
                    <View style={[styles.statusDot, { backgroundColor: isActive ? GREEN : GRAY_LT }]} />
                    <Text style={[styles.statusText, { color: isActive ? '#166534' : GRAY }]}>
                      {isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.price}>{smartPrice(listing.price, listing.transaction)}</Text>
                <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.location}>📍 {location || listing.wilaya}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    disabled={isToggling}
                    onPress={() => toggleStatus(listing)}
                  >
                    {isToggling
                      ? <ActivityIndicator size="small" color={GRAY} />
                      : <Text style={styles.actionText}>{isActive ? 'Désactiver' : 'Activer'}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(listing)}
                  >
                    <Text style={[styles.actionText, { color: RED }]}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: DARK },

  errorBox:  { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 16, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, color: '#991B1B', textAlign: 'center' },
  retryBtn:  { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  retryText: { fontSize: 13, fontWeight: '700', color: '#991B1B' },

  publishBtn:     { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  publishBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  card:  { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  photo: { width: 100, height: '100%', minHeight: 150, backgroundColor: '#F3F4F6' },

  badgeRow:    { flexDirection: 'row', marginBottom: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 11, fontWeight: '700' },

  price:    { fontSize: 18, fontWeight: '900', color: DARK, letterSpacing: -0.3 },
  title:    { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 2 },
  location: { fontSize: 12, color: GRAY, marginTop: 4 },

  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn:  { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  deleteBtn:  { borderColor: '#FECACA' },
  actionText: { fontSize: 12, fontWeight: '700', color: '#374151' },
});
