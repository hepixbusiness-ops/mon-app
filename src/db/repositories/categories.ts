import { Category } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function getAllCategoriesSync(db: any): Category[] {
  const rows = db.getAllSync('SELECT * FROM categories ORDER BY type, name');
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    budget: row.budget,
    type: row.type,
  }));
}

export function insertCategorySync(db: any, c: Omit<Category, 'id'>): Category {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO categories (id, name, emoji, color, budget, type) VALUES (?, ?, ?, ?, ?, ?)',
    [id, c.name, c.emoji, c.color, c.budget, c.type]
  );
  return { ...c, id };
}

export function updateCategorySync(db: any, c: Category): void {
  db.runSync(
    'UPDATE categories SET name=?, emoji=?, color=?, budget=?, type=? WHERE id=?',
    [c.name, c.emoji, c.color, c.budget, c.type, c.id]
  );
}
