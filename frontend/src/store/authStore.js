import { create } from 'zustand'

const getInitialState = () => {
  try {
    const token = localStorage.getItem('erp_token')
    const user = JSON.parse(localStorage.getItem('erp_user') || 'null')
    return { token, user, isAuthenticated: !!token }
  } catch {
    return { token: null, user: null, isAuthenticated: false }
  }
}

const useAuthStore = create((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    localStorage.setItem('erp_token', token)
    localStorage.setItem('erp_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    // Best-effort: tell the server to release this device's session so the
    // account can be used on another device. Uses sendBeacon-style fire-and-forget.
    try {
      const user = JSON.parse(localStorage.getItem('erp_user') || 'null')
      const deviceId = localStorage.getItem('nexus_device_id')
      if (user?.email && deviceId) {
        const url = '/api/v1/client-registrations/session/logout'
        const payload = JSON.stringify({ email: user.email, deviceId })
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
        } else {
          fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
        }
      }
    } catch {
      // ignore — session will go stale on the server after the timeout
    }

    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    // Clear cached license activation so the next login must verify online
    localStorage.removeItem('nexus_license_activated')
    localStorage.removeItem('nexus_license_last_verified')
    set({ token: null, user: null, isAuthenticated: false })
  },

  updateUser: (user) => {
    localStorage.setItem('erp_user', JSON.stringify(user))
    set({ user })
  },
  
  switchDemoUser: (role) => {
    const isOwner = role === 'OWNER'
    const user = {
      id: isOwner ? 'owner-1' : 'mgr-1',
      name: isOwner ? 'Factory Owner' : 'Factory Manager',
      email: isOwner ? 'owner@garment.com' : 'manager@garment.com',
      role: isOwner ? 'OWNER' : 'MANAGER',
    }
    localStorage.setItem('erp_user', JSON.stringify(user))
    set({ user })
  },
}))

export default useAuthStore
