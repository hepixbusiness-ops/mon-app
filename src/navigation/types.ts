import { Transaction } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Lock: undefined;
  Main: undefined;
  Entry: { transaction?: Transaction } | undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Add: undefined;
  Analysis: undefined;
  Budget: undefined;
};
