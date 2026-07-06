import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { Plus, Trash2, Search } from 'lucide-react'
import AddTransactionModal from '../components/AddTransactionModal'
import { format } from 'date-fns'
import { useUIStore } from '../store/useUIStore'

export default function Transactions() {
  const { currency } = useSettingsStore()
  const { showToast } = useUIStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editTxn, setEditTxn] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const txns = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []) ?? []
  const cats = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]))

  const filtered = txns.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function remove(id: string) {
    await db.transactions.delete(id)
    showToast('Supprimé')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button onClick={() => setShowAdd(true)} className="bg-[#7c6af7] rounded-full p-3">
          <Plus size={20} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${filterType === f ? 'bg-[#7c6af7]' : 'bg-[#1c1c1e] text-[#8e8e93]'}`}
            onClick={() => setFilterType(f)}
          >
            {f === 'all' ? 'Tout' : f === 'income' ? 'Revenus' : 'Dépenses'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(t => {
          const cat = catMap[t.categoryId]
          return (
            <div key={t.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#2a2a2e] flex items-center justify-center text-xl flex-shrink-0">
                {cat?.emoji ?? '💰'}
              </div>
              <div className="flex-1 min-w-0" onClick={() => setEditTxn(t)}>
                <p className="font-medium truncate">{t.description || cat?.name}</p>
                <p className="text-xs text-[#8e8e93]">{format(new Date(t.date), 'dd MMM yyyy')} · {t.method.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${t.type === 'income' ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount, currency)}
                </span>
                <button onClick={() => remove(t.id)} className="p-2 text-[#8e8e93]"><Trash2 size={16} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucune transaction</p>}
      </div>

      {(showAdd || editTxn) && (
        <AddTransactionModal
          onClose={() => { setShowAdd(false); setEditTxn(null) }}
          editTxn={editTxn}
        />
      )}
    </div>
  )
}
