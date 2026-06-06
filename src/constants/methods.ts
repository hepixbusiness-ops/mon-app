export interface PaymentMethod {
  id: string;
  name: string;
  short: string;
  color: string;
  emoji: string;
}

export const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  cash: { id: 'cash', name: 'Espèces', short: 'Cash', color: '#34d399', emoji: '💵' },
  mtn: { id: 'mtn', name: 'MTN MoMo', short: 'MoMo', color: '#ffcc00', emoji: '🟡' },
  om: { id: 'om', name: 'Orange Money', short: 'OM', color: '#ff7900', emoji: '🟠' },
  card: { id: 'card', name: 'Carte/Banque', short: 'Banq', color: '#a599fa', emoji: '💳' },
};

export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);
