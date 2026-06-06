import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Switch, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS, COLORS, formatFCFA } from '../../constants/theme';
import { PAYMENT_METHOD_LIST } from '../../constants/methods';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import NumPad from '../../components/ui/NumPad';
import EmotionPicker from '../../components/ui/EmotionPicker';
import CategoryGrid from '../../components/ui/CategoryGrid';
import Screen from '../../components/layout/Screen';
import { showToast } from '../../components/ui/Toast';
import { Transaction, Category } from '../../types';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CUSTOM_EMOJIS = ['🏠', '🛒', '🚕', '🍢', '📱', '❤️', '💸', '💡', '🎓', '🎉', '🚀', '💼', '🌍', '🎮', '🏋️', '🎸', '💊', '🐕', '🌿', '🍕'];

export default function EntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { transactions, categories, addTransaction, updateTransaction } = useFinanceStore();

  const editTx: Transaction | undefined = route.params?.transaction;

  const [type, setType] = useState<'expense' | 'income'>(editTx?.type || 'expense');
  const [amountStr, setAmountStr] = useState(editTx ? String(editTx.amount) : '');
  const [categoryId, setCategoryId] = useState(editTx?.categoryId || '');
  const [description, setDescription] = useState(editTx?.description || '');
  const [method, setMethod] = useState<'cash' | 'mtn' | 'om' | 'card'>(editTx?.method || 'cash');
  const [emotion, setEmotion] = useState(editTx?.emotion || '');
  const [recurring, setRecurring] = useState(editTx?.recurring || false);

  // Custom category modal
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🎯');
  const { addCategory } = useFinanceStore();

  const allCats = categories.length > 0 ? categories : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map(c => ({ ...c, budget: c.budget || 0 }));
  const displayCats = allCats.filter(c => c.type === type || c.type === 'both');

  const amount = parseFloat(amountStr.replace(',', '.')) || 0;
  const canSave = amount > 0 && categoryId.length > 0;

  function handleNumPad(key: string) {
    if (key === '⌫') {
      setAmountStr(s => s.slice(0, -1));
    } else if (key === ',') {
      if (!amountStr.includes(',') && !amountStr.includes('.')) {
        setAmountStr(s => s + ',');
      }
    } else {
      setAmountStr(s => s + key);
    }
  }

  function handleSave() {
    if (!canSave) return;
    const today = new Date().toISOString().split('T')[0];

    if (editTx) {
      updateTransaction({
        ...editTx,
        type,
        amount,
        categoryId,
        description,
        method,
        emotion: emotion || undefined,
        recurring,
        date: editTx.date,
        pending: editTx.pending,
      });
      showToast('Transaction modifiée !', 'success');
    } else {
      addTransaction({
        type,
        amount,
        categoryId,
        description,
        method,
        emotion: emotion || undefined,
        date: today,
        pending: false,
        recurring,
      });
      showToast('Transaction ajoutée !', 'success');
    }
    navigation.goBack();
  }

  function handleCreateCategory() {
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      emoji: newCatEmoji,
      color: theme.accent,
      budget: 0,
      type,
    });
    setShowNewCat(false);
    setNewCatName('');
  }

  const accentColor = type === 'expense' ? COLORS.red : COLORS.green;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
              <Text style={{ color: theme.text.muted, fontSize: 22 }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.screenTitle, { color: theme.text.primary }]}>
              {editTx ? 'Modifier' : 'Nouvelle entrée'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Toggle */}
          <View style={[styles.toggle, { backgroundColor: theme.overlay }]}>
            <TouchableOpacity
              onPress={() => { setType('expense'); setCategoryId(''); }}
              style={[styles.toggleBtn, type === 'expense' && { backgroundColor: COLORS.red, borderRadius: RADIUS.sm }]}
            >
              <Text style={[styles.toggleText, { color: type === 'expense' ? '#fff' : theme.text.secondary }]}>
                − Dépense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setType('income'); setCategoryId(''); }}
              style={[styles.toggleBtn, type === 'income' && { backgroundColor: COLORS.green, borderRadius: RADIUS.sm }]}
            >
              <Text style={[styles.toggleText, { color: type === 'income' ? '#fff' : theme.text.secondary }]}>
                + Revenu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount display */}
          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, { color: accentColor }]}>
              {amountStr ? formatFCFA(amount) : '0 FCFA'}
            </Text>
          </View>

          {/* NumPad */}
          <NumPad onPress={handleNumPad} />

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Catégorie</Text>
            <CategoryGrid
              categories={displayCats}
              selected={categoryId}
              onSelect={setCategoryId}
              onCreateNew={() => setShowNewCat(true)}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ajouter une note..."
              placeholderTextColor={theme.text.muted}
              style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
            />
          </View>

          {/* Method */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Moyen de paiement</Text>
            <View style={styles.methodRow}>
              {PAYMENT_METHOD_LIST.map(m => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMethod(m.id as any)}
                  style={[
                    styles.methodChip,
                    {
                      backgroundColor: method === m.id ? m.color + '22' : theme.overlay,
                      borderColor: method === m.id ? m.color : theme.border.subtle,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14 }}>{m.emoji}</Text>
                  <Text style={[styles.methodLabel, { color: method === m.id ? m.color : theme.text.secondary }]}>
                    {m.short}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emotion (expense only) */}
          {type === 'expense' && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Ressenti</Text>
              <EmotionPicker value={emotion} onChange={setEmotion} />
            </View>
          )}

          {/* Recurring toggle */}
          <View style={[styles.toggleRow, { borderColor: theme.border.subtle }]}>
            <Text style={[styles.toggleRowLabel, { color: theme.text.primary }]}>🔄 Répéter chaque mois</Text>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ false: theme.border.default, true: theme.accent + '66' }}
              thumbColor={recurring ? theme.accent : theme.text.muted}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave}
            style={[styles.saveBtn, { backgroundColor: canSave ? accentColor : theme.border.subtle }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveBtnText, { color: canSave ? '#fff' : theme.text.muted }]}>
              Enregistrer
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* New Category Modal */}
      <Modal visible={showNewCat} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Nouvelle catégorie</Text>
            <TextInput
              value={newCatName}
              onChangeText={setNewCatName}
              placeholder="Nom de la catégorie"
              placeholderTextColor={theme.text.muted}
              style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]}
              autoFocus
            />
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {CUSTOM_EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    onPress={() => setNewCatEmoji(e)}
                    style={[styles.emojiBtn, { backgroundColor: newCatEmoji === e ? theme.accent + '22' : theme.overlay, borderColor: newCatEmoji === e ? theme.accent : 'transparent' }]}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowNewCat(false)} style={[styles.modalBtn, { backgroundColor: theme.overlay }]}>
                <Text style={[{ color: theme.text.secondary, fontFamily: 'PlusJakartaSans_600SemiBold' }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateCategory} style={[styles.modalBtn, { backgroundColor: theme.accent }]}>
                <Text style={[{ color: '#fff', fontFamily: 'PlusJakartaSans_700Bold' }]}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: 40,
    gap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  closeBtn: {
    width: 36,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: RADIUS.sm + 2,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  amountText: {
    fontSize: 40,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  section: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    borderWidth: 1,
  },
  methodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  methodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    gap: 3,
  },
  methodLabel: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  toggleRowLabel: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  saveBtn: {
    height: 54,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
