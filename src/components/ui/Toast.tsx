import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { RADIUS, SPACING } from '../../constants/theme';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

let showToastFn: ((message: string, type?: 'success' | 'error' | 'info') => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (showToastFn) showToastFn(message, type);
}

export default function Toast() {
  const [state, setState] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);

  useEffect(() => {
    showToastFn = (message, type = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setState({ message, type, visible: true });
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setState(s => ({ ...s, visible: false })));
    };
    return () => { showToastFn = null; };
  }, []);

  if (!state.visible) return null;

  const bg = state.type === 'success' ? '#34d399' : state.type === 'error' ? '#f87171' : '#60a5fa';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bg, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
      ]}
    >
      <Text style={styles.text}>{state.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    maxWidth: '80%',
  },
  text: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
