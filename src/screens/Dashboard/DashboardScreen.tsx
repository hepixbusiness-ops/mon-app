import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotifStore } from '../../store/useNotifStore';
import { SPACING, RADIUS } from '../../constants/theme';
import Screen from '../../components/layout/Screen';
import PersoHome from './PersoHome';
import BizHome from './BizHome';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { firstName, mode, setMode } = useSettingsStore();
  const unreadCount = useNotifStore(s => s.unreadCount);
  const [localMode, setLocalMode] = useState(mode);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  function handleModeSwitch(m: 'perso' | 'commerce') {
    setLocalMode(m);
    setMode(m);
  }

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: theme.text.primary }]}>
            Bonjour {firstName || 'vous'} 👋
          </Text>
          <Text style={[styles.date, { color: theme.text.muted }]}>{today}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.iconBtn, { backgroundColor: theme.overlay }]}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.red }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.avatar, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.avatarText}>{(firstName || 'U')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode switcher */}
      <View style={[styles.segmented, { backgroundColor: theme.overlay, marginHorizontal: SPACING.screen }]}>
        <TouchableOpacity
          onPress={() => handleModeSwitch('perso')}
          style={[styles.segTab, localMode === 'perso' && { backgroundColor: theme.accent, borderRadius: RADIUS.sm }]}
        >
          <Text style={[styles.segLabel, { color: localMode === 'perso' ? '#fff' : theme.text.secondary }]}>
            👤 Perso
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleModeSwitch('commerce')}
          style={[styles.segTab, localMode === 'commerce' && { backgroundColor: theme.accent, borderRadius: RADIUS.sm }]}
        >
          <Text style={[styles.segLabel, { color: localMode === 'commerce' ? '#fff' : theme.text.secondary }]}>
            🏪 Commerce
          </Text>
        </TouchableOpacity>
      </View>

      {localMode === 'perso' ? <PersoHome /> : <BizHome />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  date: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm + 2,
    padding: 3,
    marginVertical: SPACING.md,
  },
  segTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  segLabel: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
