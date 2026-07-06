import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, CreditClient } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { useUIStore } from '../store/useUIStore'
import { v4 as uuid } from 'uuid'

export default function CreditClients() {
  const { currency } = useSettingsStore()
  const { showToast } = useUIStore()
  const clients = useLiveQuery(() => db.creditClients.where('status').equals('pending').toArray(), []) ?? []
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState(''); const [amount, setAmount] = useState(''); const [phone, setPhone] = useState(''); const [items, setItems] = useState('')

  const total = clients.reduce((s, c) => s + c.amount, 0)

  async function add() {
    if (!name || !amount) { showToast('Remplis les champs requis', 'error'); return }
    await db.creditClients.add({ id: uuid(), name, amount: parseFloat(amount), phone, items, date: new Date().toISOString().split('T')[0], status: 'pending' })
    showToast('Client ajouté'); setShowForm(false); setName(''); setAmount(''); setPhone(''); setItems('')
  }

  async function markPaid(id: string) { await db.creditClients.update(id, { status: 'paid' }); showToast('Payé !') }
  async function remove(id: string) { await db.creditClients.delete(id); showToast('Supprimé') }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Crédit clients</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#7c6af7] rounded-full p-3"><Plus size={20} /></button>
      </div>
      <div className="bg-[#7c6af7]/20 rounded-2xl p-4 mb-4">
        <p className="text-xs text-[#8e8e93]">Total à encaisser</p>
        <p className="text-2xl font-bold text-[#7c6af7]">{formatAmount(total, currency)}</p>
      </div>
      <div className="space-y-2">
        {clients.map(c => (
          <div key={c.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2a2a2e] flex items-center justify-center font-bold text-lg">{c.name[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{c.name}</p>
              {c.items && <p className="text-xs text-[#8e8e93] truncate">{c.items}</p>}
              {c.phone && <p className="text-xs text-[#8e8e93]">{c.phone}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-[#ff9f0a]">{formatAmount(c.amount, currency)}</p>
                <button onClick={() => markPaid(c.id)} className="text-xs text-[#7c6af7]">✓ Payé</button>
              </div>
              <button onClick={() => remove(c.id)} className="p-2 text-[#8e8e93]"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucun client en attente</p>}
      </div>

      {showForm && (
        <Modal title="Nouveau client crédit" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Nom du client</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" /></div>
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Montant</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Téléphone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237..." /></div>
            <div><label className="text-xs text-[#8e8e93] mb-1 block">Articles</label><input value={items} onChange={e => setItems(e.target.value)} placeholder="Riz, huile..." /></div>
            <button onClick={add} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold">Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
