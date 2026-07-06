import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, Tontine } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { Plus, Trash2, Users } from 'lucide-react'
import Modal from '../components/Modal'
import { useUIStore } from '../store/useUIStore'
import { v4 as uuid } from 'uuid'

function TontineForm({ onClose, tontine }: { onClose: () => void; tontine?: Tontine }) {
  const { showToast } = useUIStore()
  const [name, setName] = useState(tontine?.name ?? '')
  const [members, setMembers] = useState(tontine?.members?.toString() ?? '')
  const [amount, setAmount] = useState(tontine?.amountPerMonth?.toString() ?? '')
  const [position, setPosition] = useState(tontine?.position?.toString() ?? '1')
  const [nextDate, setNextDate] = useState(tontine?.nextDrawDate ?? '')

  async function save() {
    if (!name || !members || !amount) { showToast('Remplis les champs requis', 'error'); return }
    const m = parseInt(members); const a = parseFloat(amount); const p = parseInt(position)
    const data = { name, members: m, amountPerMonth: a, position: p, nextDrawDate: nextDate, potAmount: m * a, status: 'active' as const }
    if (tontine) { await db.tontines.update(tontine.id, data); showToast('Tontine modifiée') }
    else { await db.tontines.add({ id: uuid(), ...data }); showToast('Tontine créée') }
    onClose()
  }

  return (
    <Modal title={tontine ? 'Modifier la tontine' : 'Nouvelle tontine'} onClose={onClose}>
      <div className="space-y-4">
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Nom</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Tontine du quartier" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Nombre de membres</label><input type="number" value={members} onChange={e => setMembers(e.target.value)} placeholder="12" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Cotisation mensuelle</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="20000" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Ma position</label><input type="number" value={position} onChange={e => setPosition(e.target.value)} placeholder="1" /></div>
        <div><label className="text-xs text-[#8e8e93] mb-1 block">Prochain tirage</label><input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} /></div>
        <button onClick={save} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold">Enregistrer</button>
      </div>
    </Modal>
  )
}

export default function Tontines() {
  const { currency } = useSettingsStore()
  const { showToast } = useUIStore()
  const tontines = useLiveQuery(() => db.tontines.toArray(), []) ?? []
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Tontine | null>(null)

  async function remove(id: string) { await db.tontines.delete(id); showToast('Supprimé') }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tontines</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#7c6af7] rounded-full p-3"><Plus size={20} /></button>
      </div>
      <div className="space-y-3">
        {tontines.map(t => (
          <div key={t.id} className="bg-[#1c1c1e] rounded-2xl p-4" onClick={() => setEditItem(t)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-[#7c6af7]/20 flex items-center justify-center"><Users size={20} className="text-[#7c6af7]" /></div>
              <div className="flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-[#8e8e93]">{t.members} membres · Position #{t.position}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); remove(t.id) }} className="p-2 text-[#8e8e93]"><Trash2 size={16} /></button>
            </div>
            <div className="flex gap-4 bg-[#2a2a2e] rounded-xl p-3">
              <div><p className="text-xs text-[#8e8e93]">Cotisation</p><p className="font-semibold text-sm">{formatAmount(t.amountPerMonth, currency)}/mois</p></div>
              <div><p className="text-xs text-[#8e8e93]">Pot total</p><p className="font-semibold text-sm text-[#7c6af7]">{formatAmount(t.potAmount, currency)}</p></div>
            </div>
            {t.nextDrawDate && <p className="text-xs text-[#8e8e93] mt-2">Prochain tirage : {t.nextDrawDate}</p>}
          </div>
        ))}
        {tontines.length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucune tontine</p>}
      </div>
      {(showForm || editItem) && <TontineForm onClose={() => { setShowForm(false); setEditItem(null) }} tontine={editItem ?? undefined} />}
    </div>
  )
}
