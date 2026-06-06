import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SectionList, ScrollView } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Screen from '../../components/layout/Screen';
import MethodBadge from '../../components/ui/MethodBadge';
import TransactionSheet, { SheetRef as TxSheetRef } from './TransactionSheet';
import { Transaction } from '../../types';
import { format, subDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HistoryScreen() {
  const theme = useTheme();
  const { transactions, categories } = useFinanceStore();
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [catFilter, setCatFilter] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const sheetRef = useRef<any>(null);

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');

  function dateFilter(date: string): boolean {
    if (period === 'day') return date === today;
    if (period === 'week') {
      const weekStart = format(startOfWeek(now, { locale: fr }), 'yyyy-MM-dd');
      return date >= weekStart;
    }
    const month = format(now, 'yyyy-MM');
    return date.startsWith(month);
  }

  const filtered = useMemo(() => transactions.filter(t =>
    t.type === txType &&
    dateFilter(t.date) &&
    (!catFilter || t.categoryId === catFilter)
  ), [transactions, txType, period, catFilter]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  // Group by date
  const byDate: Record<string, Transaction[]> = {};
  for (const t of filtered) {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  }

  const sections = Object.keys(byDate)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({
      date,
      dayTotal: byDate[date].reduce((s, t) => s + t.amount, 0),
      data: byDate[date],
    }));

  const expCats = categories.filter(c => c.type === txType);

  function openSheet(tx: Transaction) {
    setSelectedTx(tx);
    sheetRef.current?.present();
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Historique</Text>
      </View>

      {/* Type toggle */}
      <View style={[styles.toggle, { backgroundColor: theme.overlay, marginHorizontal: SPACING.screen }]}>
        <TouchableOpacity
          onPress={() => setTxType('expense')}
          style={[styles.toggleBtn, txType === 'expense' && { backgroundColor: COLORS.red, borderRadius: RADIUS.sm }]}
        >
          <Text style={[styles.toggleText, { color: txType === 'expense' ? '#fff' : theme.text.secondary }]}>Dépenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTxType('income')}
          style={[styles.toggleBtn, txType === 'income' && { backgroundColor: COLORS.green, borderRadius: RADIUS.sm }]}
        >
          <Text style={[styles.toggleText, { color: txType === 'income' ? '#fff' : theme.text.secondary }]}>Revenus</Text>
        </TouchableOpacity>
      </View>

      {/* Period selector */}
      <View style={[styles.periodRow, { marginHorizontal: SPACING.screen }]}>
        {(['day', 'week', 'month'] as const).map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodBtn, { borderColor: period === p ? theme.accent : theme.border.subtle, backgroundColor: period === p ? theme.accent + '22' : 'transparent' }]}
          >
            <Text style={[styles.periodText, { color: period === p ? theme.accent : theme.text.secondary }]}>
              {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.card, marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.summaryLabel, { color: theme.text.muted }]}>Total</Text>
        <Text style={[styles.summaryAmount, { color: txType === 'expense' ? COLORS.red : COLORS.green }]}>
          {txType === 'expense' ? '-' : '+'}{formatFCFA(total)}
        </Text>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catFilter} contentContainerStyle={{ paddingHorizontal: SPACING.screen }}>
        <TouchableOpacity
          onPress={() => setCatFilter('')}
          style={[styles.catChip, { backgroundColor: !catFilter ? theme.accent + '22' : theme.overlay, borderColor: !catFilter ? theme.accent : theme.border.subtle }]}
        >
          <Text style={[styles.catChipText, { color: !catFilter ? theme.accent : theme.text.secondary }]}>Tout</Text>
        </TouchableOpacity>
        {expCats.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCatFilter(c.id === catFilter ? '' : c.id)}
            style={[styles.catChip, { backgroundColor: catFilter === c.id ? theme.accent + '22' : theme.overlay, borderColor: catFilter === c.id ? theme.accent : theme.border.subtle }]}
          >
            <Text style={[styles.catChipText, { color: catFilter === c.id ? theme.accent : theme.text.secondary }]}>
              {c.emoji} {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction list */}
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={[styles.emptyText, { color: theme.text.muted }]}>Aucune transaction</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.screen, paddingBottom: 32 }}
          renderSectionHeader={({ section }) => (
            <View style={[styles.dayHeader, { borderBottomColor: theme.border.subtle }]}>
              <Text style={[styles.dayLabel, { color: theme.text.secondary }]}>
                {format(new Date(section.date + 'T00:00:00'), 'EEEE d MMMM', { locale: fr })}
              </Text>
              <Text style={[styles.dayTotal, { color: txType === 'expense' ? COLORS.red : COLORS.green }]}>
                {formatFCFA(section.dayTotal)}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const cat = categories.find(c => c.id === item.categoryId);
            return (
              <TouchableOpacity onPress={() => openSheet(item)} activeOpacity={0.7}>
                <View style={[styles.txRow, { borderBottomColor: theme.border.subtle }]}>
                  <View style={[styles.txIcon, { backgroundColor: (cat?.color || theme.accent) + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{cat?.emoji || '💳'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txDesc, { color: theme.text.primary }]} numberOfLines={1}>{item.description || cat?.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 3, alignItems: 'center' }}>
                      <MethodBadge method={item.method as any} />
                      {item.emotion && <Text style={{ fontSize: 13 }}>
                        {item.emotion === 'happy' ? '😊' : item.emotion === 'neutral' ? '😐' : item.emotion === 'need' ? '✅' : item.emotion === 'impulse' ? '😬' : '😔'}
                      </Text>}
                      {item.pending && <Text style={{ color: COLORS.amber, fontSize: 11 }}>⏳</Text>}
                    </View>
                  </View>
                  <Text style={[styles.txAmount, { color: item.type === 'income' ? COLORS.green : COLORS.red }]}>
                    {item.type === 'income' ? '+' : '-'}{formatFCFA(item.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {selectedTx && (
        <TransactionSheet ref={sheetRef} transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm + 2,
    padding: 3,
    marginBottom: SPACING.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  periodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  summaryAmount: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  catFilter: {
    marginBottom: SPACING.md,
  },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'capitalize',
  },
  dayTotal: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  txAmount: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
