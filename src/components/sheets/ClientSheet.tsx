import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { SPACING, RADIUS, COLORS } from '../../constants/theme';
import { CreditClient } from '../../types';

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

interface Props {
  client?: CreditClient;
  onClose: () => void;
}

const ClientSheet = forwardRef<SheetRef, Props>(({ client, onClose }, ref) => {
  const theme = useTheme();
  const { addClient, updateClient, deleteClient } = useFinanceStore();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState('');

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => { setVisible(false); onClose(); },
  }));

  useEffect(() => {
    if (client) {
      setName(client.name); setAmount(String(client.amount));
      setPhone(client.phone || ''); setItems(client.items || '');
    } else {
      setName(''); setAmount(''); setPhone(''); setItems('');
    }
  }, [client]);

  function handleSave() {
    if (!name.trim() || !amount) return;
    const today = new Date().toISOString().split('T')[0];
    if (client) {
      updateClient({ ...client, name: name.trim(), amount: parseFloat(amount) || client.amount, phone, items });
    } else {
      addClient({ name: name.trim(), amount: parseFloat(amount) || 0, phone, items, date: today, status: 'pending' });
    }
    setVisible(false); onClose();
  }

  function handleDelete() {
    if (!client) return;
    deleteClient(client.id); setVisible(false); onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.default }]} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{client ? "Modifier l'ardoise" : 'Nouvelle ardoise client'}</Text>

          <Text style={[styles.label, { color: theme.text.secondary }]}>Nom du client</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ex: Boutique Mballa" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Montant (FCFA)</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="42 000" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Téléphone</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+237 6XX XXX XXX" placeholderTextColor={theme.text.muted}
            style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <Text style={[styles.label, { color: theme.text.secondary }]}>Articles / Description</Text>
          <TextInput value={items} onChangeText={setItems} placeholder="Riz, huile, savon..." placeholderTextColor={theme.text.muted}
            multiline numberOfLines={3}
            style={[styles.textArea, { backgroundColor: theme.overlay, color: theme.text.primary, borderColor: theme.border.subtle }]} />

          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.accent }]}>
            <Text style={styles.saveBtnText}>{client ? 'Enregistrer' : 'Ajouter'}</Text>
          </TouchableOpacity>
          {client && (
            <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { borderColor: COLORS.red }]}>
              <Text style={{ color: COLORS.red, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
});

export default ClientSheet;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { maxHeight: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.screen, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  title: { fontSize: 18, fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center', marginBottom: SPACING.md },
  label: { fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: SPACING.sm },
  input: { height: 52, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, fontSize: 15, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1, marginBottom: SPACING.sm },
  textArea: { borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', borderWidth: 1, minHeight: 80, textAlignVertical: 'top', marginBottom: SPACING.sm },
  saveBtn: { height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'PlusJakartaSans_700Bold' },
  deleteBtn: { height: 44, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
});
