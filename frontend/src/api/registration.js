import client from './client'
import { getDeviceId, getDeviceLabel } from '../utils/deviceId'

export const registrationAPI = {
  // Public - submit a new registration request
  submitRegistration: (data) =>
    client.post('/client-registrations', data),

  // Public - request to purchase the software (account must exist)
  requestPurchase: (email) =>
    client.post('/client-registrations/purchase', { email }),

  // Public - client login (email + password + deviceId). Pass force=true to
  // take over the session from another device (device switch).
  login: (email, password, force = false) =>
    client.post('/client-registrations/login', {
      email, password, deviceId: getDeviceId(), deviceLabel: getDeviceLabel(), force: force ? 'true' : 'false',
    }),

  // Public - keep the device session alive
  heartbeat: (email) =>
    client.post('/client-registrations/session/heartbeat', { email, deviceId: getDeviceId() }),

  // Public - release the device session (logout)
  sessionLogout: (email) =>
    client.post('/client-registrations/session/logout', { email, deviceId: getDeviceId() }),

  // Public - change client password
  changePassword: (email, currentPassword, newPassword) =>
    client.post('/client-registrations/change-password', { email, currentPassword, newPassword }),

  // Public - forgot password (emails a temporary password)
  forgotPassword: (email) =>
    client.post('/client-registrations/forgot-password', { email }),

  // Public - verify license status by email
  verifyLicense: (email) =>
    client.get(`/client-registrations/verify-license?email=${encodeURIComponent(email)}`),

  // Public - check registration status (for download page)
  getRegistrationStatus: (email) =>
    client.get(`/client-registrations/status?email=${encodeURIComponent(email)}`),

  // Admin - get pending registrations
  getPendingRegistrations: () =>
    client.get('/client-registrations/pending'),

  // Admin - get all registrations
  getAllRegistrations: () =>
    client.get('/client-registrations'),

  // Admin - approve a registration
  approveRegistration: (id) =>
    client.post(`/client-registrations/${id}/approve`),

  // Admin - reject a registration
  rejectRegistration: (id) =>
    client.post(`/client-registrations/${id}/reject`),
}
