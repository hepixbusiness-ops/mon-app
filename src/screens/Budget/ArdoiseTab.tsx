import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatFCFA, SPACING, RADIUS, COLORS } from '../../constants/theme';
import Card from '../../components/ui/Card';
import ClientSheet, { SheetRef as ClientSheetRef } from '../../components/sheets/ClientSheet';
import { CreditClient } from '../../types';
import { draftRelance, openWhatsApp } from '../../services/whatsapp';

export default function ArdoiseTab() {
  const theme = useTheme();
  const { creditClients, updateClient } = useFinanceStore();
  const sheetRef = useRef<any>(null);
  const [selectedClient, setSelectedClient] = useState<CreditClient | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pending = creditClients.filter(c => c.status === 'pending');
  const totalArdoise = pending.reduce((s, c) => s + c.amount, 0);

  function openSheet(client?: CreditClient) {
    setSelectedClient(client);
    sheetRef.current?.present();
  }

  function handleSettle(client: CreditClient) {
    updateClient({ ...client, status: 'settled' });
  }

  function handleWhatsApp(client: CreditClient) {
    if (!client.phone) return;
    const msg = draftRelance(client.name, client.amount, client.items);
    openWhatsApp(client.phone, msg);
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Header total */}
      <Card style={{ marginHorizontal: SPACING.screen, alignItems: 'center', gap: SPACING.sm }}>
        <Text style={[styles.label, { color: theme.text.muted }]}>Ardoise totale</Text>
        <Text style={[styles.bigAmount, { color: COLORS.amber }]}>{formatFCFA(totalArdoise)}</Text>
        <Text style={[styles.count, { color: theme.text.muted }]}>{pending.length} client(s) en attente</Text>
      </Card>

      {/* Client list */}
      <View style={{ marginHorizontal: SPACING.screen }}>
        {pending.length === 0 && (
          <Card style={{ alignItems: 'center', gap: SPACING.md }}>
            <Text style={{ fontSize: 40 }}>📒</Text>
            <Text style={[{ color: theme.text.muted, fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', textAlign: 'center' }]}>
              Aucune ardoise en cours
            </Text>
          </Card>
        )}

        {pending.map(client => {
          const expanded = expandedId === client.id;
          return (
            <Card key={client.id} style={{ marginBottom: SPACING.sm }}>
              <TouchableOpacity onPress={() => setExpandedId(expanded ? null : client.id)} activeOpacity={0.7}>
                <View style={styles.clientRow}>
                  <View style={[styles.clientIcon, { backgroundColor: COLORS.amber + '22' }]}>
                    <Text style={{ fontSize: 20 }}>📒</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.clientName, { color: theme.text.primary }]}>{client.name}</Text>
                    {client.items && (
                      <Text style={[styles.clientItems, { color: theme.text.muted }]} numberOfLines={1}>
                        {client.items}
                      </Text>
                    )}
                    <Text style={[styles.clientDate, { color: theme.text.muted }]}>Depuis le {client.date}</Text>
                  </View>
                  <Text style={[styles.clientAmt, { color: COLORS.amber }]}>{formatFCFA(client.amount)}</Text>
                  <Text style={[{ color: theme.text.muted, fontSize: 14 }]}>{expanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {expanded && (
                <View style={[styles.expandedContent, { borderTopColor: theme.border.subtle }]}>
                  {client.items && (
                    <Text style={[styles.notes, { color: theme.text.secondary }]}>📦 {client.items}</Text>
                  )}
                  <View style={styles.actionRow}>
                    {client.phone && (
                      <TouchableOpacity onPress={() => handleWhatsApp(client)} style={[styles.actionBtn, { backgroundColor: '#25D366' + '22', borderColor: '#25D366' }]}>
                        <Text style={[styles.actionText, { color: '#25D366' }]}>📱 WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => openSheet(client)} style={[styles.actionBtn, { backgroundColor: theme.accent + '22', borderColor: theme.accent }]}>
                      <Text style={[styles.actionText, { color: theme.accent }]}>✏️ Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSettle(client)} style={[styles.actionBtn, { backgroundColor: COLORS.green + '22', borderColor: COLORS.green }]}>
                      <Text style={[styles.actionText, { color: COLORS.green }]}>✅ Soldé</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <TouchableOpacity onPress={() => openSheet()} style={[styles.addBtn, { backgroundColor: theme.accent, marginHorizontal: SPACING.screen }]}>
        <Text style={styles.addBtnText}>+ Ajouter une ardoise</Text>
      </TouchableOpacity>

      <ClientSheet ref={sheetRef} client={selectedClient} onClose={() => setSelectedClient(undefined)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  label: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  bigAmount: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  count: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  clientIcon: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  clientItems: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 1,
  },
  clientDate: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginTop: 1,
  },
  clientAmt: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  notes: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  addBtn: {
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
