import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PAYMENT_METHODS } from '../../constants/methods';
import { RADIUS } from '../../constants/theme';

interface MethodBadgeProps {
  method: 'cash' | 'mtn' | 'om' | 'card';
}

export default function MethodBadge({ method }: MethodBadgeProps) {
  const m = PAYMENT_METHODS[method];
  if (!m) return null;

  return (
    <View style={[styles.badge, { backgroundColor: m.color + '22' }]}>
      <Text style={styles.emoji}>{m.emoji}</Text>
      <Text style={[styles.label, { color: m.color }]}>{m.short}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 3,
  },
  emoji: {
    fontSize: 11,
  },
  label: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
