import Dexie, { Table } from 'dexie'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  method: string
  emotion: string | null
  date: string
  pending: number
  recurring: number
  receiptUri?: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  budget: number
  type: 'income' | 'expense'
}

export interface Goal {
  id: string
  name: string
  icon: string
  targetAmount: number
  savedAmount: number
  monthlyAmount: number
  deadline: string
  status: 'active' | 'completed'
}

export interface Tontine {
  id: string
  name: string
  members: number
  amountPerMonth: number
  position: number
  nextDrawDate: string
  potAmount: number
  status: 'active' | 'completed'
}

export interface Debt {
  id: string
  name: string
  amount: number
  phone: string
  notes: string
  direction: 'owed' | 'owe'
  date: string
  status: 'pending' | 'paid'
}

export interface CreditClient {
  id: string
  name: string
  amount: number
  phone: string
  items: string
  date: string
  status: 'pending' | 'paid'
}

export interface Notification {
  id: string
  title: string
  body: string
  type: string
  read: number
  createdAt: string
}

export interface Setting {
  key: string
  value: string
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction>
  categories!: Table<Category>
  goals!: Table<Goal>
  tontines!: Table<Tontine>
  debts!: Table<Debt>
  creditClients!: Table<CreditClient>
  notifications!: Table<Notification>
  settings!: Table<Setting>

  constructor() {
    super('financeos')
    this.version(1).stores({
      transactions: 'id, type, date, categoryId, pending',
      categories: 'id, type',
      goals: 'id, status',
      tontines: 'id, status',
      debts: 'id, direction, status',
      creditClients: 'id, status',
      notifications: 'id, read, createdAt',
      settings: 'key',
    })
  }
}

