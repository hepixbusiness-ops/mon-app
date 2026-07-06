import { useState } from 'react'
import Modal from './Modal'
import { db } from '../db/database'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUIStore } from '../store/useUIStore'
import { v4 as uuid } from 'uuid'

interface Props { onClose: () => void; editTxn?: any }

const METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'card', label: 'Carte' },
  { value: 'mtn', label: 'MTN MoMo' },
  { value: 'om', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
]

export default function AddTransactionModal({ onClose, editTxn }: Props) {
  const { showToast } = useUIStore()
  const cats = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const [type, setType] = useState<'income' | 'expense'>(editTxn?.type ?? 'expense')
  const [amount, setAmount] = useState(editTxn?.amount?.toString() ?? '')
  const [description, setDescription] = useState(editTxn?.description ?? '')
  const [categoryId, setCategoryId] = useState(editTxn?.categoryId ?? '')
  const [method, setMethod] = useState(editTxn?.method ?? 'cash')
  const [date, setDate] = useState(editTxn?.date ?? new Date().toISOString().split('T')[0])

  const filteredCats = cats.filter(c => c.type === type)

  async function save() {
    if (!amount || !categoryId) { showToast('Remplis tous les champs requis', 'error'); return }
    const data = { type, amount: parseFloat(amount), description, categoryId, method, date, emotion: null, pending: 0, recurring: 0 }
    if (editTxn) {
      await db.transactions.update(editTxn.id, data)
      showToast('Transaction modifiée')
    } else {
      await db.transactions.add({ id: uuid(), ...data })
      showToast('Transaction ajoutée')
    }
    onClose()
  }

  return (
    <Modal title={editTxn ? 'Modifier' : 'Nouvelle transaction'} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map(t => (
            <button key={t}
              className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-colors ${type === t ? (t === 'income' ? 'bg-green-600' : 'bg-red-600') : 'bg-[#2a2a2e] text-[#8e8e93]'}`}
              onClick={() => { setType(t); setCategoryId('') }}
            >
              {t === 'income' ? '+ Revenu' : '- Dépense'}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Montant</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Catégorie</label>
          <div className="grid grid-cols-3 gap-2">
            {filteredCats.map(c => (
              <button key={c.id}
                className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-colors ${categoryId === c.id ? 'ring-2 ring-[#7c6af7] bg-[#2a2a2e]' : 'bg-[#2a2a2e]'}`}
                onClick={() => setCategoryId(c.id)}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="truncate w-full text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="(optionnel)" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Méthode</label>
          <select value={method} onChange={e => setMethod(e.target.value)}>
            {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button onClick={save} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold text-base">
          Enregistrer
        </button>
      </div>
    </Modal>
  )
}
