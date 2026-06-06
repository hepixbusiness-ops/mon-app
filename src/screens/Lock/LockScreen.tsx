import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SPACING, RADIUS } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lock'>;

export default function LockScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { db } = useSettingsStore();
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function getStoredPin(): string {
    if (!db) return '';
    try {
      const row = db.getFirstSync('SELECT value FROM settings WHERE key = ?', ['pin']) as { value: string } | null;
      return row?.value ?? '';
    } catch {
      return '';
    }
  }

  function handleKey(key: string) {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      return;
    }
    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === 4) {
      const storedPin = getStoredPin();
      if (storedPin && newPin === storedPin) {
        navigation.replace('Main');
      } else {
        shake();
        setTimeout(() => setPin(''), 500);
      }
    }
  }

  const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>Entrez votre code PIN</Text>

      <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, {
            backgroundColor: i < pin.length ? theme.accent : 'transparent',
            borderColor: i < pin.length ? theme.accent : theme.border.default,
          }]} />
        ))}
      </Animated.View>

      <View style={styles.numpad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => (
              key === '' ? (
                <View key={ki} style={styles.emptyKey} />
              ) : (
                <TouchableOpacity key={ki} onPress={() => handleKey(key)}
                  style={[styles.key, { backgroundColor: theme.overlay }]} activeOpacity={0.7}>
                  <Text style={[styles.keyText, { color: theme.text.primary }]}>{key}</Text>
                </TouchableOpacity>
              )
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xxl },
  title: { fontSize: 22, fontFamily: 'PlusJakartaSans_700Bold' },
  dots: { flexDirection: 'row', gap: SPACING.lg },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  numpad: { gap: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  key: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  emptyKey: { width: 76, height: 76 },
  keyText: { fontSize: 24, fontFamily: 'PlusJakartaSans_600SemiBold' },
});
