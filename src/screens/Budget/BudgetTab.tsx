import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';

export default function BudgetTab() {
  const theme = useTheme();
  const { categories, getCategorySpending, updateCategory } = useFinanceStore();
  const { monthlyBudget, setMonthlyBudget } = useSettingsStore();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalExpenses = categories
    .filter(c => c.type === 'expense')
    .reduce((s, c) => s + getCategorySpending(c.id, month), 0);
  const remaining = monthlyBudget - totalExpenses;

  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catBudgetInput, setCatBudgetInput] = useState('');

  const expCats = categories.filter(c => c.type === 'expense');

  function saveBudget() {
    const val = parseFloat(budgetInput) || monthlyBudget;
    setMonthlyBudget(val);
    setEditBudget(false);
  }

  function saveCatBudget() {
    const cat = categories.find(c => c.id === editingCat);
    if (!cat) return;
    const val = parseFloat(catBudgetInput) || cat.budget;
    updateCategory({ ...cat, budget: val });
    setEditingCat(null);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Monthly budget total */}
      <TouchableOpacity onPress={() => { setBudgetInput(String(monthlyBudget)); setEditBudget(true); }}>
        <Card style={{ marginHorizontal: SPACING.screen }}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={[styles.label, { color: theme.text.muted }]}>Budget mensuel</Text>
              <Text style={[styles.bigAmount, { color: theme.text.primary }]}>{formatFCFA(monthlyBudget)}</Text>
            </View>
            <Text style={[{ color: theme.accent, fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>✏️ Modifier</Text>
          </View>
          <View style={[styles.remainRow]}>
            <View style={styles.remainItem}>
              <Text style={[styles.label, { color: theme.text.muted }]}>Dépensé</Text>
              <Text style={[styles.remainAmt, { color: COLORS.red }]}>{formatFCFA(totalExpenses)}</Text>
            </View>
            <View style={styles.remainItem}>
              <Text style={[styles.label, { color: theme.text.muted }]}>Restant</Text>
              <Text style={[styles.remainAmt, { color: remaining >= 0 ? COLORS.green : COLORS.red }]}>
                {formatFCFA(Math.abs(remaining))}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Per-category limits */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
          Limites par catégorie
        </Text>
        {expCats.map(cat => {
          const spent = getCategorySpending(cat.id, month);
          const pct = cat.budget > 0 ? Math.min(spent / cat.budget, 1) : 0;
          const barColor = pct >= 1 ? COLORS.red : pct >= 0.8 ? COLORS.amber : cat.color;

          return (
            <Card key={cat.id} style={{ marginBottom: SPACING.sm }}>
              <View style={styles.catRow}>
                <View style={styles.catInfo}>
                  <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                  <Text style={[styles.catName, { color: theme.text.primary }]}>{cat.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.catSpent, { color: barColor }]}>
                    {formatFCFA(spent)}
                  </Text>
                  {cat.budget > 0 && (
                    <Text style={[styles.catBudget, { color: theme.text.muted }]}>
                      / {formatFCFA(cat.budget)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => { setEditingCat(cat.id); setCatBudgetInput(String(cat.budget)); }}
                  style={[styles.editBtn, { backgroundColor: theme.overlay }]}
                >
                  <Text style={{ color: theme.accent, fontSize: 12 }}>✏️</Text>
                </TouchableOpacity>
              </View>
              {cat.budget > 0 && (
                <View style={[styles.barTrack, { backgroundColor: theme.border.subtle, marginTop: SPACING.sm }]}>
                  <View style={[styles.barFill, { backgroundColor: barColor, width: `${Math.round(pct * 100)}%` }]} />
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Monthly budget edit modal */}
      <Modal visible={editBudget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Budget mensuel</Text>
            <TextInput
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditBudget(false)} style={[styles.modalBtn, { backgroundColor: theme.overlay }]}>
                <Text style={[{ color: theme.text.secondary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveBudget} style={[styles.modalBtn, { backgroundColor: theme.accent }]}>
                <Text style={[{ color: '#fff', fontFamily: 'PlusJakartaSans_700Bold' }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category budget edit modal */}
      <Modal visible={!!editingCat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Limite — {categories.find(c => c.id === editingCat)?.emoji} {categories.find(c => c.id === editingCat)?.name}
            </Text>
            <TextInput
              value={catBudgetInput}
              onChangeText={setCatBudgetInput}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditingCat(null)} style={[styles.modalBtn, { backgroundColor: theme.overlay }]}>
                <Text style={[{ color: theme.text.secondary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCatBudget} style={[styles.modalBtn, { backgroundColor: theme.accent }]}>
                <Text style={[{ color: '#fff', fontFamily: 'PlusJakartaSans_700Bold' }]}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  label: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  bigAmount: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  remainRow: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  remainItem: {
    gap: 2,
  },
  remainAmt: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  catInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  catName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  catSpent: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  catBudget: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modal: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  input: {
    height: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    borderWidth: 1,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
