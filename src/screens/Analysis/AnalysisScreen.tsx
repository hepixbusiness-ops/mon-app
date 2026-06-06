import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import RingChart from '../../components/ui/RingChart';
import DonutChart from '../../components/ui/DonutChart';
import Screen from '../../components/layout/Screen';
import CoachChat from './CoachChat';

export default function AnalysisScreen() {
  const theme = useTheme();
  const { transactions, categories, getTotalExpenses, getTotalIncome, getCategorySpending } = useFinanceStore();
  const { monthlyBudget } = useSettingsStore();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const totalExpenses = getTotalExpenses(month);
  const totalIncome = getTotalIncome(month);

  // Health score (0-100)
  const budgetAdherence = Math.min(1, (monthlyBudget - totalExpenses) / monthlyBudget);
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const regularity = Math.min(1, incomeTransactions.length / 2);

  const healthScore = Math.round(
    Math.max(0, budgetAdherence) * 40 +
    Math.max(0, savingsRate) * 30 +
    regularity * 30
  );

  const healthColor = healthScore >= 70 ? COLORS.green : healthScore >= 40 ? COLORS.amber : COLORS.red;

  // Projection
  const projectedExpense = dayOfMonth > 0 ? (totalExpenses / dayOfMonth) * daysInMonth : 0;
  const projectionAbove = projectedExpense > monthlyBudget;

  // Category donut
  const catSpending = categories
    .filter(c => c.type === 'expense')
    .map(c => ({ id: c.id, color: c.color, value: getCategorySpending(c.id, month), label: c.name }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Leaks
  const maquis = getCategorySpending('maquis', month);
  const forfait = getCategorySpending('forfait', month);
  const impulseTotal = transactions.filter(t => t.emotion === 'impulse' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);

  return (
    <Screen scroll>
      <View style={{ paddingHorizontal: SPACING.screen }}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Analyse</Text>
      </View>

      {/* Health Score */}
      <Card style={{ marginHorizontal: SPACING.screen, alignItems: 'center', gap: SPACING.md }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Score santé financière</Text>
        <View style={styles.healthRow}>
          <RingChart used={healthScore} total={100} size={140} />
          <View style={styles.healthDetails}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.text.muted }]}>Budget</Text>
              <Text style={[styles.scoreVal, { color: budgetAdherence >= 0 ? COLORS.green : COLORS.red }]}>
                {Math.round(Math.max(0, budgetAdherence) * 40)}/40
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.text.muted }]}>Épargne</Text>
              <Text style={[styles.scoreVal, { color: savingsRate >= 0.2 ? COLORS.green : COLORS.amber }]}>
                {Math.round(Math.max(0, savingsRate) * 30)}/30
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: theme.text.muted }]}>Régularité</Text>
              <Text style={[styles.scoreVal, { color: COLORS.blue }]}>
                {Math.round(regularity * 30)}/30
              </Text>
            </View>
            <View style={[styles.totalScore, { backgroundColor: healthColor + '22' }]}>
              <Text style={[{ color: healthColor, fontSize: 22, fontFamily: 'PlusJakartaSans_800ExtraBold' }]}>
                {healthScore}/100
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Prediction */}
      <Card style={{ marginHorizontal: SPACING.screen }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Prévision fin de mois</Text>
        <View style={styles.predRow}>
          <Text style={{ fontSize: 32 }}>{projectionAbove ? '⚠️' : '✅'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.predAmount, { color: projectionAbove ? COLORS.red : COLORS.green }]}>
              {formatFCFA(projectedExpense)}
            </Text>
            <Text style={[styles.predText, { color: theme.text.secondary }]}>
              {projectionAbove
                ? `Dépassement de ${formatFCFA(projectedExpense - monthlyBudget)} prévu`
                : `Dans le budget — économies prévues: ${formatFCFA(monthlyBudget - projectedExpense)}`}
            </Text>
          </View>
          <Text style={{ color: projectionAbove ? COLORS.red : COLORS.green, fontSize: 24 }}>
            {projectionAbove ? '↗' : '↘'}
          </Text>
        </View>
      </Card>

      {/* Budget leaks */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
          Fuites budget 🚨
        </Text>
        <View style={styles.leaksRow}>
          <Card style={styles.leakCard}>
            <Text style={{ fontSize: 22 }}>📱</Text>
            <Text style={[styles.leakTitle, { color: theme.text.secondary }]}>Forfaits</Text>
            <Text style={[styles.leakAmt, { color: COLORS.amber }]}>{formatFCFA(forfait)}</Text>
            <Text style={[styles.leakHint, { color: theme.text.muted }]}>Consolider les forfaits</Text>
          </Card>
          <Card style={styles.leakCard}>
            <Text style={{ fontSize: 22 }}>😬</Text>
            <Text style={[styles.leakTitle, { color: theme.text.secondary }]}>Impulsifs</Text>
            <Text style={[styles.leakAmt, { color: COLORS.red }]}>{formatFCFA(impulseTotal)}</Text>
            <Text style={[styles.leakHint, { color: theme.text.muted }]}>Règle des 24h</Text>
          </Card>
          <Card style={styles.leakCard}>
            <Text style={{ fontSize: 22 }}>🍢</Text>
            <Text style={[styles.leakTitle, { color: theme.text.secondary }]}>Maquis</Text>
            <Text style={[styles.leakAmt, { color: COLORS.pink }]}>{formatFCFA(maquis)}</Text>
            <Text style={[styles.leakHint, { color: theme.text.muted }]}>Limiter sorties</Text>
          </Card>
        </View>
      </View>

      {/* Donut chart */}
      {catSpending.length > 0 && (
        <Card style={{ marginHorizontal: SPACING.screen, alignItems: 'center', gap: SPACING.md }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Répartition des dépenses</Text>
          <DonutChart
            segments={catSpending}
            size={160}
            centerLabel={formatFCFA(totalExpenses)}
          />
          <View style={styles.legend}>
            {catSpending.map(s => (
              <View key={s.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text style={[styles.legendText, { color: theme.text.secondary }]}>
                  {s.label} {totalExpenses > 0 ? Math.round(s.value / totalExpenses * 100) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Coach Chat */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
          Coach IA 🤖
        </Text>
        <CoachChat />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    width: '100%',
  },
  healthDetails: {
    flex: 1,
    gap: SPACING.sm,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  scoreVal: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  totalScore: {
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  predRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  predAmount: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  predText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  leaksRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  leakCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  leakTitle: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  leakAmt: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  leakHint: {
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
  },
  legend: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
