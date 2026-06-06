import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EMOTIONS } from '../../constants/emotions';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';

interface EmotionPickerProps {
  value?: string;
  onChange: (id: string) => void;
}

export default function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {EMOTIONS.map(e => (
        <TouchableOpacity
          key={e.id}
          onPress={() => onChange(e.id)}
          style={[
            styles.btn,
            {
              backgroundColor: value === e.id ? e.color + '22' : theme.overlay,
              borderColor: value === e.id ? e.color : theme.border.subtle,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{e.emoji}</Text>
          <Text style={[styles.label, { color: value === e.id ? e.color : theme.text.muted }]}>
            {e.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    gap: 2,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
});
