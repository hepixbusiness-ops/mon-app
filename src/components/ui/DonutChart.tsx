import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

interface Segment {
  color: string;
  value: number;
  label: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
}

export default function DonutChart({ segments, size = 160, strokeWidth = 20, centerLabel }: DonutChartProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const slices = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = -90 + (offset / circumference) * 360;
    offset += dash;
    return { ...seg, dash, gap, rotation };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {slices.map((s, i) => (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={0}
              rotation={s.rotation + 90}
              origin={`${size / 2}, ${size / 2}`}
            />
          ))}
        </G>
      </Svg>
      {centerLabel && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: theme.text.primary, fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center' }}>
            {centerLabel}
          </Text>
        </View>
      )}
    </View>
  );
}
