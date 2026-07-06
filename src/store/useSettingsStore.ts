import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  currency: string
  theme: 'dark' | 'light'
  accent: string
  mode: 'perso' | 'commerce'
  firstName: string
  walletName: string
  language: 'fr' | 'en'
  pinEnabled: boolean
  pin: string
  monthlyBudget: number
  onboardingDone: boolean
  setCurrency: (v: string) => void
  setTheme: (v: 'dark' | 'light') => void
  setAccent: (v: string) => void
  setMode: (v: 'perso' | 'commerce') => void
  setFirstName: (v: string) => void
  setWalletName: (v: string) => void
  setLanguage: (v: 'fr' | 'en') => void
  setPinEnabled: (v: boolean) => void
  setPin: (v: string) => void
  setMonthlyBudget: (v: number) => void
  setOnboardingDone: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'XOF',
      theme: 'dark',
      accent: '#7c6af7',
      mode: 'perso',
      firstName: '',
      walletName: 'Mon Portefeuille',
      language: 'fr',
      pinEnabled: false,
      pin: '',
      monthlyBudget: 300000,
      onboardingDone: false,
      setCurrency: (v) => set({ currency: v }),
      setTheme: (v) => set({ theme: v }),
      setAccent: (v) => set({ accent: v }),
      setMode: (v) => set({ mode: v }),
      setFirstName: (v) => set({ firstName: v }),
      setWalletName: (v) => set({ walletName: v }),
      setLanguage: (v) => set({ language: v }),
      setPinEnabled: (v) => set({ pinEnabled: v }),
      setPin: (v) => set({ pin: v }),
      setMonthlyBudget: (v) => set({ monthlyBudget: v }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),
    }),
    { name: 'financeos-settings' }
  )
)
