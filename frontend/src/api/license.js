import axios from 'axios'
import { LICENSE_SERVER_URL, LICENSE_KEYS, OFFLINE_GRACE_DAYS } from '../config/appConfig'
import { getDeviceId, getDeviceLabel } from '../utils/deviceId'

/**
 * License client for the INSTALLED (downloaded) app.
 *
 * Login strategy:
 *  - Try ONLINE first → enforces single-device sessions + license approval,
 *    and caches a credential hash for offline use.
 *  - If OFFLINE and this device was already activated for that account with
 *    matching credentials → allow OFFLINE login (within a grace window).
 *  - A brand-new device or a wrong password offline → denied (must go online).
 */

const licenseClient = axios.create({
  baseURL: LICENSE_SERVER_URL ? `${LICENSE_SERVER_URL}/api/v1` : '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Lightweight SHA-256 hash (via Web Crypto) of email+password+deviceId.
// Never stores the raw password; only this salted hash is kept locally.
async function hashCredential(email, password) {
  const material = `${email.toLowerCase()}::${password}::${getDeviceId()}`
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback (non-secure-context) — still device+credential specific
    let h = 0
    for (let i = 0; i < material.length; i++) { h = (h * 31 + material.charCodeAt(i)) | 0 }
    return 'fallback-' + h
  }
}

// Attempts an offline login using the cached credential hash for THIS device.
// Returns a success result if the device was previously activated with the same
// email+password and is within the offline grace window; otherwise null.
async function tryOfflineLogin(email, password) {
  try {
    const raw = localStorage.getItem(LICENSE_KEYS.offlineCred)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (!cached?.email || cached.email !== email.toLowerCase()) return null

    // Check the credential matches this device's cached hash
    const hash = await hashCredential(email, password)
    if (hash !== cached.hash) return null

    // Enforce the offline grace window
    const verifiedAt = new Date(cached.verifiedAt).getTime()
    const ageDays = (Date.now() - verifiedAt) / (1000 * 60 * 60 * 24)
    if (ageDays > OFFLINE_GRACE_DAYS) {
      return { ok: false, offline: true, expired: true,
        message: `Offline access expired. Please connect to the internet to sign in (required at least every ${OFFLINE_GRACE_DAYS} days).` }
    }

    // Offline login granted on this already-activated device
    return {
      ok: true,
      offlineLogin: true,
      approved: true,
      status: 'APPROVED',
      user: { email: cached.email, name: cached.email.split('@')[0] },
    }
  } catch {
    return null
  }
}

export const licenseAPI = {
  /**
   * Verify the client's email + password against the central server AND that
   * their license is approved. Returns { ok, approved, status, message, user }.
   * Requires internet.
   */
  verifyOnline: async (email, password) => {
    try {
      const res = await licenseClient.post('/client-registrations/login', {
        email,
        password,
        deviceId: getDeviceId(),
        deviceLabel: getDeviceLabel(),
      })
      const data = res.data
      // Cache a credential hash so this device can log in offline next time.
      if (data.status === 'APPROVED') {
        const hash = await hashCredential(email, password)
        localStorage.setItem(LICENSE_KEYS.offlineCred, JSON.stringify({
          email: email.toLowerCase(),
          hash,
          verifiedAt: new Date().toISOString(),
        }))
      }
      return {
        ok: true,
        approved: data.status === 'APPROVED',
        status: data.status,
        user: data,
      }
    } catch (err) {
      // Network error → no server reachable. Try OFFLINE login on this device.
      if (!err.response) {
        const offline = await tryOfflineLogin(email, password)
        if (offline) return offline
        return { ok: false, offline: true, message: 'No internet connection. The first sign-in on this device requires internet.' }
      }
      // 409 = account is already signed in on another device (can force-switch)
      if (err.response.status === 409) {
        return {
          ok: false,
          conflict: true,
          canForce: err.response.data?.canForce === true,
          message: err.response.data?.message || 'This account is already signed in on another device.',
        }
      }
      // Server responded with an error (bad credentials, etc.)
      return {
        ok: false,
        approved: false,
        status: err.response.data?.status,
        message: err.response.data?.message || 'Invalid email or password.',
      }
    }
  },

  /** Force login — takes over the session from another device (device switch). */
  forceLogin: async (email, password) => {
    try {
      const res = await licenseClient.post('/client-registrations/login', {
        email,
        password,
        deviceId: getDeviceId(),
        deviceLabel: getDeviceLabel(),
        force: 'true',
      })
      const data = res.data
      if (data.status === 'APPROVED') {
        const hash = await hashCredential(email, password)
        localStorage.setItem(LICENSE_KEYS.offlineCred, JSON.stringify({
          email: email.toLowerCase(), hash, verifiedAt: new Date().toISOString(),
        }))
      }
      return { ok: true, approved: data.status === 'APPROVED', status: data.status, user: data }
    } catch (err) {
      if (!err.response) return { ok: false, offline: true, message: 'No internet connection.' }
      return { ok: false, message: err.response.data?.message || 'Could not switch device.' }
    }
  },

  /** Keep the device session alive. Returns false if the session was lost. */
  heartbeat: async (email) => {
    try {
      const res = await licenseClient.post('/client-registrations/session/heartbeat', {
        email,
        deviceId: getDeviceId(),
      })
      return res.data?.active === true
    } catch (err) {
      // 409 = session taken over elsewhere; network error = treat as still ok (offline grace)
      if (err.response?.status === 409) return false
      return true
    }
  },

  /** Release the device session on the server (logout). Best-effort. */
  releaseSession: async (email) => {
    try {
      await licenseClient.post('/client-registrations/session/logout', {
        email,
        deviceId: getDeviceId(),
      })
    } catch (err) {
      // Best-effort: if offline, the session will go stale on the server after the timeout.
    }
  },

  /** Persist a successful activation so the app works offline afterward. */
  cacheActivation: (email) => {
    localStorage.setItem(LICENSE_KEYS.email, email)
    localStorage.setItem(LICENSE_KEYS.activated, 'true')
    localStorage.setItem(LICENSE_KEYS.lastVerified, new Date().toISOString())
  },

  /** Is there a cached, valid activation for offline use? */
  isActivated: () => {
    return localStorage.getItem(LICENSE_KEYS.activated) === 'true'
  },

  getActivatedEmail: () => localStorage.getItem(LICENSE_KEYS.email),

  /** Clear the cached activation (called on logout → forces online re-check). */
  clearActivation: () => {
    localStorage.removeItem(LICENSE_KEYS.activated)
    localStorage.removeItem(LICENSE_KEYS.lastVerified)
    // keep the email so the login field can be pre-filled, but require re-verify
  },
}
