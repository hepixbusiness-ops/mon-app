import { useSQLiteContext } from 'expo-sqlite';
import { Transaction } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function useTransactionRepository() {
  const db = useSQLiteContext();

  function getAllTransactions(): Transaction[] {
    const rows = db.getAllSync<any>(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    return rows.map(rowToTransaction);
  }

  function getTransactions(filter: {
    type?: 'expense' | 'income';
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }): Transaction[] {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (filter.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }
    if (filter.startDate) {
      query += ' AND date >= ?';
      params.push(filter.startDate);
    }
    if (filter.endDate) {
      query += ' AND date <= ?';
      params.push(filter.endDate);
    }
    if (filter.categoryId) {
      query += ' AND categoryId = ?';
      params.push(filter.categoryId);
    }

    query += ' ORDER BY date DESC';
    const rows = db.getAllSync<any>(query, params);
    return rows.map(rowToTransaction);
  }

  function insertTransaction(t: Omit<Transaction, 'id'>): Transaction {
    const id = uuidv4();
    db.runSync(
      'INSERT INTO transactions (id, type, amount, categoryId, description, method, emotion, date, pending, recurring, receiptUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null]
    );
    return { ...t, id };
  }

  function updateTransaction(t: Transaction): void {
    db.runSync(
      'UPDATE transactions SET type=?, amount=?, categoryId=?, description=?, method=?, emotion=?, date=?, pending=?, recurring=?, receiptUri=? WHERE id=?',
      [t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null, t.id]
    );
  }

  function deleteTransaction(id: string): void {
    db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  function getPendingTransactions(): Transaction[] {
    const rows = db.getAllSync<any>('SELECT * FROM transactions WHERE pending = 1 ORDER BY date DESC');
    return rows.map(rowToTransaction);
  }

  return { getAllTransactions, getTransactions, insertTransaction, updateTransaction, deleteTransaction, getPendingTransactions };
}

function rowToTransaction(row: any): Transaction {
  return {
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
  };
}

// Standalone functions for use outside of hooks (with db param)
export function getAllTransactionsSync(db: any): Transaction[] {
  const rows = db.getAllSync('SELECT * FROM transactions ORDER BY date DESC');
  return rows.map(rowToTransaction);
}

export function insertTransactionSync(db: any, t: Omit<Transaction, 'id'>): Transaction {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO transactions (id, type, amount, categoryId, description, method, emotion, date, pending, recurring, receiptUri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null]
  );
  return { ...t, id };
}

export function updateTransactionSync(db: any, t: Transaction): void {
  db.runSync(
    'UPDATE transactions SET type=?, amount=?, categoryId=?, description=?, method=?, emotion=?, date=?, pending=?, recurring=?, receiptUri=? WHERE id=?',
    [t.type, t.amount, t.categoryId, t.description, t.method, t.emotion ?? null, t.date, t.pending ? 1 : 0, t.recurring ? 1 : 0, t.receiptUri ?? null, t.id]
  );
}

export function deleteTransactionSync(db: any, id: string): void {
  db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
}
