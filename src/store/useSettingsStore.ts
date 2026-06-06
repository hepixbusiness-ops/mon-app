import { create } from 'zustand';

interface SettingsState {
  currency: string;
  theme: 'dark' | 'light';
  accent: string;
  mode: 'perso' | 'commerce';
  firstName: string;
  walletName: string;
  language: 'fr' | 'en';
  pinEnabled: boolean;
  monthlyBudget: number;
  onboardingDone: boolean;
  db: any | null;

  setDB: (db: any) => void;
  setCurrency: (v: string) => void;
  setTheme: (v: 'dark' | 'light') => void;
  setAccent: (v: string) => void;
  setMode: (v: 'perso' | 'commerce') => void;
  setFirstName: (v: string) => void;
  setWalletName: (v: string) => void;
  setLanguage: (v: 'fr' | 'en') => void;
  setPinEnabled: (v: boolean) => void;
  setMonthlyBudget: (v: number) => void;
  setOnboardingDone: (v: boolean) => void;

  loadSettings: () => void;
  saveSettings: () => void;
  saveSetting: (key: string, value: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: 'XOF',
  theme: 'dark',
  accent: '#7c6af7',
  mode: 'perso',
  firstName: '',
  walletName: 'Mon Portefeuille',
  language: 'fr',
  pinEnabled: false,
  monthlyBudget: 300000,
  onboardingDone: false,
  db: null,

  setDB: (db: any) => set({ db }),

  loadSettings: () => {
    const { db } = get();
    if (!db) return;
    try {
      const rows = db.getAllSync('SELECT key, value FROM settings') as { key: string; value: string }[];
      const s: Record<string, string> = {};
      rows.forEach(r => { s[r.key] = r.value; });

      set({
        currency: s.currency ?? 'XOF',
        theme: (s.theme as 'dark' | 'light') ?? 'dark',
        accent: s.accent ?? '#7c6af7',
        mode: (s.mode as 'perso' | 'commerce') ?? 'perso',
        firstName: s.firstName ?? '',
        walletName: s.walletName ?? 'Mon Portefeuille',
        language: (s.language as 'fr' | 'en') ?? 'fr',
        pinEnabled: s.pinEnabled !== 'false',
        monthlyBudget: s.monthlyBudget ? parseFloat(s.monthlyBudget) : 300000,
        onboardingDone: s.onboardingDone === 'true',
      });
    } catch (e) {
      console.error('loadSettings error:', e);
    }
  },

  saveSettings: () => {
    const { db, currency, theme, accent, mode, firstName, walletName, language, pinEnabled, monthlyBudget, onboardingDone } = get();
    if (!db) return;
    const entries = [
      ['currency', currency],
      ['theme', theme],
      ['accent', accent],
      ['mode', mode],
      ['firstName', firstName],
      ['walletName', walletName],
      ['language', language],
      ['pinEnabled', String(pinEnabled)],
      ['monthlyBudget', String(monthlyBudget)],
      ['onboardingDone', String(onboardingDone)],
    ];
    for (const [key, value] of entries) {
      db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }
  },

  saveSetting: (key: string, value: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  },

  setCurrency: (v) => {
    set({ currency: v });
    get().saveSetting('currency', v);
  },
  setTheme: (v) => {
    set({ theme: v });
    get().saveSetting('theme', v);
  },
  setAccent: (v) => {
    set({ accent: v });
    get().saveSetting('accent', v);
  },
  setMode: (v) => {
    set({ mode: v });
    get().saveSetting('mode', v);
  },
  setFirstName: (v) => {
    set({ firstName: v });
    get().saveSetting('firstName', v);
  },
  setWalletName: (v) => {
    set({ walletName: v });
    get().saveSetting('walletName', v);
  },
  setLanguage: (v) => {
    set({ language: v });
    get().saveSetting('language', v);
  },
  setPinEnabled: (v) => {
    set({ pinEnabled: v });
    get().saveSetting('pinEnabled', String(v));
  },
  setMonthlyBudget: (v) => {
    set({ monthlyBudget: v });
    get().saveSetting('monthlyBudget', String(v));
  },
  setOnboardingDone: (v) => {
    set({ onboardingDone: v });
    get().saveSetting('onboardingDone', String(v));
  },
}));
