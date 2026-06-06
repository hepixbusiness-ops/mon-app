import 'react-native-get-random-values';
import React, { useEffect, Component } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { I18nextProvider } from 'react-i18next';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import i18n from './src/i18n';
import { initDB } from './src/db/database';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useFinanceStore } from './src/store/useFinanceStore';
import { useNotifStore } from './src/store/useNotifStore';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/ui/Toast';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: any) {
    return { error: e?.message ?? String(e) };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.err}>
          <ScrollView>
            <Text style={styles.errTitle}>CRASH DÉTECTÉ</Text>
            <Text style={styles.errText}>{this.state.error}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  err: { flex: 1, backgroundColor: '#1a0000', padding: 20, paddingTop: 60 },
  errTitle: { color: '#ff4444', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  errText: { color: '#ffffff', fontSize: 13, fontFamily: 'monospace' },
});

function AppInit({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const { setDB: setSettingsDB, loadSettings } = useSettingsStore();
  const { setDB: setFinanceDB, loadAll } = useFinanceStore();
  const { setDB: setNotifDB, loadNotifications } = useNotifStore();

  useEffect(() => {
    try {
      setSettingsDB(db);
      setFinanceDB(db);
      setNotifDB(db);
      loadSettings();
      loadAll();
      loadNotifications();
    } catch (e: any) {
      throw new Error('AppInit failed: ' + (e?.message ?? String(e)));
    }
  }, [db]);

  return <>{children}</>;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <SQLiteProvider databaseName="financeos.db" onInit={initDB}>
            <I18nextProvider i18n={i18n}>
              <ThemeProvider>
                <NavigationContainer>
                  <AppInit>
                    <RootNavigator />
                    <Toast />
                  </AppInit>
                </NavigationContainer>
              </ThemeProvider>
            </I18nextProvider>
          </SQLiteProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
