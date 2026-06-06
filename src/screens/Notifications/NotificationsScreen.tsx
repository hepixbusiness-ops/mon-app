import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifStore } from '../../store/useNotifStore';
import { SPACING, RADIUS, COLORS } from '../../constants/theme';
import Screen from '../../components/layout/Screen';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_ICONS: Record<string, string> = {
  budget: '⚠️',
  tontine: '🤝',
  relance: '📱',
  badge: '🏅',
  info: 'ℹ️',
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const { notifications, markRead, markAllRead, clearAll, loadNotifications } = useNotifStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <Screen>
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markAll, { color: theme.accent }]}>Tout lu</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🔔</Text>
          <Text style={[styles.emptyText, { color: theme.text.muted }]}>Aucune notification</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={{ paddingHorizontal: SPACING.screen, paddingBottom: 32 }}
          renderItem={({ item }) => {
            const timeAgo = (() => {
              try {
                return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr });
              } catch {
                return '';
              }
            })();

            return (
              <TouchableOpacity
                onPress={() => markRead(item.id)}
                activeOpacity={0.7}
                style={[
                  styles.notifRow,
                  {
                    backgroundColor: item.read ? theme.card : theme.accent + '11',
                    borderColor: item.read ? theme.border.subtle : theme.accent + '44',
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.overlay }]}>
                  <Text style={{ fontSize: 22 }}>{TYPE_ICONS[item.type] || 'ℹ️'}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, { color: theme.text.primary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!item.read && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />
                    )}
                  </View>
                  <Text style={[styles.notifBody, { color: theme.text.secondary }]} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: theme.text.muted }]}>{timeAgo}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity onPress={clearAll} style={[styles.clearBtn, { borderColor: COLORS.red }]}>
              <Text style={[styles.clearText, { color: COLORS.red }]}>🗑️ Tout effacer</Text>
            </TouchableOpacity>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  markAll: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  notifRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  clearBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
