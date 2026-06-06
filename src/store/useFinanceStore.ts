import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, Goal, Tontine, Debt, CreditClient } from '../types';

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  tontine: Tontine | null;
  debts: Debt[];
  creditClients: CreditClient[];
  db: any | null;

  // DB setter
  setDB: (db: any) => void;

  // Load all from db
  loadAll: () => void;

  // Transaction actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;

  // Category actions
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (c: Category) => void;

  // Goal actions
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;

  // Debt actions
  addDebt: (d: Omit<Debt, 'id'>) => void;
  updateDebt: (d: Debt) => void;
  deleteDebt: (id: string) => void;

  // Client actions
  addClient: (c: Omit<CreditClient, 'id'>) => void;
  updateClient: (c: CreditClient) => void;
  deleteClient: (id: string) => void;

  // Computed helpers
  getTotalExpenses: (month?: string) => number;
  getTotalIncome: (month?: string) => number;
  getCategorySpending: (catId: string, month?: string) => number;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  categories: [],
  goals: [],
  tontine: null,
  debts: [],
  creditClients: [],
  db: null,

  setDB: (db: any) => set({ db }),

  loadAll: () => {
    const { db } = get();
    if (!db) return;

    try {
      const transactions = db.getAllSync('SELECT * FROM transactions ORDER BY date DESC').map((row: any) => ({
        id: row.id,
        type: row.type,
        amount: row.amount,
        categoryId: row.categoryId,
        description: row.description,
        method: row.method,
        emotion: row.emotion ?? undefined,
        date: row.date,
        pending: row.pending === 1,
        recurring: row.recurring === 1,
        receiptUri: row.receiptUri ?? undefined,
      }));

      const categories = db.getAllSync('SELECT * FROM categories ORDER BY type, name').map((row: any) => ({
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        color: row.color,
        budget: row.budget,
        type: row.type,
      }));

      const goals = db.getAllSync('SELECT * FROM goals ORDER BY status, name').map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        targetAmount: row.targetAmount,
        savedAmount: row.savedAmount,
        monthlyAmount: row.monthlyAmount,
        deadline: row.deadline ?? undefined,
        status: row.status,
      }));

      const tontineRow = db.getFirstSync('SELECT * FROM tontines WHERE status = ? LIMIT 1', ['active']);
      const tontine: Tontine | null = tontineRow ? {
        id: tontineRow.id,
        name: tontineRow.name,
        members: tontineRow.members,
        amountPerMonth: tontineRow.amountPerMonth,
        position: tontineRow.position,
        nextDrawDate: tontineRow.nextDrawDate,
        potAmount: tontineRow.potAmount,
        status: tontineRow.status,
      } : null;

      const debts = db.getAllSync('SELECT * FROM debts ORDER BY date DESC').map((row: any) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        phone: row.phone ?? undefined,
        notes: row.notes ?? undefined,
        direction: row.direction,
        date: row.date,
        status: row.status,
      }));

      const creditClients = db.getAllSync('SELECT * FROM credit_clients ORDER BY date DESC').map((row: any) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        phone: row.phone ?? undefined,
        items: row.items ?? undefined,
        date: row.date,
        status: row.status,
      }));

      set({ transactions, categories, goals, tontine, debts, creditClients });
    } catch (e) {
      console.error('loadAll error:', e);
    }
  },

  addTransaction: (t: Omit<Transaction, 'id'>) => {
    const { db } = get();
    if (!db) return;
    const id = uuidv4();
    db.runSync(
      'INSERT INTO transactions (id, type, amount, categoryId, description, method, emotion, date, pending, recurring, receiptUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null]
    );
    set(state => ({ transactions: [{ ...t, id }, ...state.transactions] }));
  },

  updateTransaction: (t: Transaction) => {
    const { db } = get();
    if (!db) return;
    db.runSync(
      'UPDATE transactions SET type=?, amount=?, categoryId=?, description=?, method=?, emotion=?, date=?, pending=?, recurring=?, receiptUri=? WHERE id=?',
      [t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null, t.id]
    );
    set(state => ({ transactions: state.transactions.map(x => x.id === t.id ? t : x) }));
  },

  deleteTransaction: (id: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
    set(state => ({ transactions: state.transactions.filter(x => x.id !== id) }));
  },

  addCategory: (c: Omit<Category, 'id'>) => {
    const { db } = get();
    if (!db) return;
    const id = uuidv4();
    db.runSync(
      'INSERT INTO categories (id, name, emoji, color, budget, type) VALUES (?, ?, ?, ?, ?, ?)',
      [id, c.name, c.emoji, c.color, c.budget, c.type]
    );
    set(state => ({ categories: [...state.categories, { ...c, id }] }));
  },

  updateCategory: (c: Category) => {
    const { db } = get();
    if (!db) return;
    db.runSync(
      'UPDATE categories SET name=?, emoji=?, color=?, budget=?, type=? WHERE id=?',
      [c.name, c.emoji, c.color, c.budget, c.type, c.id]
    );
    set(state => ({ categories: state.categories.map(x => x.id === c.id ? c : x) }));
  },

  addGoal: (g: Omit<Goal, 'id'>) => {
    const { db } = get();
    if (!db) return;
    const id = uuidv4();
    db.runSync(
      'INSERT INTO goals (id, name, icon, targetAmount, savedAmount, monthlyAmount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, g.name, g.icon, g.targetAmount, g.savedAmount, g.monthlyAmount, g.deadline ?? null, g.status]
    );
    set(state => ({ goals: [...state.goals, { ...g, id }] }));
  },

  updateGoal: (g: Goal) => {
    const { db } = get();
    if (!db) return;
    db.runSync(
      'UPDATE goals SET name=?, icon=?, targetAmount=?, savedAmount=?, monthlyAmount=?, deadline=?, status=? WHERE id=?',
      [g.name, g.icon, g.targetAmount, g.savedAmount, g.monthlyAmount, g.deadline ?? null, g.status, g.id]
    );
    set(state => ({ goals: state.goals.map(x => x.id === g.id ? g : x) }));
  },

  deleteGoal: (id: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('DELETE FROM goals WHERE id = ?', [id]);
    set(state => ({ goals: state.goals.filter(x => x.id !== id) }));
  },

  addDebt: (d: Omit<Debt, 'id'>) => {
    const { db } = get();
    if (!db) return;
    const id = uuidv4();
    db.runSync(
      'INSERT INTO debts (id, name, amount, phone, notes, direction, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, d.name, d.amount, d.phone ?? null, d.notes ?? null, d.direction, d.date, d.status]
    );
    set(state => ({ debts: [{ ...d, id }, ...state.debts] }));
  },

  updateDebt: (d: Debt) => {
    const { db } = get();
    if (!db) return;
    db.runSync(
      'UPDATE debts SET name=?, amount=?, phone=?, notes=?, direction=?, date=?, status=? WHERE id=?',
      [d.name, d.amount, d.phone ?? null, d.notes ?? null, d.direction, d.date, d.status, d.id]
    );
    set(state => ({ debts: state.debts.map(x => x.id === d.id ? d : x) }));
  },

  deleteDebt: (id: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('DELETE FROM debts WHERE id = ?', [id]);
    set(state => ({ debts: state.debts.filter(x => x.id !== id) }));
  },

  addClient: (c: Omit<CreditClient, 'id'>) => {
    const { db } = get();
    if (!db) return;
    const id = uuidv4();
    db.runSync(
      'INSERT INTO credit_clients (id, name, amount, phone, items, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, c.name, c.amount, c.phone ?? null, c.items ?? null, c.date, c.status]
    );
    set(state => ({ creditClients: [{ ...c, id }, ...state.creditClients] }));
  },

  updateClient: (c: CreditClient) => {
    const { db } = get();
    if (!db) return;
    db.runSync(
      'UPDATE credit_clients SET name=?, amount=?, phone=?, items=?, date=?, status=? WHERE id=?',
      [c.name, c.amount, c.phone ?? null, c.items ?? null, c.date, c.status, c.id]
    );
    set(state => ({ creditClients: state.creditClients.map(x => x.id === c.id ? c : x) }));
  },

  deleteClient: (id: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('DELETE FROM credit_clients WHERE id = ?', [id]);
    set(state => ({ creditClients: state.creditClients.filter(x => x.id !== id) }));
  },

  getTotalExpenses: (month?: string) => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === 'expense' && (!month || t.date.startsWith(month)))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalIncome: (month?: string) => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === 'income' && (!month || t.date.startsWith(month)))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getCategorySpending: (catId: string, month?: string) => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId && (!month || t.date.startsWith(month)))
      .reduce((sum, t) => sum + t.amount, 0);
  },
}));
