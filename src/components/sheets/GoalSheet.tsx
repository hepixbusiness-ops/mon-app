import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Modal, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS } from '../../constants/theme';
import { Goal } from '../../types';

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

const GOAL_ICONS = ['🎯', '📚', '🎄', '🏪', '🚗', '✈️', '🏠', '💊', '🎉', '🎸', '🏋️', '💍', '🌍', '🐕', '👶'];

interface Props {
  goal?: Goal;
  onClose: () => void;
}

const GoalSheet = forwardRef<SheetRef, Props>(({ goal, onClose }, ref) => {
  const theme = useTheme();
  const { addGoal, updateGoal, deleteGoal } = useFinanceStore();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [target, setTarget] = useState('');
  const [monthly, setMonthly] = useState('');
  const [addAmount, setAddAmount] = useState('');

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => { setVisible(false); onClose(); },
  }));

  useEffect(() => {
    if (goal) {
      setName(goal.name); setIcon(goal.icon);
      setTarget(String(goal.targetAmount)); setMonthly(String(goal.monthlyAmount));
    } else {
      setName(''); setIcon('🎯'); setTarget(''); setMonthly('');
    }
    setAddAmount('');
  }, [goal]);

  function handleSave() {
    if (!name.trim() || !target) return;
    if (goal) {
      updateGoal({ ...goal, name: name.trim(), icon, targetAmount: parseFloat(target) || goal.targetAmount, monthlyAmount: parseFloat(monthly) || goal.monthlyAmount });
    } else {
      addGoal({ name: name.trim(), icon, targetAmount: parseFloat(target) || 0, savedAmount: 0, monthlyAmount: parseFloat(monthly) || 0, status: 'active' });
    }
    setVisible(false); onClose();
  }

  function handleAddMoney() {
    if (!goal || !addAmount) return;
    updateGoal({ ...goal, savedAmount: goal.savedAmount + (parseFloat(addAmount) || 0) });
    setAddAmount(''); setVisible(false);
  }

  function handleDelete() {
    if (!goal) return;
    deleteGoal(goal.id); setVisible(false); onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{goal ? "Modifier l'objectif" : 'Nouvel objectif'}</Text>

          <Text style={[styles.label, { color: theme.text.secondary }]}>Icône</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.iconRow}>
              {GOAL_ICONS.map(i => (
                <TouchableOpacity key={i} onPress={() => setIcon(i)}
                  style={[styles.iconBtn, { backgroundColor: icon === i ? theme.accent + '22' : theme.overlay, borderColor: icon === i ? theme.accent : 'transparent' }]}>
                  <Text style={{ fontSize: 24 }}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.label, { color: theme.text.secondary }]}>Nom</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ex: Rentrée scolaire"
            placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Montant cible (FCFA)</Text>
          <TextInput value={target} onChangeText={setTarget} keyboardType="numeric" placeholder="200 000"
            placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Épargne mensuelle (FCFA)</Text>
          <TextInput value={monthly} onChangeText={setMonthly} keyboardType="numeric" placeholder="20 000"
            placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          {goal && (
            <View style={[styles.addSection, { backgroundColor: theme.overlay, borderColor: theme.border.subtle }]}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Ajouter de l'argent</Text>
              <View style={styles.row}>
                <TextInput value={addAmount} onChangeText={setAddAmount} keyboardType="numeric" placeholder="Montant"
                  placeholderTextColor={theme.text.muted}
                  style={[styles.addInput, { backgroundColor: theme.card, color: theme.text.primary, borderColor: theme.border.subtle }]} />
                <TouchableOpacity onPress={handleAddMoney} style={[styles.addBtn, { backgroundColor: theme.accent }]}>
                  <Text style={styles.btnText}>+ Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.saveBtnText}>{goal ? 'Enregistrer' : 'Créer'}</Text>
          </TouchableOpacity>
          {goal && (
            <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { borderColor: '#f87171' }]}>
              <Text style={{ color: '#f87171', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});

export default GoalSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { maxHeight: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.screen, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  title: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center', marginBottom: SPACING.md },
  label: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: SPACING.sm },
  iconRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  iconBtn: { width: 48, height: 48, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  input: { height: 52, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1, marginBottom: SPACING.sm },
  addSection: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.sm },
  addInput: { flex: 1, height: 44, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1 },
  addBtn: { paddingHorizontal: SPACING.lg, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
  saveBtn: { height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  deleteBtn: { height: 44, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
});
