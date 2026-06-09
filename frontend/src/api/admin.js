import axios from 'axios'
import { API_BASE_URL } from '../config/appConfig'

// Separate axios instance for admin that uses its own token
const adminClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api/v1/admin` : '/api/v1/admin',
  headers: { 'Content-Type': 'application/json' },
})

// Attach admin token from separate storage key
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for authenticated requests, NOT for the login attempt itself
    const isLoginRequest = error.config?.url?.includes('/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export const adminAPI = {
  login: (email, password) =>
    adminClient.post('/login', { email, password }),

  getStats: () =>
    adminClient.get('/stats'),

  getAllRegistrations: () =>
    adminClient.get('/registrations'),

  getPendingRegistrations: () =>
    adminClient.get('/registrations/pending'),

  approveRegistration: (id) =>
    adminClient.post(`/registrations/${id}/approve`),

  rejectRegistration: (id) =>
    adminClient.post(`/registrations/${id}/reject`),

  revokeAccess: (id) =>
    adminClient.post(`/registrations/${id}/revoke`),

  // Sessions & devices
  getAllSessions: () =>
    adminClient.get('/sessions'),

  forceLogout: (email) =>
    adminClient.post('/sessions/force-logout', { email }),
}

export default adminClient
