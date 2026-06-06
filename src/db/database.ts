import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

export async function initDB(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      categoryId TEXT NOT NULL,
      description TEXT,
      method TEXT NOT NULL,
      emotion TEXT,
      date TEXT NOT NULL,
      pending INTEGER DEFAULT 0,
      recurring INTEGER DEFAULT 0,
      receiptUri TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT,
      color TEXT,
      budget REAL DEFAULT 0,
      type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      targetAmount REAL NOT NULL,
      savedAmount REAL DEFAULT 0,
      monthlyAmount REAL DEFAULT 0,
      deadline TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS tontines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      members INTEGER DEFAULT 0,
      amountPerMonth REAL DEFAULT 0,
      position INTEGER DEFAULT 1,
      nextDrawDate TEXT,
      potAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      phone TEXT,
      notes TEXT,
      direction TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS credit_clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      phone TEXT,
      items TEXT,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  const seeded = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'seeded'"
  );

  if (seeded?.value === '1') return;

  // Seed demo data
  const now = Date.now();

  // Categories
  const cats = [
    { id: 'loyer', name: 'Loyer', emoji: '🏠', color: '#60a5fa', budget: 90000, type: 'expense' },
    { id: 'alim', name: 'Alimentation', emoji: '🛒', color: '#34d399', budget: 60000, type: 'expense' },
    { id: 'transport', name: 'Transport', emoji: '🚕', color: '#fbbf24', budget: 20000, type: 'expense' },
    { id: 'maquis', name: 'Maquis', emoji: '🍢', color: '#f472b6', budget: 30000, type: 'expense' },
    { id: 'forfait', name: 'Forfait', emoji: '📱', color: '#a599fa', budget: 15000, type: 'expense' },
    { id: 'sante', name: 'Santé', emoji: '❤️', color: '#f87171', budget: 20000, type: 'expense' },
    { id: 'famille', name: 'Famille', emoji: '💸', color: '#2dd4bf', budget: 30000, type: 'expense' },
    { id: 'factures', name: 'Factures', emoji: '💡', color: '#fbbf24', budget: 25000, type: 'expense' },
    { id: 'salaire', name: 'Salaire', emoji: '💳', color: '#34d399', budget: 0, type: 'income' },
    { id: 'vente', name: 'Vente', emoji: '🏪', color: '#60a5fa', budget: 0, type: 'income' },
    { id: 'tontine_g', name: 'Tontine', emoji: '🤝', color: '#a599fa', budget: 0, type: 'income' },
    { id: 'famille_r', name: 'Famille', emoji: '💸', color: '#2dd4bf', budget: 0, type: 'income' },
    { id: 'extra', name: 'Extra', emoji: '💼', color: '#fbbf24', budget: 0, type: 'income' },
    { id: 'autre_r', name: 'Autre', emoji: '➕', color: '#94a3b8', budget: 0, type: 'income' },
  ];

  for (const c of cats) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, emoji, color, budget, type) VALUES (?, ?, ?, ?, ?, ?)',
      [c.id, c.name, c.emoji, c.color, c.budget, c.type]
    );
  }

  // Transactions with dynamic dates relative to today
  function daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  const transactions = [
    { id: uuidv4(), type: 'income', amount: 320000, categoryId: 'salaire', description: 'Salaire', method: 'card', emotion: null, date: daysAgo(2), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 90000, categoryId: 'loyer', description: 'Loyer du mois', method: 'cash', emotion: 'need', date: daysAgo(3), pending: 0, recurring: 1 },
    { id: uuidv4(), type: 'expense', amount: 12500, categoryId: 'alim', description: 'Marché Mvog-Mbi', method: 'cash', emotion: 'need', date: daysAgo(3), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 25000, categoryId: 'famille', description: 'Transfert famille', method: 'mtn', emotion: 'need', date: daysAgo(4), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'income', amount: 45000, categoryId: 'vente', description: 'Bénéfice boutique', method: 'om', emotion: null, date: daysAgo(4), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 3000, categoryId: 'transport', description: 'Taxi', method: 'cash', emotion: 'need', date: daysAgo(5), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 10000, categoryId: 'forfait', description: 'Forfait MTN 30j', method: 'mtn', emotion: 'neutral', date: daysAgo(5), pending: 0, recurring: 1 },
    { id: uuidv4(), type: 'expense', amount: 8500, categoryId: 'maquis', description: 'Maquis Chez Tantie', method: 'om', emotion: 'impulse', date: daysAgo(6), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 14500, categoryId: 'factures', description: 'ENEO', method: 'om', emotion: 'need', date: daysAgo(6), pending: 0, recurring: 1 },
    { id: uuidv4(), type: 'expense', amount: 6500, categoryId: 'sante', description: 'Pharmacie', method: 'cash', emotion: 'need', date: daysAgo(7), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 15000, categoryId: 'maquis', description: 'Restaurant sortie', method: 'card', emotion: 'happy', date: daysAgo(8), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 2000, categoryId: 'forfait', description: 'Crédit téléphone', method: 'mtn', emotion: 'neutral', date: daysAgo(8), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 700, categoryId: 'alim', description: 'Beignets-haricot', method: 'cash', emotion: 'happy', date: daysAgo(9), pending: 0, recurring: 0 },
    { id: uuidv4(), type: 'expense', amount: 20000, categoryId: 'tontine_g', description: 'Tontine cotisation', method: 'om', emotion: 'need', date: daysAgo(10), pending: 0, recurring: 1 },
  ];

  for (const t of transactions) {
    await db.runAsync(
      'INSERT OR IGNORE INTO transactions (id, type, amount, categoryId, description, method, emotion, date, pending, recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [t.id, t.type, t.amount, t.categoryId, t.description, t.method, t.emotion, t.date, t.pending, t.recurring]
    );
  }

  // Goals
  const goals = [
    { id: uuidv4(), name: 'Rentrée scolaire', icon: '📚', targetAmount: 200000, savedAmount: 120000, monthlyAmount: 20000, deadline: '2026-09-01', status: 'active' },
    { id: uuidv4(), name: 'Fête de Noël', icon: '🎄', targetAmount: 150000, savedAmount: 60000, monthlyAmount: 15000, deadline: '2026-12-20', status: 'active' },
    { id: uuidv4(), name: 'Fête de la Jeunesse', icon: '🎉', targetAmount: 50000, savedAmount: 30000, monthlyAmount: 10000, deadline: '2027-02-11', status: 'active' },
    { id: uuidv4(), name: 'Projet commerce', icon: '🏪', targetAmount: 1000000, savedAmount: 350000, monthlyAmount: 50000, deadline: '2027-06-01', status: 'active' },
  ];

  for (const g of goals) {
    await db.runAsync(
      'INSERT OR IGNORE INTO goals (id, name, icon, targetAmount, savedAmount, monthlyAmount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [g.id, g.name, g.icon, g.targetAmount, g.savedAmount, g.monthlyAmount, g.deadline, g.status]
    );
  }

  // Tontine — nextDrawDate = first day of month 2 months from now
  const nextDraw = new Date();
  nextDraw.setMonth(nextDraw.getMonth() + 2);
  nextDraw.setDate(1);
  const nextDrawDate = nextDraw.toISOString().split('T')[0];

  await db.runAsync(
    'INSERT OR IGNORE INTO tontines (id, name, members, amountPerMonth, position, nextDrawDate, potAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'Tontine du quartier', 12, 20000, 5, nextDrawDate, 240000, 'active']
  );

  // Debts
  const debts = [
    { id: uuidv4(), name: 'Christian', amount: 15000, phone: '+237691000000', notes: 'Prêt en espèces', direction: 'owed', date: daysAgo(22), status: 'pending' },
    { id: uuidv4(), name: 'Mami Nga', amount: 5000, phone: '+237699112233', notes: '', direction: 'owed', date: daysAgo(17), status: 'pending' },
    { id: uuidv4(), name: 'Tonton Emile', amount: 30000, phone: '', notes: 'Prêt pour loyer', direction: 'owe', date: daysAgo(57), status: 'pending' },
  ];

  for (const d of debts) {
    await db.runAsync(
      'INSERT OR IGNORE INTO debts (id, name, amount, phone, notes, direction, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [d.id, d.name, d.amount, d.phone, d.notes, d.direction, d.date, d.status]
    );
  }

  // Credit clients
  const clients = [
    { id: uuidv4(), name: 'Boutique Mballa', amount: 42000, phone: '+237677000001', items: 'Riz, huile, savon', date: daysAgo(9), status: 'pending' },
    { id: uuidv4(), name: 'Maman Estelle', amount: 12500, phone: '+237677000002', items: 'Farine, sucre', date: daysAgo(5), status: 'pending' },
    { id: uuidv4(), name: 'Resto Le Palmier', amount: 28000, phone: '+237677000003', items: 'Boissons, repas', date: daysAgo(12), status: 'pending' },
    { id: uuidv4(), name: 'Jean moto', amount: 6000, phone: '+237677000004', items: 'Carburant', date: daysAgo(3), status: 'pending' },
  ];

  for (const c of clients) {
    await db.runAsync(
      'INSERT OR IGNORE INTO credit_clients (id, name, amount, phone, items, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [c.id, c.name, c.amount, c.phone, c.items, c.date, c.status]
    );
  }

  // Notifications
  const notifs = [
    { id: uuidv4(), title: 'Budget Maquis dépassé !', body: 'Vous avez dépensé 23 500 FCFA sur votre budget maquis de 30 000 FCFA.', type: 'budget', read: 0, createdAt: new Date().toISOString() },
    { id: uuidv4(), title: 'Tontine — Tirage en août', body: 'Votre tour de tontine du quartier est prévu le 1 août 2026. Pot: 240 000 FCFA.', type: 'tontine', read: 0, createdAt: new Date(now - 86400000).toISOString() },
    { id: uuidv4(), title: 'Relance client', body: 'Boutique Mballa vous doit 42 000 FCFA depuis 8 jours. Envoyez une relance.', type: 'relance', read: 1, createdAt: new Date(now - 2 * 86400000).toISOString() },
    { id: uuidv4(), title: 'Badge débloqué 🏅', body: 'Félicitations ! Vous avez débloqué le badge "Tontine à jour".', type: 'badge', read: 1, createdAt: new Date(now - 3 * 86400000).toISOString() },
  ];

  for (const n of notifs) {
    await db.runAsync(
      'INSERT OR IGNORE INTO notifications (id, title, body, type, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [n.id, n.title, n.body, n.type, n.read, n.createdAt]
    );
  }

  // Default settings
  const defaultSettings = [
    ['seeded', '1'],
    ['currency', 'XOF'],
    ['theme', 'dark'],
    ['accent', '#7c6af7'],
    ['mode', 'perso'],
    ['firstName', 'Utilisateur'],
    ['walletName', 'Mon Portefeuille'],
    ['language', 'fr'],
    ['pinEnabled', 'false'],
    ['monthlyBudget', '300000'],
    ['onboardingDone', 'false'],
  ];

  for (const [key, value] of defaultSettings) {
    await db.runAsync('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
}
