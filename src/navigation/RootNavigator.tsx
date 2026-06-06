import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettingsStore } from '../store/useSettingsStore';
import { RootStackParamList } from './types';

import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LockScreen from '../screens/Lock/LockScreen';
import MainTabs from './MainTabs';
import EntryScreen from '../screens/Entry/EntryScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const onboardingDone = useSettingsStore(s => s.onboardingDone);
  const pinEnabled = useSettingsStore(s => s.pinEnabled);

  let initialRoute: keyof RootStackParamList = 'Main';
  if (!onboardingDone) {
    initialRoute = 'Onboarding';
  } else if (pinEnabled) {
    initialRoute = 'Lock';
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Lock" component={LockScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Entry"
        component={EntryScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
