import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import DebtSheet, { SheetRef as DebtSheetRef } from '../../components/sheets/DebtSheet';
import { Debt } from '../../types';
import { draftRelance, openWhatsApp } from '../../services/whatsapp';

export default function DebtsTab() {
  const theme = useTheme();
  const { debts, updateDebt } = useFinanceStore();
  const debtSheetRef = useRef<any>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const owed = debts.filter(d => d.direction === 'owed' && d.status === 'pending');
  const owe = debts.filter(d => d.direction === 'owe' && d.status === 'pending');

  const totalOwed = owed.reduce((s, d) => s + d.amount, 0);
  const totalOwe = owe.reduce((s, d) => s + d.amount, 0);

  function openDebtSheet(debt?: Debt) {
    setSelectedDebt(debt);
    debtSheetRef.current?.present();
  }

  function handleSettle(debt: Debt) {
    updateDebt({ ...debt, status: 'settled' });
  }

  function handleWhatsApp(debt: Debt) {
    if (!debt.phone) return;
    const msg = draftRelance(debt.name, debt.amount, debt.notes);
    openWhatsApp(debt.phone, msg);
  }

  function renderDebtItem(debt: Debt) {
    const expanded = expandedId === debt.id;
    const color = debt.direction === 'owed' ? COLORS.green : COLORS.red;

    return (
      <Card key={debt.id} style={{ marginBottom: SPACING.sm }}>
        <TouchableOpacity onPress={() => setExpandedId(expanded ? null : debt.id)} activeOpacity={0.7}>
          <View style={styles.debtRow}>
            <View style={[styles.debtIcon, { backgroundColor: color + '22' }]}>
              <Text style={{ fontSize: 20 }}>{debt.direction === 'owed' ? '📥' : '📤'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.debtName, { color: theme.text.primary }]}>{debt.name}</Text>
              <Text style={[styles.debtDate, { color: theme.text.muted }]}>Depuis le {debt.date}</Text>
            </View>
            <Text style={[styles.debtAmt, { color }]}>{formatFCFA(debt.amount)}</Text>
            <Text style={[{ color: theme.text.muted, fontSize: 14 }]}>{expanded ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={[styles.expandedContent, { borderTopColor: theme.border.subtle }]}>
            {debt.notes ? (
              <Text style={[styles.notes, { color: theme.text.secondary }]}>📝 {debt.notes}</Text>
            ) : null}
            <View style={styles.actionRow}>
              {debt.phone && (
                <TouchableOpacity onPress={() => handleWhatsApp(debt)} style={[styles.actionBtn, { backgroundColor: '#25D366' + '22', borderColor: '#25D366' }]}>
                  <Text style={[styles.actionText, { color: '#25D366' }]}>📱 WhatsApp</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => openDebtSheet(debt)} style={[styles.actionBtn, { backgroundColor: theme.accent + '22', borderColor: theme.accent }]}>
                <Text style={[styles.actionText, { color: theme.accent }]}>✏️ Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSettle(debt)} style={[styles.actionBtn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}>
                <Text style={[styles.actionText, { color: COLORS.green }]}>✅ Soldé</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Summary */}
      <View style={[styles.summaryRow, { marginHorizontal: SPACING.screen }]}>
        <Card style={[styles.summaryCard]}>
          <Text style={[styles.summaryLabel, { color: theme.text.muted }]}>On me doit</Text>
          <Text style={[styles.summaryAmt, { color: COLORS.green }]}>{formatFCFA(totalOwed)}</Text>
        </Card>
        <Card style={[styles.summaryCard]}>
          <Text style={[styles.summaryLabel, { color: theme.text.muted }]}>Je dois</Text>
          <Text style={[styles.summaryAmt, { color: COLORS.red }]}>{formatFCFA(totalOwe)}</Text>
        </Card>
      </View>

      {/* Owed to me */}
      {owed.length > 0 && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            On me doit ({owed.length})
          </Text>
          {owed.map(renderDebtItem)}
        </View>
      )}

      {/* I owe */}
      {owe.length > 0 && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            Je dois ({owe.length})
          </Text>
          {owe.map(renderDebtItem)}
        </View>
      )}

      <TouchableOpacity onPress={() => openDebtSheet()} style={[styles.addBtn, { backgroundColor: theme.accent, marginHorizontal: SPACING.screen }]}>
        <Text style={styles.addBtnText}>+ Ajouter une dette / prêt</Text>
      </TouchableOpacity>

      <DebtSheet ref={debtSheetRef} debt={selectedDebt} onClose={() => setSelectedDebt(undefined)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    gap: SPACING.xs,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  summaryAmt: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  debtIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  debtDate: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  debtAmt: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  notes: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  addBtn: {
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
