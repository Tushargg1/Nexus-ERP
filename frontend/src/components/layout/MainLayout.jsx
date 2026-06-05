import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from './Sidebar'
import Header from './Header'
import { IS_INSTALLED_APP } from '../../config/appConfig'
import { licenseAPI } from '../../api/license'
import useAuthStore from '../../store/authStore'

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // Single-device session heartbeat (installed app only). Keeps this device's
  // session alive and detects if the account was taken over on another device.
  useEffect(() => {
    if (!IS_INSTALLED_APP || !user?.email) return

    let cancelled = false
    const beat = async () => {
      const stillOurs = await licenseAPI.heartbeat(user.email)
      if (!stillOurs && !cancelled) {
        toast.error('Your account was signed in on another device. Signing out.')
        setTimeout(() => logout(), 1500)
      }
    }
    // Heartbeat every 2 minutes (server timeout is 10 minutes)
    const interval = setInterval(beat, 2 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [user?.email, logout])

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
