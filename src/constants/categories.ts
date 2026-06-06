export interface CategoryDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  budget?: number;
  type: 'expense' | 'income';
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'loyer', name: 'Loyer', emoji: '🏠', color: '#60a5fa', budget: 90000, type: 'expense' },
  { id: 'alim', name: 'Alimentation', emoji: '🛒', color: '#34d399', budget: 60000, type: 'expense' },
  { id: 'transport', name: 'Transport', emoji: '🚕', color: '#fbbf24', budget: 20000, type: 'expense' },
  { id: 'maquis', name: 'Maquis', emoji: '🍢', color: '#f472b6', budget: 30000, type: 'expense' },
  { id: 'forfait', name: 'Forfait', emoji: '📱', color: '#a599fa', budget: 15000, type: 'expense' },
  { id: 'sante', name: 'Santé', emoji: '❤️', color: '#f87171', budget: 20000, type: 'expense' },
  { id: 'famille', name: 'Famille', emoji: '💸', color: '#2dd4bf', budget: 30000, type: 'expense' },
  { id: 'factures', name: 'Factures', emoji: '💡', color: '#fbbf24', budget: 25000, type: 'expense' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salaire', name: 'Salaire', emoji: '💳', color: '#34d399', type: 'income' },
  { id: 'vente', name: 'Vente', emoji: '🏪', color: '#60a5fa', type: 'income' },
  { id: 'tontine_g', name: 'Tontine', emoji: '🤝', color: '#a599fa', type: 'income' },
  { id: 'famille_r', name: 'Famille', emoji: '💸', color: '#2dd4bf', type: 'income' },
  { id: 'extra', name: 'Extra', emoji: '💼', color: '#fbbf24', type: 'income' },
  { id: 'autre_r', name: 'Autre', emoji: '➕', color: '#94a3b8', type: 'income' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
