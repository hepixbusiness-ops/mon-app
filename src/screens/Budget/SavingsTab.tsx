import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import GoalSheet, { SheetRef as GoalSheetRef } from '../../components/sheets/GoalSheet';
import { Goal } from '../../types';

export default function SavingsTab() {
  const theme = useTheme();
  const { goals, tontine } = useFinanceStore();
  const goalSheetRef = useRef<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);

  function openGoalSheet(goal?: Goal) {
    setSelectedGoal(goal);
    goalSheetRef.current?.present();
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Tontine */}
      {tontine && (
        <View style={{ marginHorizontal: SPACING.screen }}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.sm }]}>
            Tontine
          </Text>
          <Card>
            <View style={styles.tontineRow}>
              <Text style={{ fontSize: 28 }}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tontineName, { color: theme.text.primary }]}>{tontine.name}</Text>
                <Text style={[styles.tontineDetail, { color: theme.text.muted }]}>
                  {tontine.members} membres · {formatFCFA(tontine.amountPerMonth)}/mois
                </Text>
                <Text style={[styles.tontineDetail, { color: theme.text.muted }]}>
                  Position: {tontine.position} · Tirage: {tontine.nextDrawDate}
                </Text>
              </View>
              <View style={[styles.potBadge, { backgroundColor: theme.accent + '22' }]}>
                <Text style={[styles.potAmt, { color: theme.accent }]}>{formatFCFA(tontine.potAmount)}</Text>
                <Text style={[styles.potLabel, { color: theme.text.muted }]}>Pot</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Goals */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        <View style={styles.goalsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Objectifs</Text>
          <TouchableOpacity onPress={() => openGoalSheet()} style={[styles.addBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.addBtnText}>+ Nouvel objectif</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 && (
          <Card style={{ alignItems: 'center', gap: SPACING.md }}>
            <Text style={{ fontSize: 40 }}>🎯</Text>
            <Text style={[{ color: theme.text.muted, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center' }]}>
              Créez votre premier objectif d'épargne
            </Text>
          </Card>
        )}

        {goals.map(goal => {
          const pct = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0;
          const statusColor = goal.status === 'completed' ? COLORS.green : goal.status === 'paused' ? COLORS.amber : theme.accent;

          return (
            <TouchableOpacity key={goal.id} onPress={() => openGoalSheet(goal)} activeOpacity={0.8}>
              <Card style={{ marginBottom: SPACING.sm }}>
                <View style={styles.goalRow}>
                  <View style={[styles.goalIcon, { backgroundColor: theme.accent + '22' }]}>
                    <Text style={{ fontSize: 24 }}>{goal.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalName, { color: theme.text.primary }]}>{goal.name}</Text>
                    <Text style={[styles.goalDetail, { color: theme.text.muted }]}>
                      {formatFCFA(goal.savedAmount)} / {formatFCFA(goal.targetAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[styles.statusChip, { backgroundColor: statusColor + '22' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {goal.status === 'completed' ? '✅ Terminé' : goal.status === 'paused' ? '⏸ Pause' : '🎯 Actif'}
                      </Text>
                    </View>
                    <Text style={[styles.goalPct, { color: statusColor }]}>{Math.round(pct * 100)}%</Text>
                  </View>
                </View>
                <View style={[styles.barTrack, { backgroundColor: theme.border.subtle, marginTop: SPACING.sm }]}>
                  <View style={[styles.barFill, { backgroundColor: statusColor, width: `${Math.round(pct * 100)}%` }]} />
                </View>
                {goal.monthlyAmount > 0 && (
                  <Text style={[{ color: theme.text.muted, fontSize: 11, marginTop: SPACING.xs, fontFamily: 'PlusJakartaSans_400Regular' }]}>
                    Épargne mensuelle: {formatFCFA(goal.monthlyAmount)}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <GoalSheet ref={goalSheetRef} goal={selectedGoal} onClose={() => setSelectedGoal(undefined)} />
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
  tontineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tontineName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tontineDetail: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  potBadge: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  potAmt: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  potLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  goalDetail: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  goalPct: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
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
});
