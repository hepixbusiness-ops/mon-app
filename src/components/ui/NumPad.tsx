import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';

interface NumPadProps {
  onPress: (key: string) => void;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [',', '0', '⌫'],
];

export default function NumPad({ onPress }: NumPadProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {KEYS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => onPress(key)}
              activeOpacity={0.7}
              style={[styles.key, { backgroundColor: theme.overlay }]}
            >
              <Text style={[styles.keyText, { color: theme.text.primary }]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  key: {
    flex: 1,
    height: 60,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