export const db = new FinanceDB()

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export async function seedIfEmpty() {
  const count = await db.transactions.count()
  if (count > 0) return

  const cats: Category[] = [
    { id: 'salaire', name: 'Salaire', emoji: '💼', color: '#32d74b', budget: 0, type: 'income' },
    { id: 'vente', name: 'Ventes', emoji: '🏪', color: '#32d74b', budget: 0, type: 'income' },
    { id: 'loyer', name: 'Loyer', emoji: '🏠', color: '#ff453a', budget: 120000, type: 'expense' },
    { id: 'alim', name: 'Alimentation', emoji: '🛒', color: '#ff9f0a', budget: 80000, type: 'expense' },
    { id: 'transport', name: 'Transport', emoji: '🚕', color: '#64d2ff', budget: 30000, type: 'expense' },
    { id: 'sante', name: 'Santé', emoji: '💊', color: '#ff375f', budget: 20000, type: 'expense' },
    { id: 'famille', name: 'Famille', emoji: '👨‍👩‍👧', color: '#bf5af2', budget: 50000, type: 'expense' },
    { id: 'forfait', name: 'Forfait/Internet', emoji: '📱', color: '#0a84ff', budget: 15000, type: 'expense' },
    { id: 'factures', name: 'Factures', emoji: '📄', color: '#ff9f0a', budget: 25000, type: 'expense' },
    { id: 'maquis', name: 'Restaurant/Maquis', emoji: '🍽️', color: '#ff6b35', budget: 30000, type: 'expense' },
    { id: 'tontine_g', name: 'Tontine', emoji: '🤝', color: '#30d158', budget: 20000, type: 'expense' },
  ]
  await db.categories.bulkAdd(cats)

  const { v4: uuid } = await import('uuid')
  const txns: Transaction[] = [
    { id: uuid(), type: 'income', amount: 320000, categoryId: 'salaire', description: 'Salaire', method: 'card', emotion: null, date: daysAgo(2), pending: 0, recurring: 0 },
    { id: uuid(), type: 'expense', amount: 90000, categoryId: 'loyer', description: 'Loyer du mois', method: 'cash', emotion: 'need', date: daysAgo(3), pending: 0, recurring: 1 },
    { id: uuid(), type: 'expense', amount: 12500, categoryId: 'alim', description: 'Marché Mvog-Mbi', method: 'cash', emotion: 'need', date: daysAgo(3), pending: 0, recurring: 0 },
    { id: uuid(), type: 'expense', amount: 25000, categoryId: 'famille', description: 'Transfert famille', method: 'mtn', emotion: 'need', date: daysAgo(4), pending: 0, recurring: 0 },
    { id: uuid(), type: 'income', amount: 45000, categoryId: 'vente', description: 'Bénéfice boutique', method: 'om', emotion: null, date: daysAgo(4), pending: 0, recurring: 0 },
    { id: uuid(), type: 'expense', amount: 3000, categoryId: 'transport', description: 'Taxi', method: 'cash', emotion: 'need', date: daysAgo(5), pending: 0, recurring: 0 },
    { id: uuid(), type: 'expense', amount: 10000, categoryId: 'forfait', description: 'Forfait MTN 30j', method: 'mtn', emotion: 'neutral', date: daysAgo(5), pending: 0, recurring: 1 },
    { id: uuid(), type: 'expense', amount: 14500, categoryId: 'factures', description: 'ENEO', method: 'om', emotion: 'need', date: daysAgo(6), pending: 0, recurring: 1 },
    { id: uuid(), type: 'expense', amount: 6500, categoryId: 'sante', description: 'Pharmacie', method: 'cash', emotion: 'need', date: daysAgo(7), pending: 0, recurring: 0 },
    { id: uuid(), type: 'expense', amount: 20000, categoryId: 'tontine_g', description: 'Tontine cotisation', method: 'om', emotion: 'need', date: daysAgo(10), pending: 0, recurring: 1 },
  ]
  await db.transactions.bulkAdd(txns)

  const goals: Goal[] = [
    { id: uuid(), name: 'Rentrée scolaire', icon: '📚', targetAmount: 200000, savedAmount: 120000, monthlyAmount: 20000, deadline: '2026-09-01', status: 'active' },
    { id: uuid(), name: 'Fête de Noël', icon: '🎄', targetAmount: 150000, savedAmount: 60000, monthlyAmount: 15000, deadline: '2026-12-20', status: 'active' },
  ]
  await db.goals.bulkAdd(goals)

  const tontines: Tontine[] = [
    { id: uuid(), name: 'Tontine du quartier', members: 12, amountPerMonth: 20000, position: 5, nextDrawDate: '2026-08-01', potAmount: 240000, status: 'active' },
  ]
  await db.tontines.bulkAdd(tontines)

  const debts: Debt[] = [
    { id: uuid(), name: 'Christian', amount: 15000, phone: '+237691000000', notes: 'Prêt en espèces', direction: 'owed', date: daysAgo(22), status: 'pending' },
    { id: uuid(), name: 'Tonton Emile', amount: 30000, phone: '', notes: 'Prêt pour loyer', direction: 'owe', date: daysAgo(57), status: 'pending' },
  ]
  await db.debts.bulkAdd(debts)

  const clients: CreditClient[] = [
    { id: uuid(), name: 'Boutique Mballa', amount: 42000, phone: '+237677000001', items: 'Riz, huile, savon', date: daysAgo(9), status: 'pending' },
    { id: uuid(), name: 'Maman Estelle', amount: 12500, phone: '+237677000002', items: 'Farine, sucre', date: daysAgo(5), status: 'pending' },
  ]
  await db.creditClients.bulkAdd(clients)

  const notifs: Notification[] = [
    { id: uuid(), title: 'Budget Maquis dépassé !', body: 'Vous avez dépensé 23 500 FCFA sur votre budget maquis de 30 000 FCFA.', type: 'budget', read: 0, createdAt: new Date().toISOString() },
    { id: uuid(), title: 'Tontine — Tirage en août', body: 'Votre tour de tontine du quartier est prévu le 1 août 2026.', type: 'tontine', read: 0, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]
  await db.notifications.bulkAdd(notifs)
}
