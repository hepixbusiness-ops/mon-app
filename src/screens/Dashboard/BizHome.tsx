import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import BarChart from '../../components/ui/BarChart';
import { format, subMonths } from 'date-fns';

export default function BizHome() {
  const theme = useTheme();
  const { transactions, categories, creditClients, getTotalIncome, getTotalExpenses, getCategorySpending } = useFinanceStore();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const ca = getTotalIncome(month);
  const costs = getTotalExpenses(month);
  const margin = ca > 0 ? ((ca - costs) / ca) * 100 : 0;

  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const avgBasket = incomeTransactions.length > 0 ? ca / incomeTransactions.filter(t => t.date.startsWith(month)).length : 0;
  const salesCount = transactions.filter(t => t.type === 'income' && t.date.startsWith(month)).length;

  const ardoiseTotal = creditClients.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

  // 6-month chart
  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const m = format(d, 'yyyy-MM');
    const label = format(d, 'MMM').slice(0, 3);
    const value = transactions.filter(t => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0);
    return { label, value, color: theme.accent };
  });

  // Top products by category
  const incomeCats = categories.filter(c => c.type === 'income');
  const catCA = incomeCats
    .map(c => ({ ...c, amount: transactions.filter(t => t.categoryId === c.id && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0) }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* CA du mois */}
      <Card style={{ marginHorizontal: SPACING.screen, alignItems: 'center', gap: SPACING.sm }}>
        <Text style={[styles.label, { color: theme.text.muted }]}>CA du mois</Text>
        <Text style={[styles.bigAmount, { color: theme.text.primary }]}>{formatFCFA(ca)}</Text>
        <View style={styles.chartWrap}>
          <BarChart data={months6} height={80} barWidth={32} />
        </View>
      </Card>

      {/* KPI Grid */}
      <View style={[styles.kpiGrid, { marginHorizontal: SPACING.screen }]}>
        <Card style={styles.kpi}>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Marge nette</Text>
          <Text style={[styles.kpiVal, { color: margin >= 0 ? COLORS.green : COLORS.red }]}>
            {margin.toFixed(1)}%
          </Text>
        </Card>
        <Card style={styles.kpi}>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Coûts</Text>
          <Text style={[styles.kpiVal, { color: COLORS.red }]}>{formatFCFA(costs)}</Text>
        </Card>
        <Card style={styles.kpi}>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Ventes</Text>
          <Text style={[styles.kpiVal, { color: theme.text.primary }]}>{salesCount}</Text>
        </Card>
        <Card style={styles.kpi}>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Panier moy.</Text>
          <Text style={[styles.kpiVal, { color: theme.text.primary }]}>{formatFCFA(avgBasket)}</Text>
        </Card>
      </View>

      {/* Ardoise */}
      <Card style={{ marginHorizontal: SPACING.screen }}>
        <View style={styles.ardoiseRow}>
          <Text style={{ fontSize: 24 }}>📒</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ardoiseTitle, { color: theme.text.primary }]}>Ardoise clients</Text>
            <Text style={[styles.ardoiseAmt, { color: COLORS.amber }]}>{formatFCFA(ardoiseTotal)} en attente</Text>
          </View>
          <Text style={{ color: theme.text.muted, fontSize: 18 }}>›</Text>
        </View>
      </Card>

      {/* Top products */}
      {catCA.length > 0 && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            Top sources de revenus
          </Text>
          <Card>
            {catCA.map((cat, i) => {
              const pct = ca > 0 ? cat.amount / ca : 0;
              return (
                <View key={cat.id} style={[i < catCA.length - 1 && { marginBottom: SPACING.md }]}>
                  <View style={styles.catRow}>
                    <Text>{cat.emoji} <Text style={[styles.catName, { color: theme.text.primary }]}>{cat.name}</Text></Text>
                    <Text style={[styles.catAmt, { color: theme.text.secondary }]}>{formatFCFA(cat.amount)}</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: theme.border.subtle }]}>
                    <View style={[styles.barFill, { backgroundColor: cat.color, width: `${Math.round(pct * 100)}%` }]} />
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* Export PDF */}
      <TouchableOpacity
        style={[styles.exportBtn, { backgroundColor: theme.overlay, borderColor: theme.border.default }]}
        activeOpacity={0.7}
        onPress={() => {}}
      >
        <Text style={{ fontSize: 18 }}>📄</Text>
        <Text style={[styles.exportText, { color: theme.text.primary }]}>Exporter rapport PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  label: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  bigAmount: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  chartWrap: {
    marginTop: SPACING.sm,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  kpi: {
    width: '47%',
    gap: SPACING.xs,
  },
  kpiLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  kpiVal: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  ardoiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ardoiseTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  ardoiseAmt: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catName: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  catAmt: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
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
  exportBtn: {
    marginHorizontal: SPACING.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  exportText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
