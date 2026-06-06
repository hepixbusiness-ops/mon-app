import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  barWidth?: number;
}

export default function BarChart({ data, height = 80, barWidth = 28 }: BarChartProps) {
  const theme = useTheme();
  if (!data.length) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <View style={styles.container}>
      <Svg width={totalWidth} height={height}>
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * (height - 4);
          const x = i * (barWidth + gap);
          const y = height - barH;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              fill={d.color || theme.accent}
              rx={4}
            />
          );
        })}
      </Svg>
      <View style={[styles.labels, { width: totalWidth }]}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.label, { color: theme.text.muted, width: barWidth + gap }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  labels: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
  },
});
