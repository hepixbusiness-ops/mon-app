import { useState } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'
import { Lock, Delete } from 'lucide-react'

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { pin } = useSettingsStore()
  const [entered, setEntered] = useState('')
  const [error, setError] = useState(false)

  function press(d: string) {
    if (entered.length >= 4) return
    const next = entered + d
    setEntered(next)
    if (next.length === 4) {
      if (next === pin) { onUnlock() }
      else { setError(true); setTimeout(() => { setEntered(''); setError(false) }, 600) }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6">
      <Lock size={40} className="text-[#7c6af7] mb-4" />
      <h1 className="text-xl font-bold mb-2">Code PIN</h1>
      <p className="text-[#8e8e93] text-sm mb-8">Entrez votre code pour continuer</p>
      <div className={`flex gap-4 mb-8 ${error ? 'animate-bounce' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < entered.length ? (error ? 'bg-red-500 border-red-500' : 'bg-[#7c6af7] border-[#7c6af7]') : 'border-[#8e8e93]'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 w-64">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
          <button key={i}
            className={`h-16 rounded-2xl font-bold text-xl ${k === '' ? '' : 'bg-[#1c1c1e] active:bg-[#2a2a2e] transition-colors'}`}
            onClick={() => k === '⌫' ? setEntered(p => p.slice(0,-1)) : k ? press(k) : null}
            disabled={k === ''}
          >
            {k === '⌫' ? <Delete size={20} className="mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  )
}
