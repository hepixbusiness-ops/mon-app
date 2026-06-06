import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SPACING } from '../../constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Chip({ label, selected, onPress, color, style, textStyle }: ChipProps) {
  const theme = useTheme();
  const activeColor = color || theme.accent;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? activeColor + '22' : theme.overlay,
          borderColor: selected ? activeColor : theme.border.subtle,
        },
        style,
      ]}
    >
      <Text style={[
        styles.label,
        { color: selected ? activeColor : theme.text.secondary },
        textStyle,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
