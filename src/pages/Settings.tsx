import { useSettingsStore } from '../store/useSettingsStore'
import { useUIStore } from '../store/useUIStore'
import { useState } from 'react'
import Modal from '../components/Modal'
import { ChevronRight } from 'lucide-react'

export default function Settings() {
  const s = useSettingsStore()
  const { showToast } = useUIStore()
  const [showPin, setShowPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  function savePin() {
    if (newPin.length !== 4 || newPin !== confirmPin) { showToast('Les codes ne correspondent pas', 'error'); return }
    s.setPin(newPin); s.setPinEnabled(true); showToast('PIN activé !'); setShowPin(false)
  }

  function disablePin() { s.setPinEnabled(false); s.setPin(''); showToast('PIN désactivé') }

  const Row = ({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) => (
    <div className="flex items-center justify-between py-4 border-b border-[#2a2a2e] cursor-pointer" onClick={onClick}>
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2 text-[#8e8e93] text-sm">
        {value && <span>{value}</span>}
        <ChevronRight size={16} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="bg-[#1c1c1e] rounded-2xl px-4 mb-4">
        <p className="text-xs text-[#8e8e93] uppercase font-bold pt-4 pb-2">Profil</p>
        <div className="py-3 border-b border-[#2a2a2e]">
          <label className="text-xs text-[#8e8e93]">Prénom</label>
          <input value={s.firstName} onChange={e => s.setFirstName(e.target.value)} className="bg-transparent border-none p-0 mt-1 text-sm" placeholder="Votre prénom" />
        </div>
        <div className="py-3">
          <label className="text-xs text-[#8e8e93]">Nom du portefeuille</label>
          <input value={s.walletName} onChange={e => s.setWalletName(e.target.value)} className="bg-transparent border-none p-0 mt-1 text-sm" placeholder="Mon Portefeuille" />
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-2xl px-4 mb-4">
        <p className="text-xs text-[#8e8e93] uppercase font-bold pt-4 pb-2">Préférences</p>
        <div className="flex items-center justify-between py-4 border-b border-[#2a2a2e]">
          <span className="text-sm">Devise</span>
          <select value={s.currency} onChange={e => s.setCurrency(e.target.value)} className="bg-transparent border-none text-[#8e8e93] text-sm text-right p-0 w-auto">
            <option value="XOF">FCFA (XOF)</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="XAF">XAF</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-[#2a2a2e]">
          <span className="text-sm">Langue</span>
          <select value={s.language} onChange={e => s.setLanguage(e.target.value as 'fr' | 'en')} className="bg-transparent border-none text-[#8e8e93] text-sm text-right p-0 w-auto">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-[#2a2a2e]">
          <span className="text-sm">Mode</span>
          <select value={s.mode} onChange={e => s.setMode(e.target.value as 'perso' | 'commerce')} className="bg-transparent border-none text-[#8e8e93] text-sm text-right p-0 w-auto">
            <option value="perso">Personnel</option>
            <option value="commerce">Commerce</option>
          </select>
        </div>
        <div className="py-4">
          <label className="text-xs text-[#8e8e93]">Budget mensuel</label>
          <input type="number" value={s.monthlyBudget} onChange={e => s.setMonthlyBudget(parseFloat(e.target.value))} className="bg-transparent border-none p-0 mt-1 text-sm" />
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-2xl px-4 mb-4">
        <p className="text-xs text-[#8e8e93] uppercase font-bold pt-4 pb-2">Sécurité</p>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm">Code PIN</p>
            <p className="text-xs text-[#8e8e93]">{s.pinEnabled ? 'Activé' : 'Désactivé'}</p>
          </div>
          {s.pinEnabled
            ? <button onClick={disablePin} className="text-sm text-red-500 font-medium">Désactiver</button>
            : <button onClick={() => setShowPin(true)} className="text-sm text-[#7c6af7] font-medium">Activer</button>
          }
        </div>
      </div>

      {showPin && (
        <Modal title="Créer un code PIN" onClose={() => setShowPin(false)}>
          <div className="space-y-4">
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Nouveau PIN (4 chiffres)</label>
              <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="····" className="text-center text-2xl tracking-widest" /></div>
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Confirmer le PIN</label>
              <input type="password" inputMode="numeric" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="····" className="text-center text-2xl tracking-widest" /></div>
            <button onClick={savePin} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold">Activer le PIN</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
