import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useSettingsStore } from '../store/useSettingsStore'
import { formatAmount } from '../components/AmountDisplay'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import AddTransactionModal from '../components/AddTransactionModal'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export default function Dashboard() {
  const { firstName, currency, monthlyBudget } = useSettingsStore()
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const monthStart = startOfMonth(now).toISOString().split('T')[0]
  const monthEnd = endOfMonth(now).toISOString().split('T')[0]

  const txns = useLiveQuery(() =>
    db.transactions.where('date').between(monthStart, monthEnd, true, true).toArray()
  , [monthStart, monthEnd]) ?? []

  const allTxns = useLiveQuery(() =>
    db.transactions.orderBy('date').reverse().limit(5).toArray()
  , []) ?? []

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []

  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense
  const budgetPct = monthlyBudget > 0 ? Math.min(100, (expense / monthlyBudget) * 100) : 0

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  const pieData = categories
    .filter(c => c.type === 'expense')
    .map(c => ({
      name: c.name,
      value: txns.filter(t => t.categoryId === c.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      color: c.color,
    }))
    .filter(d => d.value > 0)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#8e8e93] text-sm">Bonjour 👋</p>
          <h1 className="text-2xl font-bold">{firstName || 'Utilisateur'}</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#7c6af7] rounded-full p-3 shadow-lg"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#7c6af7] to-[#5a4fcf] rounded-3xl p-6 mb-4">
        <p className="text-purple-200 text-sm mb-1">Solde du mois</p>
        <p className="text-4xl font-bold mb-4">{formatAmount(balance, currency)}</p>
        <div className="flex gap-6">
          <div>
            <div className="flex items-center gap-1 text-green-300 text-xs mb-1">
              <ArrowUpRight size={14} /> Revenus
            </div>
            <p className="font-semibold">{formatAmount(income, currency)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-red-300 text-xs mb-1">
              <ArrowDownLeft size={14} /> Dépenses
            </div>
            <p className="font-semibold">{formatAmount(expense, currency)}</p>
          </div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="bg-[#1c1c1e] rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Budget mensuel</span>
          <span className="text-sm text-[#8e8e93]">{Math.round(budgetPct)}%</span>
        </div>
        <div className="h-2 bg-[#2a2a2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${budgetPct}%`,
              backgroundColor: budgetPct > 90 ? '#ff453a' : budgetPct > 70 ? '#ff9f0a' : '#7c6af7',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#8e8e93]">{formatAmount(expense, currency)}</span>
          <span className="text-xs text-[#8e8e93]">{formatAmount(monthlyBudget, currency)}</span>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="bg-[#1c1c1e] rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#7c6af7]" />
            <span className="text-sm font-semibold">Répartition des dépenses</span>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[#8e8e93]">{d.name}</span>
                  </div>
                  <span className="text-xs font-medium">{formatAmount(d.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-[#1c1c1e] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold">Transactions récentes</span>
          <Link to="/transactions" className="text-xs text-[#7c6af7]">Voir tout</Link>
        </div>
        <div className="space-y-3">
          {allTxns.map(t => {
            const cat = catMap[t.categoryId]
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2a2a2e] flex items-center justify-center text-lg">
                  {cat?.emoji ?? '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description || cat?.name}</p>
                  <p className="text-xs text-[#8e8e93]">{format(new Date(t.date), 'dd MMM')}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount, currency)}
                </span>
              </div>
            )
          })}
          {allTxns.length === 0 && (
            <p className="text-center text-[#8e8e93] text-sm py-4">Aucune transaction</p>
          )}
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
