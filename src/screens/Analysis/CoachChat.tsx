import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SPACING, RADIUS } from '../../constants/theme';
import { buildCoachContext, ruleReply, COACH_QUICKS } from '../../services/coach';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function CoachChat() {
  const theme = useTheme();
  const { transactions, categories, debts, creditClients, goals, tontine } = useFinanceStore();
  const { firstName } = useSettingsStore();

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: `Bonjour ${firstName || 'vous'} ! 👋 Je suis votre coach financier FinanceOS. Posez-moi une question sur vos finances.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingDot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(typingDot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingDot.setValue(0);
    }
  }, [typing]);

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const ctx = buildCoachContext({ transactions, categories, debts, creditClients, goals, tontine, firstName });
      const reply = ruleReply(msg, ctx, firstName);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: reply }]);
      setTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border.subtle }]}>
      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(m => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {m.role === 'ai' && <Text style={styles.aiAvatar}>🤖</Text>}
            <View style={[
              styles.bubbleContent,
              m.role === 'user'
                ? { backgroundColor: theme.accent }
                : { backgroundColor: theme.overlay },
            ]}>
              <Text style={[styles.bubbleText, { color: m.role === 'user' ? '#fff' : theme.text.primary }]}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
        {typing && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <Text style={styles.aiAvatar}>🤖</Text>
            <View style={[styles.bubbleContent, { backgroundColor: theme.overlay }]}>
              <Animated.Text style={[styles.bubbleText, { color: theme.text.muted, opacity: typingDot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]}>
                ● ● ●
              </Animated.Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick replies */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quicks} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
        {COACH_QUICKS.map(q => (
          <TouchableOpacity key={q} onPress={() => handleSend(q)} style={[styles.quickChip, { backgroundColor: theme.overlay, borderColor: theme.border.subtle }]}>
            <Text style={[styles.quickText, { color: theme.text.secondary }]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { borderTopColor: theme.border.subtle }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Posez une question..."
          placeholderTextColor={theme.text.muted}
          style={[styles.input, { backgroundColor: theme.overlay, color: theme.text.primary }]}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim()}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.accent : theme.border.subtle }]}
        >
          <Text style={{ color: '#fff', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  messages: {
    maxHeight: 300,
  },
  messagesContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  bubble: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    fontSize: 18,
    marginBottom: 4,
  },
  bubbleContent: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 18,
  },
  quicks: {
    paddingVertical: SPACING.sm,
  },
  quickChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  quickText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  inputRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
