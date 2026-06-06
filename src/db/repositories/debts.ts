import { Debt } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function getAllDebtsSync(db: any): Debt[] {
  const rows = db.getAllSync('SELECT * FROM debts ORDER BY date DESC');
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    direction: row.direction,
    date: row.date,
    status: row.status,
  }));
}

export function insertDebtSync(db: any, d: Omit<Debt, 'id'>): Debt {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO debts (id, name, amount, phone, notes, direction, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, d.name, d.amount, d.phone ?? null, d.notes ?? null, d.direction, d.date, d.status]
  );
  return { ...d, id };
}

export function updateDebtSync(db: any, d: Debt): void {
  db.runSync(
    'UPDATE debts SET name=?, amount=?, phone=?, notes=?, direction=?, date=?, status=? WHERE id=?',
    [d.name, d.amount, d.phone ?? null, d.notes ?? null, d.direction, d.date, d.status, d.id]
  );
}

export function deleteDebtSync(db: any, id: string): void {
  db.runSync('DELETE FROM debts WHERE id = ?', [id]);
}
