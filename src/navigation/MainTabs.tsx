import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING } from '../constants/theme';
import { MainTabParamList } from './types';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import AnalysisScreen from '../screens/Analysis/AnalysisScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import QuickAddSheet, { SheetRef } from '../components/sheets/QuickAddSheet';

const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen() { return <View />; }

export default function MainTabs() {
  const theme = useTheme();
  const quickAddRef = useRef<SheetRef>(null);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <CustomTabBar {...props} onPressFAB={() => quickAddRef.current?.present()} theme={theme} />
        )}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Add" component={PlaceholderScreen} />
        <Tab.Screen name="Analysis" component={AnalysisScreen} />
        <Tab.Screen name="Budget" component={BudgetScreen} />
      </Tab.Navigator>
      <QuickAddSheet ref={quickAddRef} />
    </>
  );
}

function CustomTabBar({ state, navigation, onPressFAB, theme }: any) {
  const tabs = [
    { name: 'Dashboard', emoji: '🏠', label: 'Accueil' },
    { name: 'History', emoji: '📋', label: 'Historique' },
    { name: 'Add', emoji: '+', label: '', isFAB: true },
    { name: 'Analysis', emoji: '📊', label: 'Analyse' },
    { name: 'Budget', emoji: '💰', label: 'Budget' },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border.subtle }]}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        if (tab.isFAB) {
          return (
            <TouchableOpacity key={tab.name} onPress={onPressFAB}
              style={[styles.fab, { backgroundColor: theme.accent }]} activeOpacity={0.85}>
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={tab.name} onPress={() => navigation.navigate(tab.name)}
            style={styles.tabItem} activeOpacity={0.7}>
            <Text style={[styles.tabEmoji, { opacity: isFocused ? 1 : 0.5 }]}>{tab.emoji}</Text>
            <Text style={[styles.tabLabel, { color: isFocused ? theme.accent : theme.text.muted }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', alignItems: 'center', paddingBottom: 24, paddingTop: 10, borderTopWidth: 1, height: 80 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 2 },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#7c6af7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
