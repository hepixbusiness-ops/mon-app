import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';

interface ProgressBarProps {
  label?: string;
  value: number;
  max: number;
  color?: string;
  showPercent?: boolean;
  height?: number;
}

export default function ProgressBar({ label, value, max, color, showPercent = false, height = 8 }: ProgressBarProps) {
  const theme = useTheme();
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barColor = color || (pct > 1 ? theme.red : pct > 0.8 ? theme.amber : theme.green);

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.header}>
          {label && <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>}
          {showPercent && (
            <Text style={[styles.pct, { color: barColor }]}>{Math.round(pct * 100)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.border.subtle, height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              height,
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  pct: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  track: {
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.sm,
  },
});
