import { Goal } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function getAllGoalsSync(db: any): Goal[] {
  const rows = db.getAllSync('SELECT * FROM goals ORDER BY status, name');
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    targetAmount: row.targetAmount,
    savedAmount: row.savedAmount,
    monthlyAmount: row.monthlyAmount,
    deadline: row.deadline ?? undefined,
    status: row.status,
  }));
}

export function insertGoalSync(db: any, g: Omit<Goal, 'id'>): Goal {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO goals (id, name, icon, targetAmount, savedAmount, monthlyAmount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, g.name, g.icon, g.targetAmount, g.savedAmount, g.monthlyAmount, g.deadline ?? null, g.status]
  );
  return { ...g, id };
}

export function updateGoalSync(db: any, g: Goal): void {
  db.runSync(
    'UPDATE goals SET name=?, icon=?, targetAmount=?, savedAmount=?, monthlyAmount=?, deadline=?, status=? WHERE id=?',
    [g.name, g.icon, g.targetAmount, g.savedAmount, g.monthlyAmount, g.deadline ?? null, g.status, g.id]
  );
}

export function deleteGoalSync(db: any, id: string): void {
  db.runSync('DELETE FROM goals WHERE id = ?', [id]);
}
