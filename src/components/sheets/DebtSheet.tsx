import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS, COLORS } from '../../constants/theme';
import { Debt } from '../../types';

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  debt?: Debt;
  onClose: () => void;
}

const DebtSheet = forwardRef<SheetRef, Props>(({ debt, onClose }, ref) => {
  const theme = useTheme();
  const { addDebt, updateDebt, deleteDebt } = useFinanceStore();
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState<'owed' | 'owe'>('owed');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => { setVisible(false); onClose(); },
  }));

  useEffect(() => {
    if (debt) {
      setDirection(debt.direction); setName(debt.name);
      setAmount(String(debt.amount)); setPhone(debt.phone || ''); setNotes(debt.notes || '');
    } else {
      setDirection('owed'); setName(''); setAmount(''); setPhone(''); setNotes('');
    }
  }, [debt]);

  function handleSave() {
    if (!name.trim() || !amount) return;
    const today = new Date().toISOString().split('T')[0];
    if (debt) {
      updateDebt({ ...debt, direction, name: name.trim(), amount: parseFloat(amount) || debt.amount, phone, notes });
    } else {
      addDebt({ direction, name: name.trim(), amount: parseFloat(amount) || 0, phone, notes, date: today, status: 'pending' });
    }
    setVisible(false); onClose();
  }

  function handleDelete() {
    if (!debt) return;
    deleteDebt(debt.id); setVisible(false); onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{debt ? 'Modifier la dette' : 'Ajouter une dette / prêt'}</Text>

          <View style={[styles.toggle, { backgroundColor: theme.overlay }]}>
            <TouchableOpacity onPress={() => setDirection('owed')}
              style={[styles.toggleBtn, direction === 'owed' && { backgroundColor: COLORS.green, borderRadius: RADIUS.sm }]}>
              <Text style={[styles.toggleText, { color: direction === 'owed' ? '#fff' : theme.text.secondary }]}>📥 On me doit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDirection('owe')}
              style={[styles.toggleBtn, direction === 'owe' && { backgroundColor: COLORS.red, borderRadius: RADIUS.sm }]}>
              <Text style={[styles.toggleText, { color: direction === 'owe' ? '#fff' : theme.text.secondary }]}>📤 Je dois</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.text.secondary }]}>Nom</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ex: Christian" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Montant (FCFA)</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="15 000" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Téléphone (WhatsApp)</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+237 6XX XXX XXX" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Détails optionnels..." placeholderTextColor={theme.text.muted}
            multiline numberOfLines={3}
            style={[styles.textArea, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.saveBtnText}>{debt ? 'Enregistrer' : 'Ajouter'}</Text>
          </TouchableOpacity>
          {debt && (
            <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { borderColor: COLORS.red }]}>
              <Text style={{ color: COLORS.red, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});

export default DebtSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { maxHeight: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.screen, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  title: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center', marginBottom: SPACING.md },
  toggle: { flexDirection: 'row', borderRadius: RADIUS.sm + 2, padding: 3, marginBottom: SPACING.sm },
  toggleBtn: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center' },
  toggleText: { fontSize: 14, fontFamily: 'PlusJakartaSans_700Bold' },
  label: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: SPACING.sm },
  input: { height: 52, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1, marginBottom: SPACING.sm },
  textArea: { borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1, minHeight: 80, textAlignVertical: 'top', marginBottom: SPACING.sm },
  saveBtn: { height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  deleteBtn: { height: 44, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
});
