import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../constants/theme';

interface RingChartProps {
  used: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function RingChart({ used, total, size = 180, strokeWidth = 16 }: RingChartProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(used / total, 1) : 0;
  const filled = pct * circumference;

  const ringColor = pct >= 1 ? COLORS.red : pct >= 0.8 ? COLORS.amber : COLORS.green;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.border.subtle}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: ringColor, fontSize: 28, fontFamily: 'PlusJakartaSans_800ExtraBold' }}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={{ color: theme.text.muted, fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular' }}>
          utilisé
        </Text>
      </View>
    </View>
  );
}
