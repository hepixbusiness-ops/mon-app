import React, { useEffect } from 'react';
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
import i18n from './src/i18n';
import { initDB } from './src/db/database';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useFinanceStore } from './src/store/useFinanceStore';
import { useNotifStore } from './src/store/useNotifStore';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from './src/components/ui/Toast';

function AppInit({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const { setDB: setSettingsDB, loadSettings } = useSettingsStore();
  const { setDB: setFinanceDB, loadAll } = useFinanceStore();
  const { setDB: setNotifDB, loadNotifications } = useNotifStore();

  useEffect(() => {
    setSettingsDB(db);
    setFinanceDB(db);
    setNotifDB(db);
    loadSettings();
    loadAll();
    loadNotifications();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
