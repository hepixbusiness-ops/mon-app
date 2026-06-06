import { CreditClient } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function getAllClientsSync(db: any): CreditClient[] {
  const rows = db.getAllSync('SELECT * FROM credit_clients ORDER BY date DESC');
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    phone: row.phone ?? undefined,
    items: row.items ?? undefined,
    date: row.date,
    status: row.status,
  }));
}

export function insertClientSync(db: any, c: Omit<CreditClient, 'id'>): CreditClient {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO credit_clients (id, name, amount, phone, items, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, c.name, c.amount, c.phone ?? null, c.items ?? null, c.date, c.status]
  );
  return { ...c, id };
}

export function updateClientSync(db: any, c: CreditClient): void {
  db.runSync(
    'UPDATE credit_clients SET name=?, amount=?, phone=?, items=?, date=?, status=? WHERE id=?',
    [c.name, c.amount, c.phone ?? null, c.items ?? null, c.date, c.status, c.id]
  );
}

export function deleteClientSync(db: any, id: string): void {
  db.runSync('DELETE FROM credit_clients WHERE id = ?', [id]);
}
