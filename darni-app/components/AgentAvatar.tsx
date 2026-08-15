/**
 * AgentAvatar.tsx — Darni
 * Avatar d'agent : vraie photo (profiles.avatar_url) si disponible,
 * sinon repli sur les initiales colorées.
 */
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Palette assignée de façon stable par agent (pas de champ "color" en base)
const AVATAR_COLORS = ['#4A90D9', '#E8A87C', '#7BB8A0', '#D4789C', '#5E8BC8', '#9B7EC8'];

export function colorFor(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function wordInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

type Props = {
  name: string;
  color: string;
  avatarUrl?: string | null;
  size?: number;
  /** Rayon des coins — par défaut un cercle parfait (size / 2). */
  borderRadius?: number;
  /** Initiales personnalisées ; par défaut les initiales des mots du nom. */
  initials?: string;
};

export function AgentAvatar({
  name, color, avatarUrl, size = 50, borderRadius, initials,
}: Props) {
  const [failed, setFailed] = useState(false);
  const radius = borderRadius ?? size / 2;

  // Une URL cassée ou injoignable retombe sur les initiales plutôt que sur un carré vide.
  if (avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#F3F4F6' }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[
      styles.fallback,
      { width: size, height: size, borderRadius: radius, backgroundColor: color },
    ]}>
      <Text style={[styles.initials, { fontSize: size * 0.32 }]}>
        {initials ?? wordInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#fff', fontWeight: '800' },
});
