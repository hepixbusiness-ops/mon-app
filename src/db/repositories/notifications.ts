import { Notification } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export function getAllNotificationsSync(db: any): Notification[] {
  const rows = db.getAllSync('SELECT * FROM notifications ORDER BY createdAt DESC');
  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    read: row.read === 1,
    createdAt: row.createdAt,
  }));
}

export function markReadSync(db: any, id: string): void {
  db.runSync('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
}

export function markAllReadSync(db: any): void {
  db.runSync('UPDATE notifications SET read = 1');
}

export function clearAllNotificationsSync(db: any): void {
  db.runSync('DELETE FROM notifications');
}

export function insertNotificationSync(db: any, n: Omit<Notification, 'id'>): Notification {
  const id = uuidv4();
  db.runSync(
    'INSERT INTO notifications (id, title, body, type, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, n.title, n.body, n.type, n.read ? 1 : 0, n.createdAt]
  );
  return { ...n, id };
}
