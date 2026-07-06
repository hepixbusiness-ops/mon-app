import { useUIStore } from '../store/useUIStore'
import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function Toast() {
  const { toast } = useUIStore()
  if (!toast) return null

  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' }
  const Icon = icons[toast.type]

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] ${colors[toast.type]} text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl max-w-[90vw]`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  )
}
