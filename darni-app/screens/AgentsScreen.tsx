/**
 * AgentsScreen.tsx — Darni
 * Liste agents & agences — cliquable vers AgentProfileScreen
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#1B4FD8'; const DARK = '#111827';
const GRAY = '#6B7280'; const GRAY_LT = '#9CA3AF'; const BORDER = '#E5E7EB';

const MOCK_AGENTS = [
  { id: '1', name: 'Karim Mansouri',   agency: 'Immo Alger',   wilaya: 'Alger',       listings: 12, verified: true,  color: '#4A90D9', phone: '+213555010101' },
  { id: '2', name: 'Sara Bensalem',    agency: 'Premium Immo', wilaya: 'Oran',        listings: 8,  verified: true,  color: '#E8A87C', phone: '+213555020202' },
  { id: '3', name: 'Mohamed Aissaoui', agency: 'Biens & Co',   wilaya: 'Alger',       listings: 15, verified: true,  color: '#7BB8A0', phone: '+213555030303' },
  { id: '4', name: 'Yasmine Hamdi',    agency: 'El Immo',      wilaya: 'Constantine', listings: 6,  verified: false, color: '#D4789C', phone: '+213555040404' },
  { id: '5', name: 'Amine Tabet',      agency: 'Top Immo',     wilaya: 'Alger',       listings: 20, verified: true,  color: '#5E8BC8', phone: '+213555050505' },
  { id: '6', name: 'Nadia Ferhat',     agency: 'Casa+',        wilaya: 'Annaba',      listings: 9,  verified: true,  color: '#9B7EC8', phone: '+213555060606' },
];

const MOCK_AGENCIES = [
  { id: 'a1', name: 'Premium Immo', wilaya: 'Alger',       agents: 5, listings: 48, color: '#4A90D9', phone: '+213555100100' },
  { id: 'a2', name: 'Biens & Co',   wilaya: 'Oran',        agents: 3, listings: 31, color: '#7BB8A0', phone: '+213555100200' },
  { id: 'a3', name: 'El Immo',      wilaya: 'Constantine', agents: 4, listings: 22, color: '#E8A87C', phone: '+213555100300' },
  { id: 'a4', name: 'Top Immo',     wilaya: 'Alger',       agents: 8, listings: 67, color: '#5E8BC8', phone: '+213555100400' },
];

export function AgentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'agents' | 'agences'>('agents');
  const [search,    setSearch]    = useState('');

  const q = search.toLowerCase();
  const filteredAgents   = MOCK_AGENTS.filter(a => a.name.toLowerCase().includes(q) || a.wilaya.toLowerCase().includes(q));
  const filteredAgencies = MOCK_AGENCIES.filter(a => a.name.toLowerCase().includes(q) || a.wilaya.toLowerCase().includes(q));

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
        {activeTab === 'agents'
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
                  <Text style={styles.agentAgency}>{agent.agency}</Text>
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
                  <Text style={styles.agentMeta}>{agency.wilaya}</Text>
                  <Text style={styles.agentMeta}>{agency.agents} agents · {agency.listings} annonces</Text>
                </View>
                <Text style={{ color: GRAY_LT, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))
        }
        {(activeTab === 'agents' ? filteredAgents : filteredAgencies).length === 0 && (
          <Text style={{ textAlign: 'center', color: GRAY_LT, marginTop: 40, fontSize: 14 }}>
            Aucun résultat pour "{search}"
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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