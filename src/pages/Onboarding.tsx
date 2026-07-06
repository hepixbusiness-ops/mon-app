import { useState } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

export default function Onboarding() {
  const { setFirstName, setWalletName, setCurrency, setOnboardingDone, setMode } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [wallet, setWallet] = useState('Mon Portefeuille')
  const [currency, setCurrencyLocal] = useState('XOF')
  const [mode, setModeLocal] = useState<'perso' | 'commerce'>('perso')

  function finish() {
    setFirstName(name)
    setWalletName(wallet)
    setCurrency(currency)
    setMode(mode)
    setOnboardingDone(true)
  }

  const steps = [
    {
      emoji: '👋', title: 'Bienvenue sur FinanceOS',
      subtitle: 'Gérez vos finances en toute simplicité',
      content: (
        <div className="space-y-4">
          <div><label className="text-xs text-[#8e8e93] mb-1 block">Votre prénom</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Prénom" /></div>
        </div>
      ),
      canNext: name.length > 0,
    },
    {
      emoji: '💼', title: 'Votre portefeuille',
      subtitle: 'Personnalisez votre espace financier',
      content: (
        <div className="space-y-4">
          <div><label className="text-xs text-[#8e8e93] mb-1 block">Nom du portefeuille</label>
            <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="Mon Portefeuille" /></div>
          <div><label className="text-xs text-[#8e8e93] mb-1 block">Devise</label>
            <select value={currency} onChange={e => setCurrencyLocal(e.target.value)}>
              <option value="XOF">FCFA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar (USD)</option>
              <option value="XAF">CFA Franc (XAF)</option>
            </select>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      emoji: '🎯', title: 'Votre mode',
      subtitle: 'Comment utilisez-vous FinanceOS ?',
      content: (
        <div className="space-y-3">
          {([['perso', '👤', 'Usage personnel', 'Gérez votre budget familial'], ['commerce', '🏪', 'Commerce', 'Gérez votre boutique et clients']] as const).map(([m, emoji, label, sub]) => (
            <button key={m} onClick={() => setModeLocal(m)}
              className={`w-full p-4 rounded-2xl text-left flex gap-4 items-center border-2 transition-colors ${mode === m ? 'border-[#7c6af7] bg-[#7c6af7]/10' : 'border-[#2a2a2e] bg-[#1c1c1e]'}`}>
              <span className="text-3xl">{emoji}</span>
              <div><p className="font-semibold">{label}</p><p className="text-xs text-[#8e8e93]">{sub}</p></div>
            </button>
          ))}
        </div>
      ),
      canNext: true,
    },
  ]

  const s = steps[step]

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="w-full">
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-[#7c6af7]' : 'bg-[#2a2a2e]'}`} />)}
        </div>
        <div className="text-center mb-8">
          <p className="text-6xl mb-4">{s.emoji}</p>
          <h1 className="text-2xl font-bold mb-2">{s.title}</h1>
          <p className="text-[#8e8e93] text-sm">{s.subtitle}</p>
        </div>
        <div className="mb-8">{s.content}</div>
        <button
          disabled={!s.canNext}
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : finish()}
          className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step < steps.length - 1 ? 'Continuer →' : 'Commencer 🚀'}
        </button>
        {step > 0 && <button onClick={() => setStep(step - 1)} className="w-full mt-3 py-3 text-[#8e8e93] text-sm">← Retour</button>}
      </div>
    </div>
  )
}
