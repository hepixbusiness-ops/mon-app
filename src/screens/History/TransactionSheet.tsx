import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import MethodBadge from '../../components/ui/MethodBadge';
import { Transaction } from '../../types';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionSheet = forwardRef<SheetRef, Props>(({ transaction, onClose }, ref) => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { categories, addTransaction, deleteTransaction } = useFinanceStore();
  const [visible, setVisible] = useState(false);
  const cat = categories.find(c => c.id === transaction.categoryId);

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => { setVisible(false); onClose(); },
  }));

  function handleEdit() {
    setVisible(false);
    navigation.navigate('Entry', { transaction });
  }

  function handleDuplicate() {
    const today = new Date().toISOString().split('T')[0];
    const { id: _id, ...rest } = transaction;
    addTransaction({ ...rest, date: today });
    setVisible(false);
  }

  function handleDelete() {
    Alert.alert('Supprimer', 'Supprimer cette transaction ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { deleteTransaction(transaction.id); setVisible(false); onClose(); } },
    ]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />
        <View style={[styles.container, { paddingHorizontal: SPACING.screen }]}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: (cat?.color || theme.accent) + '22' }]}>
              <Text style={{ fontSize: 28 }}>{cat?.emoji || '💳'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.desc, { color: theme.text.primary }]}>{transaction.description || cat?.name}</Text>
              <Text style={[styles.date, { color: theme.text.muted }]}>{transaction.date}</Text>
            </View>
            <Text style={[styles.amount, { color: transaction.type === 'income' ? COLORS.green : COLORS.red }]}>
              {transaction.type === 'income' ? '+' : '-'}{formatFCFA(transaction.amount)}
            </Text>
          </View>
          <View style={[styles.details, { borderColor: theme.border.subtle }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.text.muted }]}>Méthode</Text>
              <MethodBadge method={transaction.method as any} />
            </View>
            {transaction.emotion && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>Ressenti</Text>
                <Text style={{ fontSize: 20 }}>
                  {transaction.emotion === 'happy' ? '😊' : transaction.emotion === 'neutral' ? '😐' : transaction.emotion === 'need' ? '✅' : transaction.emotion === 'impulse' ? '😬' : '😔'}
                </Text>
              </View>
            )}
            {transaction.recurring && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>Récurrent</Text>
                <Text style={{ color: theme.accent, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' }}>🔄 Mensuel</Text>
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEdit} style={[styles.actionBtn, { backgroundColor: theme.accent + '22', borderColor: theme.accent }]}>
              <Text style={[styles.actionText, { color: theme.accent }]}>✏️ Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDuplicate} style={[styles.actionBtn, { backgroundColor: theme.overlay, borderColor: theme.border.subtle }]}>
              <Text style={[styles.actionText, { color: theme.text.secondary }]}>📋 Dupliquer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, { backgroundColor: COLORS.red + '22', borderColor: COLORS.red }]}>
              <Text style={[styles.actionText, { color: COLORS.red }]}>🗑️ Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default TransactionSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: SPACING.md },
  container: { gap: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  icon: { width: 56, height: 56, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  date: { fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 },
  amount: { fontSize: 20, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  details: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: SPACING.md, gap: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, height: 44, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' },
});
