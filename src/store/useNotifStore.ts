import { create } from 'zustand';
import { Notification } from '../types';

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  db: any | null;

  setDB: (db: any) => void;
  loadNotifications: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  db: null,

  setDB: (db: any) => set({ db }),

  loadNotifications: () => {
    const { db } = get();
    if (!db) return;
    try {
      const rows = db.getAllSync('SELECT * FROM notifications ORDER BY createdAt DESC') as any[];
      const notifications = rows.map(row => ({
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        read: row.read === 1,
        createdAt: row.createdAt,
      }));
      set({ notifications, unreadCount: notifications.filter(n => !n.read).length });
    } catch (e) {
      console.error('loadNotifications error:', e);
    }
  },

  markRead: (id: string) => {
    const { db } = get();
    if (!db) return;
    db.runSync('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
    set(state => {
      const notifications = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return { notifications, unreadCount: notifications.filter(n => !n.read).length };
    });
  },

  markAllRead: () => {
    const { db } = get();
    if (!db) return;
    db.runSync('UPDATE notifications SET read = 1');
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    const { db } = get();
    if (!db) return;
    db.runSync('DELETE FROM notifications');
    set({ notifications: [], unreadCount: 0 });
  },
}));
