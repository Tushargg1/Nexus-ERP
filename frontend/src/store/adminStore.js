import { create } from 'zustand'

const getInitialState = () => {
  try {
    const token = localStorage.getItem('admin_token')
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null')
    return { token, user, isAuthenticated: !!token }
  } catch {
    return { token: null, user: null, isAuthenticated: false }
  }
}

const useAdminStore = create((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))

export default useAdminStore
