/**
 * ProfileScreen.tsx — Darni
 * Affiché dans l'onglet Connexion quand l'utilisateur est connecté
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const BLUE    = '#1B4FD8';
const DARK    = '#111827';
const GRAY    = '#6B7280';
const GRAY_LT = '#9CA3AF';
const BORDER  = '#E5E7EB';
const BG      = '#F7F8FA';

/* Avatar initiales */
function Avatar({ email, size = 72 }: { email: string; size?: number }) {
  const initials = email.substring(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.36, fontWeight: '800' }}>{initials}</Text>
    </View>
  );
}

/* Ligne de menu */
function MenuItem({
  icon, label, sublabel, onPress, danger = false, badge,
}: {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; danger?: boolean; badge?: number;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconWrap, danger && { backgroundColor: '#FEE2E2' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={{ color: GRAY_LT, fontSize: 18 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export function ProfileScreen({ navigation }: any) {
  const insets     = useSafeAreaInsets();
  const [user,     setUser]     = useState<any>(null);
  const [nbListings, setNbListings] = useState(0);
  const [statsError, setStatsError] = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', data.user.id)
          .then(({ count, error }) => {
            if (error) setStatsError(true);
            else setNbListings(count ?? 0);
          });
      }
      setLoading(false);
    });
  }, []);

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={BLUE} size="large" />
      </View>
    );
  }

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? 'Utilisateur';

  const isGoogleUser = user?.app_metadata?.provider === 'google';

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Header profil */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Avatar email={user?.email ?? 'U'} size={72} />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {isGoogleUser && (
            <View style={styles.googleBadge}>
              <Text style={styles.googleBadgeText}>Connecté via Google</Text>
            </View>
          )}
        </View>

        {/* Stats rapides */}
        {statsError ? (
          <View style={styles.statsErrorBox}>
            <Text style={styles.statsErrorText}>Statistiques indisponibles pour le moment.</Text>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{nbListings}</Text>
              <Text style={styles.statLabel}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLabel}>Max gratuit</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: nbListings >= 5 ? '#EF4444' : '#10B981' }]}>
                {Math.max(0, 5 - nbListings)}
              </Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
          </View>
        )}

        {/* Menu principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="📋"
              label="Mes annonces"
              sublabel={`${nbListings} annonce${nbListings > 1 ? 's' : ''} publiée${nbListings > 1 ? 's' : ''}`}
              badge={nbListings}
              onPress={() => navigation.navigate('MesAnnonces')}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon="♡"
              label="Mes favoris"
              sublabel="Biens sauvegardés"
              onPress={() => {}}
            />
            <View style={styles.menuSep} />
            <MenuItem
              icon="+"
              label="Publier une annonce"
              sublabel={nbListings >= 5 ? 'Limite atteinte — passer Pro' : `${5 - nbListings} annonce${5 - nbListings > 1 ? 's' : ''} gratuite${5 - nbListings > 1 ? 's' : ''} restante${5 - nbListings > 1 ? 's' : ''}`}
              onPress={() => navigation.navigate('Publier')}
            />
          </View>
        </View>

        {/* Abonnement */}
        {nbListings >= 5 && (
          <TouchableOpacity style={styles.proCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitle}>Passez à Darni Pro</Text>
              <Text style={styles.proSub}>Annonces illimitées + boost · 2 000 DA/mois</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        )}

        {/* Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="⚙" label="Paramètres" onPress={() => {}} />
            <View style={styles.menuSep} />
            <MenuItem icon="?" label="Aide & Support" onPress={() => {}} />
            <View style={styles.menuSep} />
            <MenuItem icon="i" label="À propos de Darni" sublabel="Version 1.0.0" onPress={() => {}} />
          </View>
        </View>

        {/* Déconnexion */}
        <View style={[styles.section, { marginBottom: 8 }]}>
          <View style={styles.menuCard}>
            <MenuItem icon="⏻" label="Se déconnecter" danger onPress={handleSignOut} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { backgroundColor: '#fff', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: BORDER },
  userName:      { fontSize: 20, fontWeight: '800', color: DARK, marginTop: 12 },
  userEmail:     { fontSize: 14, color: GRAY, marginTop: 4 },
  googleBadge:   { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  googleBadgeText:{ fontSize: 12, color: BLUE, fontWeight: '600' },

  statsRow:   { flexDirection: 'row', backgroundColor: '#fff', marginTop: 12, marginHorizontal: 16, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statsErrorBox:  { backgroundColor: '#FEF2F2', marginTop: 12, marginHorizontal: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#FECACA' },
  statsErrorText: { fontSize: 13, color: '#991B1B', textAlign: 'center' },
  statBox:    { flex: 1, alignItems: 'center' },
  statNum:    { fontSize: 22, fontWeight: '900', color: BLUE },
  statLabel:  { fontSize: 11, color: GRAY, marginTop: 2 },
  statDivider:{ width: 1, height: 32, backgroundColor: BORDER },

  section:      { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: GRAY, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard:     { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  menuItem:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 9, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  menuLabel:    { fontSize: 15, fontWeight: '600', color: DARK },
  menuSublabel: { fontSize: 12, color: GRAY, marginTop: 1 },
  menuSep:      { height: 1, backgroundColor: BORDER, marginLeft: 64 },
  badge:        { backgroundColor: BLUE, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },

  proCard: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#00513F', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  proTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  proSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
});