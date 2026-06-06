import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS, COLORS, ACCENTS, formatFCFA } from '../../constants/theme';
import { CURRENCIES } from '../../constants/currencies';
import Screen from '../../components/layout/Screen';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    currency, setCurrency,
    theme: themeMode, setTheme,
    accent, setAccent,
    language, setLanguage,
    pinEnabled, setPinEnabled,
    firstName, setFirstName,
    walletName, setWalletName,
  } = useSettingsStore();

  const { transactions } = useFinanceStore();
  const recurring = transactions.filter(t => t.recurring);

  return (
    <Screen scroll>
      <View style={[styles.header, { paddingHorizontal: SPACING.screen }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Réglages</Text>
      </View>

      {/* Profile info */}
      <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Profil</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: theme.text.muted }]}>Prénom</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
              placeholderTextColor={theme.text.muted}
              style={[styles.inlineInput, { color: theme.text.primary }]}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: theme.text.muted }]}>Portefeuille</Text>
            <TextInput
              value={walletName}
              onChangeText={setWalletName}
              placeholder="Nom du portefeuille"
              placeholderTextColor={theme.text.muted}
              style={[styles.inlineInput, { color: theme.text.primary }]}
            />
          </View>
        </View>
      </View>

      {/* Currency */}
      <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Devise</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
          {CURRENCIES.map((c, i) => (
            <View key={c.code}>
              <TouchableOpacity onPress={() => setCurrency(c.code)} style={styles.radioRow}>
                <View style={[styles.radio, { borderColor: currency === c.code ? theme.accent : theme.border.default }]}>
                  {currency === c.code && <View style={[styles.radioDot, { backgroundColor: theme.accent }]} />}
                </View>
                <Text style={[styles.radioLabel, { color: theme.text.primary }]}>
                  {c.symbol} — {c.name}
                </Text>
              </TouchableOpacity>
              {i < CURRENCIES.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />}
            </View>
          ))}
        </View>
      </View>

      {/* Appearance */}
      <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Apparence</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text.primary }]}>Mode sombre 🌙</Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={v => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: theme.border.default, true: theme.accent + '66' }}
              thumbColor={themeMode === 'dark' ? theme.accent : theme.text.muted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />
          <Text style={[styles.inputLabel, { color: theme.text.muted, marginBottom: SPACING.sm }]}>Couleur d'accent</Text>
          <View style={styles.accentsRow}>
            {ACCENTS.map(a => (
              <TouchableOpacity
                key={a}
                onPress={() => setAccent(a)}
                style={[
                  styles.accentDot,
                  { backgroundColor: a },
                  accent === a && styles.accentSelected,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Language */}
      <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Langue</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
          <View style={styles.langRow}>
            {(['fr', 'en'] as const).map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langBtn, {
                  backgroundColor: language === lang ? theme.accent : theme.overlay,
                  borderColor: language === lang ? theme.accent : theme.border.subtle,
                }]}
              >
                <Text style={[styles.langText, { color: language === lang ? '#fff' : theme.text.secondary }]}>
                  {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Security */}
      <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Sécurité</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text.primary }]}>🔐 Code PIN activé</Text>
            <Switch
              value={pinEnabled}
              onValueChange={setPinEnabled}
              trackColor={{ false: theme.border.default, true: theme.accent + '66' }}
              thumbColor={pinEnabled ? theme.accent : theme.text.muted}
            />
          </View>
          {pinEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />
              <TouchableOpacity style={styles.rowItem}>
                <Text style={[styles.switchLabel, { color: theme.text.primary }]}>Changer le PIN</Text>
                <Text style={{ color: theme.text.muted, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            </>
          )}
          <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text.primary }]}>📡 Mode hors-ligne</Text>
            <View style={[styles.statusDot, { backgroundColor: COLORS.green }]}>
              <Text style={styles.statusText}>Actif</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recurring transactions */}
      {recurring.length > 0 && (
        <View style={[styles.section, { marginHorizontal: SPACING.screen }]}>
          <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Transactions récurrentes</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
            {recurring.map((t, i) => (
              <View key={t.id}>
                <View style={styles.recurRow}>
                  <Text style={[styles.recurDesc, { color: theme.text.primary }]}>{t.description}</Text>
                  <Text style={[styles.recurAmt, { color: t.type === 'income' ? COLORS.green : COLORS.red }]}>
                    {t.type === 'income' ? '+' : '-'}{formatFCFA(t.amount)}
                  </Text>
                  <Text style={[styles.recurDate, { color: theme.text.muted }]}>🔄 Mensuel</Text>
                </View>
                {i < recurring.length - 1 && <View style={[styles.divider, { backgroundColor: theme.border.subtle }]} />}
              </View>
            ))}
          </View>
        </View>
      )}
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
  section: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    width: 100,
  },
  inlineInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.lg,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  accentsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  accentDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  accentSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  langRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  langBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  langText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  statusDot: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  recurRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  recurDesc: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  recurAmt: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  recurDate: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
