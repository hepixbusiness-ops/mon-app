import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING } from '../../constants/theme';

interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export default function Header({ title, rightAction, showBack }: HeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border.subtle }]}>
      {(showBack || canGoBack) ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={{ color: theme.accent, fontSize: 22 }}>←</Text>
        </TouchableOpacity>
      ) : <View style={styles.backBtn} />}

      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>

      <View style={styles.rightAction}>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  rightAction: {
    width: 36,
    alignItems: 'flex-end',
  },
});
