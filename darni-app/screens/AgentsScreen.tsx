/**
 * AgentsScreen.tsx — Darni
 * Liste agents & agences — cliquable vers AgentProfileScreen
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

import { BLUE, DARK, GRAY, GRAY_LT, BORDER } from '../lib/theme';

// Palette de couleurs d'avatar assignée de façon stable par agent (pas de champ "color" en base)
const AVATAR_COLORS = ['#4A90D9', '#E8A87C', '#7BB8A0', '#D4789C', '#5E8BC8', '#9B7EC8'];
const colorFor = (id: string) => {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

type AgentRow = {
  id: string; name: string; wilaya: string; listings: number;
  verified: boolean; color: string; phone: string;
};

export function AgentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'agents' | 'agences'>('agents');
  const [search,    setSearch]    = useState('');
  const [agents,    setAgents]    = useState<AgentRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadAgents() {
      setLoading(true);
      setLoadError('');
      // Profils qui possèdent au moins une annonce, avec le compte d'annonces
      // et la wilaya la plus fréquente de leurs biens.
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, badge_level, listings:listings(wilaya)')
        .not('listings', 'is', null);

      if (!isMounted) return;
      if (error) {
        console.error('Erreur chargement agents:', error.message);
        setAgents([]);
        setLoadError("Impossible de charger les agents. Vérifiez votre connexion.");
        setLoading(false);
        return;
      }

      const rows: AgentRow[] = (data ?? [])
        .filter((p: any) => p.listings && p.listings.length > 0)
        .map((p: any) => {
          const wilayaCounts: Record<string, number> = {};
          for (const l of p.listings) {
            if (l.wilaya) wilayaCounts[l.wilaya] = (wilayaCounts[l.wilaya] ?? 0) + 1;
          }
          const topWilaya = Object.entries(wilayaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
          return {
            id: p.id,
            name: p.full_name ?? 'Agent Darni',
            wilaya: topWilaya,
            listings: p.listings.length,
            verified: p.badge_level === 'verified' || p.badge_level === 'pro',
            color: colorFor(p.id),
            phone: p.phone ?? '',
          };
        });

      setAgents(rows);
      setLoading(false);
    }
    loadAgents();
    return () => { isMounted = false; };
  }, [reloadKey]);

  // Regroupement par agence — pas encore de vraie notion "agence" en base,
  // donc chaque agent verifié agit comme sa propre fiche pour l'instant.
  const agencies = useMemo(() => agents.filter(a => a.verified), [agents]);

  const q = search.toLowerCase();
  const filteredAgents   = agents.filter(a => a.name.toLowerCase().includes(q) || a.wilaya.toLowerCase().includes(q));
  const filteredAgencies = agencies.filter(a => a.name.toLowerCase().includes(q) || a.wilaya.toLowerCase().includes(q));

  const goToProfile = (item: any) => {
    navigation.navigate('AgentProfile', { agent: item });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: '#111827' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agents & Agences</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={{ fontSize: 16, color: GRAY_LT, marginRight: 8 }}>⌕</Text>
        <TextInput placeholder="Rechercher par nom ou wilaya..." value={search}
          onChangeText={setSearch} style={{ flex: 1, fontSize: 14, color: DARK, paddingVertical: 12 }}
          placeholderTextColor={GRAY_LT} />
      </View>

      <View style={styles.toggleRow}>
        {(['agents', 'agences'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[styles.toggleBtn, activeTab === tab && styles.toggleBtnActive]}>
            <Text style={[styles.toggleText, activeTab === tab && styles.toggleTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={BLUE} />
          </View>
        )}
        {!loading && loadError !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity onPress={() => setReloadKey(k => k + 1)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
        {!loading && loadError === '' && activeTab === 'agents'
          ? filteredAgents.map(agent => (
              <TouchableOpacity key={agent.id} style={styles.card} onPress={() => goToProfile(agent)}>
                <View style={[styles.avatar, { backgroundColor: agent.color }]}>
                  <Text style={styles.avatarText}>
                    {agent.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    {agent.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Vérifié</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.agentMeta}>{agent.wilaya} · {agent.listings} annonces</Text>
                </View>
                <Text style={{ color: GRAY_LT, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))
          : filteredAgencies.map(agency => (
              <TouchableOpacity key={agency.id} style={styles.card} onPress={() => goToProfile({ ...agency, name: agency.name, verified: true })}>
                <View style={[styles.avatar, { backgroundColor: agency.color, borderRadius: 12 }]}>
                  <Text style={styles.avatarText}>{agency.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{agency.name}</Text>
                  <Text style={styles.agentMeta}>{agency.wilaya} · {agency.listings} annonces</Text>
                </View>
                <Text style={{ color: GRAY_LT, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))
        }
        {!loading && loadError === '' && (activeTab === 'agents' ? filteredAgents : filteredAgencies).length === 0 && (
          <Text style={{ textAlign: 'center', color: GRAY_LT, marginTop: 40, fontSize: 14 }}>
            {search ? `Aucun résultat pour "${search}"` : 'Aucun agent pour le moment'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox:         { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 16, alignItems: 'center', gap: 10 },
  errorText:        { fontSize: 13, color: '#991B1B', textAlign: 'center' },
  retryBtn:         { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  retryText:        { fontSize: 13, fontWeight: '700', color: '#991B1B' },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:          { width: 36, height: 36, justifyContent: 'center' },
  headerTitle:      { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: DARK },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, marginHorizontal: 16, marginVertical: 12 },
  toggleRow:        { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 8 },
  toggleBtn:        { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  toggleBtnActive:  { backgroundColor: BLUE },
  toggleText:       { fontSize: 14, fontWeight: '600', color: GRAY },
  toggleTextActive: { color: '#fff' },
  card:             { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: BORDER, elevation: 2 },
  avatar:           { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  agentName:        { fontSize: 15, fontWeight: '700', color: DARK },
  agentAgency:      { fontSize: 13, color: GRAY, marginTop: 2 },
  agentMeta:        { fontSize: 12, color: GRAY_LT, marginTop: 2 },
  verifiedBadge:    { backgroundColor: '#D1FAE5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText:     { fontSize: 10, color: '#065F46', fontWeight: '700' },
});