import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, Users, CreditCard, ShoppingBag, Bell, Settings } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/goals', icon: Target, label: 'Objectifs' },
  { to: '/tontines', icon: Users, label: 'Tontines' },
  { to: '/debts', icon: CreditCard, label: 'Dettes' },
  { to: '/clients', icon: ShoppingBag, label: 'Crédit' },
  { to: '/notifications', icon: Bell, label: 'Notifs' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
]

export default function Layout() {
  const unread = useLiveQuery(() => db.notifications.where('read').equals(0).count(), []) ?? 0

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] max-w-md mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#141416] border-t border-[#2a2a2e] safe-bottom z-50">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative ${
                  isActive ? 'text-[#7c6af7]' : 'text-[#8e8e93]'
                }`
              }
            >
              <div className="relative">
                <Icon size={20} strokeWidth={1.8} />
                {to === '/notifications' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
