import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, Debt } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { useUIStore } from '../store/useUIStore'
import { v4 as uuid } from 'uuid'

function DebtForm({ onClose, debt }: { onClose: () => void; debt?: Debt }) {
  const { showToast } = useUIStore()
  const [name, setName] = useState(debt?.name ?? '')
  const [amount, setAmount] = useState(debt?.amount?.toString() ?? '')
  const [phone, setPhone] = useState(debt?.phone ?? '')
  const [notes, setNotes] = useState(debt?.notes ?? '')
  const [direction, setDirection] = useState<'owed' | 'owe'>(debt?.direction ?? 'owed')

  async function save() {
    if (!name || !amount) { showToast('Remplis les champs requis', 'error'); return }
    const data = { name, amount: parseFloat(amount), phone, notes, direction, date: new Date().toISOString().split('T')[0], status: 'pending' as const }
    if (debt) { await db.debts.update(debt.id, data); showToast('Modifié') }
    else { await db.debts.add({ id: uuid(), ...data }); showToast('Créé') }
    onClose()
  }

  return (
    <Modal title={debt ? 'Modifier' : 'Nouvelle dette'} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button className={`flex-1 py-3 rounded-2xl font-semibold text-sm ${direction === 'owed' ? 'bg-green-600' : 'bg-[#2a2a2e] text-[#8e8e93]'}`} onClick={() => setDirection('owed')}>On me doit</button>
          <button className={`flex-1 py-3 rounded-2xl font-semibold text-sm ${direction === 'owe' ? 'bg-red-600' : 'bg-[#2a2a2e] text-[#8e8e93]'}`} onClick={() => setDirection('owe')}>Je dois</button>
        </div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Nom</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la personne" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Montant</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Téléphone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237..." /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="..." /></div>
        <button onClick={save} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold">Enregistrer</button>
      </div>
    </Modal>
  )
}

export default function Debts() {
  const { currency } = useSettingsStore()
  const { showToast } = useUIStore()
  const debts = useLiveQuery(() => db.debts.toArray(), []) ?? []
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Debt | null>(null)

  const owed = debts.filter(d => d.direction === 'owed' && d.status === 'pending')
  const owe = debts.filter(d => d.direction === 'owe' && d.status === 'pending')

  async function remove(id: string) { await db.debts.delete(id); showToast('Supprimé') }
  async function markPaid(id: string) { await db.debts.update(id, { status: 'paid' }); showToast('Marqué comme payé') }

  const DebtItem = ({ d }: { d: Debt }) => (
    <div key={d.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-3" onClick={() => setEditItem(d)}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg ${d.direction === 'owed' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
        {d.name[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{d.name}</p>
        {d.phone && <p className="text-xs text-[#8e8e93]">{d.phone}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={`font-bold ${d.direction === 'owed' ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>{formatAmount(d.amount, currency)}</p>
          <button onClick={e => { e.stopPropagation(); markPaid(d.id) }} className="text-xs text-[#7c6af7]">✓ Payé</button>
        </div>
        <button onClick={e => { e.stopPropagation(); remove(d.id) }} className="p-2 text-[#8e8e93]"><Trash2 size={16} /></button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dettes</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#7c6af7] rounded-full p-3"><Plus size={20} /></button>
      </div>
      {owed.length > 0 && <><p className="text-xs text-[#8e8e93] uppercase font-bold mb-2">On me doit</p><div className="space-y-2 mb-4">{owed.map(d => <DebtItem key={d.id} d={d} />)}</div></>}
      {owe.length > 0 && <><p className="text-xs text-[#8e8e93] uppercase font-bold mb-2">Je dois</p><div className="space-y-2">{owe.map(d => <DebtItem key={d.id} d={d} />)}</div></>}
      {debts.filter(d => d.status === 'pending').length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucune dette en cours</p>}
      {(showForm || editItem) && <DebtForm onClose={() => { setShowForm(false); setEditItem(null) }} debt={editItem ?? undefined} />}
    </div>
  )
}
