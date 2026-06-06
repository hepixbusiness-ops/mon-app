export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.00153 },
  { code: 'USD', name: 'Dollar US', symbol: '$', rate: 0.00166 },
];
