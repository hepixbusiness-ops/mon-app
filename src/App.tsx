import { Routes, Route, Navigate } from 'react-router-dom'
import { useSettingsStore } from './store/useSettingsStore'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Tontines from './pages/Tontines'
import Debts from './pages/Debts'
import CreditClients from './pages/CreditClients'
import NotificationsPage from './pages/NotificationsPage'
import Settings from './pages/Settings'
import Onboarding from './pages/Onboarding'
import LockScreen from './pages/LockScreen'
import Toast from './components/Toast'
import { useEffect, useState } from 'react'

export default function App() {
  const { onboardingDone, pinEnabled } = useSettingsStore()
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (pinEnabled) setLocked(true)
  }, [])

  if (!onboardingDone) return <Onboarding />
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="goals" element={<Goals />} />
          <Route path="tontines" element={<Tontines />} />
          <Route path="debts" element={<Debts />} />
          <Route path="clients" element={<CreditClients />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toast />
    </>
  )
}
