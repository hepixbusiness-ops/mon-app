import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SPACING, RADIUS, COLORS } from '../../constants/theme';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { setMode, setCurrency, setFirstName, setWalletName, setOnboardingDone, setPinEnabled, saveSetting } = useSettingsStore();

  const [step, setStep] = useState(0);
  const [mode, setLocalMode] = useState<'perso' | 'commerce'>('perso');
  const [currency, setLocalCurrency] = useState('XOF');
  const [firstName, setLocalFirstName] = useState('');
  const [walletName, setLocalWalletName] = useState('');
  const [pinChoice, setPinChoice] = useState<'set' | 'skip' | null>(null);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [pinError, setPinError] = useState('');

  const TOTAL_STEPS = 4;
  const CURRENCIES = ['XOF', 'EUR', 'USD'];

  const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
  ];

  function handleNext() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function handlePinKey(key: string) {
    if (pinStep === 'enter') {
      if (key === '⌫') { setPin(p => p.slice(0, -1)); return; }
      const next = pin + key;
      if (next.length <= 4) setPin(next);
      if (next.length === 4) {
        setTimeout(() => setPinStep('confirm'), 200);
      }
    } else {
      if (key === '⌫') { setPinConfirm(p => p.slice(0, -1)); setPinError(''); return; }
      const next = pinConfirm + key;
      if (next.length <= 4) setPinConfirm(next);
      if (next.length === 4) {
        if (next === pin) {
          // valid — will proceed in handleFinish
        } else {
          setPinError('Les codes ne correspondent pas. Réessaie.');
          setTimeout(() => { setPinConfirm(''); setPinError(''); }, 1200);
        }
      }
    }
  }

  function handleFinish() {
    setMode(mode);
    setCurrency(currency);
    setFirstName(firstName || 'Utilisateur');
    setWalletName(walletName || 'Mon Portefeuille');

    if (pinChoice === 'set' && pin.length === 4 && pin === pinConfirm) {
      setPinEnabled(true);
      saveSetting('pin', pin);
      setOnboardingDone(true);
      navigation.replace('Lock');
    } else {
      setPinEnabled(false);
      setOnboardingDone(true);
      navigation.replace('Main');
    }
  }

  function handleSkip() {
    setPinEnabled(false);
    setOnboardingDone(true);
    navigation.replace('Main');
  }

  const pinDisplay = pinStep === 'enter' ? pin : pinConfirm;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {step < TOTAL_STEPS && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={{ color: theme.text.muted, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' }}>Passer</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>💸</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Bienvenue sur FinanceOS</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Gérez vos finances en FCFA, suivez vos dépenses et atteignez vos objectifs financiers.
            </Text>
            <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { backgroundColor: theme.accent }]}>
              <Text style={styles.primaryBtnText}>Commencer</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>🎯</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Quel est votre profil ?</Text>
            <View style={styles.cards}>
              <TouchableOpacity
                onPress={() => setLocalMode('perso')}
                style={[styles.modeCard, {
                  backgroundColor: mode === 'perso' ? theme.accent + '22' : theme.card,
                  borderColor: mode === 'perso' ? theme.accent : theme.border.subtle,
                }]}
              >
                <Text style={styles.modeEmoji}>👤</Text>
                <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Particulier</Text>
                <Text style={[styles.modeDesc, { color: theme.text.muted }]}>Gérer mon budget personnel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setLocalMode('commerce')}
                style={[styles.modeCard, {
                  backgroundColor: mode === 'commerce' ? theme.accent + '22' : theme.card,
                  borderColor: mode === 'commerce' ? theme.accent : theme.border.subtle,
                }]}
              >
                <Text style={styles.modeEmoji}>🏪</Text>
                <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Commerçant</Text>
                <Text style={[styles.modeDesc, { color: theme.text.muted }]}>Gérer ma boutique et clients</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { backgroundColor: theme.accent }]}>
              <Text style={styles.primaryBtnText}>Suivant</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>😊</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Votre profil</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>Votre prénom</Text>
              <TextInput
                value={firstName}
                onChangeText={setLocalFirstName}
                placeholder="Ex: Marie"
                placeholderTextColor={theme.text.muted}
                style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>Nom du portefeuille</Text>
              <TextInput
                value={walletName}
                onChangeText={setLocalWalletName}
                placeholder="Ex: Mon Portefeuille"
                placeholderTextColor={theme.text.muted}
                style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
              />
            </View>
            <TouchableOpacity onPress={handleNext} style={[styles.primaryBtn, { backgroundColor: theme.accent }]}>
              <Text style={styles.primaryBtnText}>Suivant</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>🔐</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Protéger l'appli ?</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Définissez un code PIN à 4 chiffres pour sécuriser vos données financières.
            </Text>
            <View style={styles.cards}>
              <TouchableOpacity
                onPress={() => { setPinChoice('set'); handleNext(); }}
                style={[styles.modeCard, {
                  backgroundColor: theme.card,
                  borderColor: theme.accent,
                }]}
              >
                <Text style={styles.modeEmoji}>🔒</Text>
                <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Créer un PIN</Text>
                <Text style={[styles.modeDesc, { color: theme.text.muted }]}>Recommandé pour plus de sécurité</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setPinChoice('skip'); handleFinish(); }}
                style={[styles.modeCard, {
                  backgroundColor: theme.card,
                  borderColor: theme.border.subtle,
                }]}
              >
                <Text style={styles.modeEmoji}>🚀</Text>
                <Text style={[styles.modeTitle, { color: theme.text.primary }]}>Sans PIN</Text>
                <Text style={[styles.modeDesc, { color: theme.text.muted }]}>Accès direct à l'application</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && pinChoice === 'set' && (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>🔒</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {pinStep === 'enter' ? 'Créez votre PIN' : 'Confirmez votre PIN'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              {pinStep === 'enter' ? 'Choisissez 4 chiffres' : 'Entrez à nouveau le même code'}
            </Text>

            {pinError ? (
              <Text style={{ color: COLORS.red, fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13 }}>{pinError}</Text>
            ) : null}

            {/* Dots */}
            <View style={styles.pinDots}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[styles.pinDot, {
                  backgroundColor: i < pinDisplay.length ? theme.accent : 'transparent',
                  borderColor: i < pinDisplay.length ? theme.accent : theme.border.default,
                }]} />
              ))}
            </View>

            {/* Numpad */}
            <View style={styles.numpad}>
              {KEYS.map((row, ri) => (
                <View key={ri} style={styles.numRow}>
                  {row.map((key, ki) => (
                    key === '' ? (
                      <View key={ki} style={styles.emptyKey} />
                    ) : (
                      <TouchableOpacity key={ki} onPress={() => handlePinKey(key)}
                        style={[styles.numKey, { backgroundColor: theme.overlay }]} activeOpacity={0.7}>
                        <Text style={[styles.numKeyText, { color: theme.text.primary }]}>{key}</Text>
                      </TouchableOpacity>
                    )
                  ))}
                </View>
              ))}
            </View>

            {pinStep === 'confirm' && pin === pinConfirm && pinConfirm.length === 4 && (
              <TouchableOpacity onPress={handleFinish} style={[styles.primaryBtn, { backgroundColor: theme.accent }]}>
                <Text style={styles.primaryBtnText}>Terminer ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[styles.dot, {
              backgroundColor: i === Math.min(step, 3) ? theme.accent : theme.border.default,
              width: i === Math.min(step, 3) ? 20 : 8,
            }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: SPACING.screen,
    zIndex: 10,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screen,
    paddingTop: 80,
    paddingBottom: 80,
  },
  stepContainer: {
    alignItems: 'center',
    gap: SPACING.xl,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryBtn: {
    height: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  cards: {
    width: '100%',
    gap: SPACING.md,
  },
  modeCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modeEmoji: {
    fontSize: 36,
  },
  modeTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modeDesc: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  currencyChip: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  inputGroup: {
    width: '100%',
    gap: SPACING.xs,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  input: {
    height: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    borderWidth: 1,
  },
  pinDots: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  numpad: {
    gap: SPACING.md,
  },
  numRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  numKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyKey: {
    width: 72,
    height: 72,
  },
  numKeyText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  dots: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
