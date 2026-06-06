export const COLORS = {
  accent: '#7c6af7',
  green: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
  blue: '#60a5fa',
  pink: '#f472b6',
  teal: '#2dd4bf',
  mtn: '#ffcc00',
  om: '#ff7900',
  cash: '#34d399',
  card: '#a599fa',
  dark: {
    bg: '#0a0a0b',
    card: '#14141a',
    overlay: '#18181e',
    raised: '#111115',
  },
  light: {
    bg: '#f6f6f9',
    card: '#ffffff',
    overlay: '#eeeeee',
    raised: '#f0f0f5',
  },
};

export const DARK_THEME = {
  bg: '#0a0a0b',
  card: '#14141a',
  overlay: '#18181e',
  raised: '#111115',
  text: {
    primary: 'rgba(242,242,248,0.92)',
    secondary: 'rgba(242,242,248,0.54)',
    muted: 'rgba(242,242,248,0.30)',
  },
  border: {
    subtle: 'rgba(242,242,248,0.06)',
    default: 'rgba(242,242,248,0.12)',
  },
  accent: '#7c6af7',
  green: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
  blue: '#60a5fa',
  pink: '#f472b6',
  teal: '#2dd4bf',
};

export const LIGHT_THEME = {
  bg: '#f6f6f9',
  card: '#ffffff',
  overlay: '#eeeeee',
  raised: '#f0f0f5',
  text: {
    primary: 'rgba(10,10,11,0.92)',
    secondary: 'rgba(10,10,11,0.54)',
    muted: 'rgba(10,10,11,0.30)',
  },
  border: {
    subtle: 'rgba(10,10,11,0.06)',
    default: 'rgba(10,10,11,0.12)',
  },
  accent: '#7c6af7',
  green: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
  blue: '#60a5fa',
  pink: '#f472b6',
  teal: '#2dd4bf',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 18,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ACCENTS = [
  '#7c6af7',
  '#60a5fa',
  '#34d399',
  '#f472b6',
  '#fbbf24',
  '#2dd4bf',
];

export function formatFCFA(n: number): string {
  if (isNaN(n)) return '0 FCFA';
  const abs = Math.abs(Math.round(n));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (n < 0 ? '−' : '') + formatted + ' FCFA';
}

export function convertAmount(n: number, currency: string): string {
  const rates: Record<string, { rate: number; symbol: string }> = {
    XOF: { rate: 1, symbol: 'FCFA' },
    EUR: { rate: 0.00153, symbol: '€' },
    USD: { rate: 0.00166, symbol: '$' },
  };
  const c = rates[currency] ?? rates.XOF;
  const converted = n * c.rate;
  if (currency === 'XOF') return formatFCFA(n);
  return (converted < 0 ? '−' : '') + Math.abs(converted).toFixed(2) + ' ' + c.symbol;
}
