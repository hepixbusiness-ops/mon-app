import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import RingChart from '../../components/ui/RingChart';
import MethodBadge from '../../components/ui/MethodBadge';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PersoHome() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { transactions, categories, getTotalExpenses, getTotalIncome, getCategorySpending } = useFinanceStore();
  const { monthlyBudget } = useSettingsStore();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalExpenses = getTotalExpenses(month);
  const totalIncome = getTotalIncome(month);
  const remaining = monthlyBudget - totalExpenses;

  // Day of month for projection
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedExpense = dayOfMonth > 0 ? (totalExpenses / dayOfMonth) * daysInMonth : 0;

  // Top categories
  const expCats = categories.filter(c => c.type === 'expense');
  const catSpending = expCats
    .map(c => ({ ...c, spent: getCategorySpending(c.id, month) }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  // Recent transactions
  const recent = transactions.slice(0, 4);

  // Coach tip
  const tips = [
    `Vous avez dépensé ${formatFCFA(totalExpenses)} ce mois.`,
    remaining > 0 ? `Il vous reste ${formatFCFA(remaining)} pour finir le mois.` : `Vous avez dépassé votre budget de ${formatFCFA(-remaining)} !`,
    `Meilleur conseil: planifiez vos achats à l'avance.`,
  ];
  const tip = tips[Math.floor(Date.now() / 86400000) % tips.length];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Budget Ring */}
      <Card style={{ marginHorizontal: SPACING.screen, alignItems: 'center', gap: SPACING.md }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Budget du mois</Text>
        <RingChart used={totalExpenses} total={monthlyBudget} size={160} />
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.text.muted }]}>Dépensé</Text>
            <Text style={[styles.budgetAmount, { color: COLORS.red }]}>{formatFCFA(totalExpenses)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: theme.text.muted }]}>Restant</Text>
            <Text style={[styles.budgetAmount, { color: remaining >= 0 ? COLORS.green : COLORS.red }]}>
              {formatFCFA(Math.abs(remaining))}
            </Text>
          </View>
        </View>
      </Card>

      {/* AI Forecast */}
      <Card style={{ marginHorizontal: SPACING.screen }}>
        <View style={styles.forecastRow}>
          <Text style={{ fontSize: 28 }}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.forecastTitle, { color: theme.text.primary }]}>Prévision IA</Text>
            <Text style={[styles.forecastText, { color: theme.text.secondary }]}>
              À ce rythme vous dépenserez{' '}
              <Text style={{ color: projectedExpense > monthlyBudget ? COLORS.red : COLORS.green, fontFamily: 'PlusJakartaSans_700Bold' }}>
                {formatFCFA(projectedExpense)}
              </Text>
              {' '}ce mois
            </Text>
          </View>
        </View>
      </Card>

      {/* KPIs */}
      <View style={[styles.kpiRow, { marginHorizontal: SPACING.screen }]}>
        <Card style={[styles.kpiCard, { flex: 1 }]}>
          <Text style={{ fontSize: 20 }}>📈</Text>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Entrées</Text>
          <Text style={[styles.kpiAmount, { color: COLORS.green }]}>{formatFCFA(totalIncome)}</Text>
        </Card>
        <Card style={[styles.kpiCard, { flex: 1 }]}>
          <Text style={{ fontSize: 20 }}>📉</Text>
          <Text style={[styles.kpiLabel, { color: theme.text.muted }]}>Sorties</Text>
          <Text style={[styles.kpiAmount, { color: COLORS.red }]}>{formatFCFA(totalExpenses)}</Text>
        </Card>
      </View>

      {/* Weekly challenge */}
      <Card style={{ marginHorizontal: SPACING.screen }}>
        <View style={styles.challengeRow}>
          <Text style={{ fontSize: 24 }}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.challengeTitle, { color: theme.text.primary }]}>Défi de la semaine</Text>
            <Text style={[styles.challengeText, { color: theme.text.secondary }]}>Moins de sorties maquis cette semaine</Text>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: COLORS.amber + '22' }]}>
            <Text style={{ color: COLORS.amber, fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' }}>+50 XP</Text>
          </View>
        </View>
        <View style={[styles.xpBar, { backgroundColor: theme.border.subtle }]}>
          <View style={[styles.xpFill, { backgroundColor: COLORS.amber, width: '65%' }]} />
        </View>
        <Text style={[{ color: theme.text.muted, fontSize: 11, marginTop: 4, fontFamily: 'PlusJakartaSans_400Regular' }]}>
          65/100 XP
        </Text>
      </Card>

      {/* Coach bubble */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Analysis' as any)}
        activeOpacity={0.8}
        style={{ marginHorizontal: SPACING.screen }}
      >
        <Card style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 24 }}>💡</Text>
          <Text style={[styles.coachText, { color: theme.text.secondary, flex: 1 }]}>{tip}</Text>
          <Text style={{ color: theme.accent, fontSize: 18 }}>›</Text>
        </Card>
      </TouchableOpacity>

      {/* Category bars */}
      {catSpending.length > 0 && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            Top catégories
          </Text>
          <Card>
            {catSpending.map((cat, i) => {
              const pct = cat.budget > 0 ? Math.min(cat.spent / cat.budget, 1) : 0.5;
              const barColor = pct >= 1 ? COLORS.red : pct >= 0.8 ? COLORS.amber : cat.color;
              return (
                <View key={cat.id} style={[styles.catRow, i < catSpending.length - 1 && { marginBottom: SPACING.md }]}>
                  <View style={styles.catHeader}>
                    <Text>{cat.emoji} <Text style={[styles.catName, { color: theme.text.primary }]}>{cat.name}</Text></Text>
                    <Text style={[styles.catAmount, { color: theme.text.secondary }]}>
                      {formatFCFA(cat.spent)}{cat.budget > 0 ? ` / ${formatFCFA(cat.budget)}` : ''}
                    </Text>
                  </View>
                  {cat.budget > 0 && (
                    <View style={[styles.barTrack, { backgroundColor: theme.border.subtle }]}>
                      <View style={[styles.barFill, { backgroundColor: barColor, width: `${Math.round(pct * 100)}%` }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            Activité récente
          </Text>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {recent.map((t, i) => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <View
                  key={t.id}
                  style={[
                    styles.txRow,
                    { borderBottomColor: theme.border.subtle },
                    i < recent.length - 1 && styles.txBorder,
                  ]}
                >
                  <View style={[styles.txIcon, { backgroundColor: (cat?.color || theme.accent) + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{cat?.emoji || '💳'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txDesc, { color: theme.text.primary }]} numberOfLines={1}>
                      {t.description}
                    </Text>
                    <Text style={[styles.txDate, { color: theme.text.muted }]}>{t.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={[styles.txAmount, { color: t.type === 'income' ? COLORS.green : COLORS.red }]}>
                      {t.type === 'income' ? '+' : '-'}{formatFCFA(t.amount)}
                    </Text>
                    <MethodBadge method={t.method as any} />
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetRow: {
    flexDirection: 'row',
    width: '100%',
  },
  budgetItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  budgetLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  budgetAmount: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  forecastTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  forecastText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
    lineHeight: 18,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  kpiCard: {
    gap: SPACING.xs,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  kpiAmount: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  challengeTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  challengeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  xpBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: 6,
    borderRadius: 3,
  },
  coachText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 18,
  },
  catRow: {},
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catName: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  catAmount: {
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
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  txBorder: {
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
  txDate: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
