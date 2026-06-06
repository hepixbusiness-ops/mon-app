import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SPACING, RADIUS } from '../../constants/theme';
import Screen from '../../components/layout/Screen';
import BudgetTab from './BudgetTab';
import SavingsTab from './SavingsTab';
import DebtsTab from './DebtsTab';
import ArdoiseTab from './ArdoiseTab';

const PERSO_TABS = ['Budget', 'Épargne', 'Dettes'] as const;

export default function BudgetScreen() {
  const theme = useTheme();
  const { mode } = useSettingsStore();
  const [activeTab, setActiveTab] = useState(0);

  if (mode === 'commerce') {
    return (
      <Screen>
        <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Ardoise clients</Text>
        </View>
        <ArdoiseTab />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Budget</Text>
      </View>

      {/* Tab selector */}
      <View style={[styles.tabRow, { marginHorizontal: SPACING.screen }]}>
        {PERSO_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[
              styles.tab,
              activeTab === i && { backgroundColor: theme.accent, borderColor: theme.accent },
              activeTab !== i && { borderColor: theme.border.subtle },
            ]}
          >
            <Text style={[styles.tabText, { color: activeTab === i ? '#fff' : theme.text.secondary }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 0 && <BudgetTab />}
      {activeTab === 1 && <SavingsTab />}
      {activeTab === 2 && <DebtsTab />}
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
  tabRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
