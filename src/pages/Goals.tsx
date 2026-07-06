import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, Goal } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { useUIStore } from '../store/useUIStore'
import { v4 as uuid } from 'uuid'

function GoalForm({ onClose, goal }: { onClose: () => void; goal?: Goal }) {
  const { showToast } = useUIStore()
  const [name, setName] = useState(goal?.name ?? '')
  const [icon, setIcon] = useState(goal?.icon ?? '🎯')
  const [target, setTarget] = useState(goal?.targetAmount?.toString() ?? '')
  const [saved, setSaved] = useState(goal?.savedAmount?.toString() ?? '0')
  const [monthly, setMonthly] = useState(goal?.monthlyAmount?.toString() ?? '0')
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')

  async function save() {
    if (!name || !target) { showToast('Remplis les champs requis', 'error'); return }
    const data = { name, icon, targetAmount: parseFloat(target), savedAmount: parseFloat(saved), monthlyAmount: parseFloat(monthly), deadline, status: 'active' as const }
    if (goal) { await db.goals.update(goal.id, data); showToast('Objectif modifié') }
    else { await db.goals.add({ id: uuid(), ...data }); showToast('Objectif créé') }
    onClose()
  }

  return (
    <Modal title={goal ? "Modifier l'objectif" : 'Nouvel objectif'} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-16">
            <label className="text-xs text-[#8e8e93] mb-1 block">Icône</label>
            <input value={icon} onChange={e => setIcon(e.target.value)} className="text-center text-2xl" maxLength={2} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-[#8e8e93] mb-1 block">Nom</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de l'objectif" />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Montant cible</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Déjà économisé</label>
          <input type="number" value={saved} onChange={e => setSaved(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Montant mensuel</label>
          <input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-[#8e8e93] mb-1 block">Deadline</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>
        <button onClick={save} className="w-full bg-[#7c6af7] py-4 rounded-2xl font-bold">Enregistrer</button>
      </div>
    </Modal>
  )
}

export default function Goals() {
  const { currency } = useSettingsStore()
  const { showToast } = useUIStore()
  const goals = useLiveQuery(() => db.goals.toArray(), []) ?? []
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)

  async function remove(id: string) { await db.goals.delete(id); showToast('Supprimé') }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Objectifs</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#7c6af7] rounded-full p-3"><Plus size={20} /></button>
      </div>
      <div className="space-y-3">
        {goals.map(g => {
          const pct = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0
          return (
            <div key={g.id} className="bg-[#1c1c1e] rounded-2xl p-4" onClick={() => setEditGoal(g)}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{g.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs text-[#8e8e93]">{formatAmount(g.savedAmount, currency)} / {formatAmount(g.targetAmount, currency)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); remove(g.id) }} className="p-2 text-[#8e8e93]"><Trash2 size={16} /></button>
              </div>
              <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
                <div className="h-full bg-[#7c6af7] rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-right text-[#8e8e93] mt-1">{Math.round(pct)}%</p>
            </div>
          )
        })}
        {goals.length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucun objectif</p>}
      </div>
      {(showForm || editGoal) && <GoalForm onClose={() => { setShowForm(false); setEditGoal(null) }} goal={editGoal ?? undefined} />}
    </div>
  )
}
