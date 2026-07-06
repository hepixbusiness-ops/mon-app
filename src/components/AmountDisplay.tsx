import { useSettingsStore } from '../store/useSettingsStore'

export function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'XOF' ? 'XOF' : currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AmountDisplay({ amount, className = '', colored = false, type }: {
  amount: number
  className?: string
  colored?: boolean
  type?: 'income' | 'expense'
}) {
  const { currency } = useSettingsStore()
  const color = colored ? (type === 'income' ? 'text-[#32d74b]' : 'text-[#ff453a]') : ''
  return <span className={`font-semibold ${color} ${className}`}>{formatAmount(amount, currency)}</span>
}
