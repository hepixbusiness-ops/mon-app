import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Bell, Trash2, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { useUIStore } from '../store/useUIStore'

export default function NotificationsPage() {
  const { showToast } = useUIStore()
  const notifs = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray(), []) ?? []

  async function markRead(id: string) { await db.notifications.update(id, { read: 1 }) }
  async function markAllRead() { await db.notifications.toCollection().modify({ read: 1 }); showToast('Toutes lues') }
  async function remove(id: string) { await db.notifications.delete(id); showToast('Supprimé') }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifs.some(n => n.read === 0) && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-[#7c6af7]">
            <CheckCheck size={18} /> Tout lire
          </button>
        )}
      </div>
      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id} className={`rounded-2xl p-4 flex gap-3 ${n.read === 0 ? 'bg-[#7c6af7]/10 border border-[#7c6af7]/30' : 'bg-[#1c1c1e]'}`}
            onClick={() => markRead(n.id)}>
            <div className="w-10 h-10 rounded-2xl bg-[#7c6af7]/20 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-[#7c6af7]" />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${n.read === 0 ? 'text-white' : 'text-[#8e8e93]'}`}>{n.title}</p>
              <p className="text-xs text-[#8e8e93] mt-1">{n.body}</p>
              <p className="text-xs text-[#8e8e93] mt-1">{format(new Date(n.createdAt), 'dd MMM · HH:mm')}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); remove(n.id) }} className="p-1 text-[#8e8e93]"><Trash2 size={16} /></button>
          </div>
        ))}
        {notifs.length === 0 && <p className="text-center text-[#8e8e93] py-12">Aucune notification</p>}
      </div>
    </div>
  )
}
