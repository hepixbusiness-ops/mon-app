export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  description: string;
  method: 'cash' | 'mtn' | 'om' | 'card';
  emotion?: string;
  date: string;
  pending: boolean;
  recurring: boolean;
  receiptUri?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  budget: number;
  type: 'expense' | 'income' | 'both';
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
  monthlyAmount: number;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Tontine {
  id: string;
  name: string;
  members: number;
  amountPerMonth: number;
  position: number;
  nextDrawDate: string;
  potAmount: number;
  status: 'active' | 'inactive';
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  phone?: string;
  notes?: string;
  direction: 'owed' | 'owe';
  date: string;
  status: 'pending' | 'settled';
}

export interface CreditClient {
  id: string;
  name: string;
  amount: number;
  phone?: string;
  items?: string;
  date: string;
  status: 'pending' | 'settled';
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'budget' | 'tontine' | 'relance' | 'badge' | 'info';
  read: boolean;
  createdAt: string;
}
