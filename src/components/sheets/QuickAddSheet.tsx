import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

const OPTIONS = [
  { emoji: '📱', label: 'Scan SMS', desc: 'Importer depuis un SMS MoMo/OM', action: 'sms' },
  { emoji: '🎤', label: 'Dictée vocale', desc: 'Dicter la transaction', action: 'voice' },
  { emoji: '✏️', label: 'Saisie manuelle', desc: 'Entrer les détails manuellement', action: 'manual' },
];

const QuickAddSheet = forwardRef<SheetRef>((_, ref) => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => setVisible(false),
  }));

  function handleOption(action: string) {
    setVisible(false);
    if (action === 'manual') {
      navigation.navigate('Entry', undefined);
    } else if (action === 'sms') {
      const demoTx = {
        amount: 5000, description: 'MTN MoMo reçu (SMS)', method: 'mtn' as const,
        type: 'income' as const, categoryId: 'tontine_g',
        date: new Date().toISOString().split('T')[0], pending: false, recurring: false,
      };
      navigation.navigate('Entry', { transaction: { ...demoTx, id: 'sms-demo' } });
    } else {
      navigation.navigate('Entry', undefined);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />
        <Text style={[styles.title, { color: theme.text.primary }]}>Ajouter une transaction</Text>
        <View style={styles.options}>
          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.action}
              onPress={() => handleOption(opt.action)}
              style={[styles.option, { backgroundColor: theme.overlay, borderColor: theme.border.subtle }]}
              activeOpacity={0.7}
            >
              <Text style={styles.optEmoji}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optLabel, { color: theme.text.primary }]}>{opt.label}</Text>
                <Text style={[styles.optDesc, { color: theme.text.muted }]}>{opt.desc}</Text>
              </View>
              <Text style={{ color: theme.text.muted, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
});

export default QuickAddSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: SPACING.screen, paddingBottom: 40, gap: SPACING.lg,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.sm },
  title: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center' },
  options: { gap: SPACING.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
    borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.md,
  },
  optEmoji: { fontSize: 28 },
  optLabel: { fontSize: 15, fontFamily: 'PlusJakartaSans_700Bold' },
  optDesc: { fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
});
