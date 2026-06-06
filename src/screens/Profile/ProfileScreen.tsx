import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS, COLORS } from '../../constants/theme';
import Screen from '../../components/layout/Screen';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const BADGES = [
  { id: 'first_tx', emoji: '🎯', name: 'Première dépense', earned: true },
  { id: 'tontine', emoji: '🤝', name: 'Tontine à jour', earned: true },
  { id: 'budget', emoji: '💰', name: 'Budget respecté', earned: true },
  { id: 'savings', emoji: '💎', name: 'Épargnant', earned: true },
  { id: 'week', emoji: '📅', name: '7 jours consécutifs', earned: false },
  { id: 'month', emoji: '🏆', name: 'Un mois complet', earned: false },
  { id: 'debt_free', emoji: '🚀', name: 'Zéro dette', earned: false },
  { id: 'coach', emoji: '🤖', name: 'Coach fidèle', earned: false },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { firstName, setOnboardingDone, setPinEnabled } = useSettingsStore();
  const { transactions } = useFinanceStore();

  // XP & Level
  const xp = transactions.length * 25 + BADGES.filter(b => b.earned).length * 100;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;

  const menuItems = [
    { icon: '⚙️', label: 'Réglages', onPress: () => navigation.navigate('Settings') },
    { icon: '🔐', label: 'Sécurité', onPress: () => navigation.navigate('Settings') },
    { icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: '📊', label: 'Mes données', onPress: () => {} },
  ];

  return (
    <Screen scroll>
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Profil</Text>
      </View>

      {/* Avatar */}
      <View style={[styles.avatarSection, { paddingHorizontal: SPACING.screen }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>{(firstName || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text.primary }]}>{firstName || 'Utilisateur'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.editText, { color: theme.accent }]}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>

      {/* Level */}
      <View style={[styles.levelCard, { backgroundColor: theme.card, marginHorizontal: SPACING.screen, borderColor: theme.border.subtle }]}>
        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { backgroundColor: theme.accent }]}>
            <Text style={styles.levelText}>Niv. {level}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.levelLabel, { color: theme.text.secondary }]}>
              {xpInLevel} / 500 XP pour le niveau {level + 1}
            </Text>
            <View style={[styles.xpBar, { backgroundColor: theme.border.subtle }]}>
              <View style={[styles.xpFill, { backgroundColor: theme.accent, width: `${(xpInLevel / 500) * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary, marginBottom: SPACING.md }]}>
          Badges ({BADGES.filter(b => b.earned).length}/{BADGES.length})
        </Text>
        <View style={styles.badgesGrid}>
          {BADGES.map(badge => (
            <View
              key={badge.id}
              style={[
                styles.badgeItem,
                {
                  backgroundColor: badge.earned ? theme.card : theme.overlay,
                  borderColor: badge.earned ? theme.accent + '44' : theme.border.subtle,
                  opacity: badge.earned ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[styles.badgeEmoji, { opacity: badge.earned ? 1 : 0.4 }]}>{badge.emoji}</Text>
              <Text style={[styles.badgeName, { color: badge.earned ? theme.text.primary : theme.text.muted }]}>
                {badge.name}
              </Text>
              {!badge.earned && (
                <Text style={[styles.badgeLocked, { color: theme.text.muted }]}>🔒</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.menu, { marginHorizontal: SPACING.screen, backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={item.onPress}
            style={[styles.menuItem, i < menuItems.length - 1 && { borderBottomColor: theme.border.subtle, borderBottomWidth: 1 }]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: theme.text.primary }]}>{item.label}</Text>
            <Text style={{ color: theme.text.muted, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom links */}
      <View style={[styles.bottomLinks, { marginHorizontal: SPACING.screen }]}>
        <TouchableOpacity onPress={() => { setOnboardingDone(false); navigation.replace('Onboarding'); }}>
          <Text style={[styles.linkText, { color: theme.text.muted }]}>🔄 Revoir l'introduction</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Lock')}>
          <Text style={[styles.linkText, { color: theme.text.muted }]}>🔒 Verrouiller l'app</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={[styles.linkText, { color: COLORS.red }]}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </View>
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
  avatarSection: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  name: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  editText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  levelCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  levelLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginBottom: SPACING.xs,
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  badgeItem: {
    width: '47%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
  badgeLocked: {
    fontSize: 12,
  },
  menu: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  bottomLinks: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
  },
});
