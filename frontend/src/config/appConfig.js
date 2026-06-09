/**
 * Application configuration.
 *
 * APP_MODE:
 *   - 'website'   → the public SaaS site (register, buy, account panel)
 *   - 'installed' → the downloaded ERP software running on a client machine
 *
 * For the website build this stays 'website'. When packaging the downloadable
 * software (jpackage), set VITE_APP_MODE=installed at build time.
 *
 * LICENSE_SERVER_URL:
 *   The public URL of the central license server the installed app phones home to
 *   on login. For now it defaults to the same origin (stub). When you host the
 *   license server separately, set VITE_LICENSE_SERVER_URL at build time.
 */

export const APP_MODE = import.meta.env.VITE_APP_MODE || 'website'

export const IS_INSTALLED_APP = APP_MODE === 'installed'

// Backend origin for the website build when hosted separately (e.g. Vercel
// frontend → Render backend). Empty string = same origin (bundled/local).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// Where the installed app verifies its license. Falls back to API_BASE_URL,
// then same origin.
export const LICENSE_SERVER_URL =
  import.meta.env.VITE_LICENSE_SERVER_URL || API_BASE_URL || ''

// localStorage keys used by the license gate
export const LICENSE_KEYS = {
  email: 'nexus_license_email',
  activated: 'nexus_license_activated',
  lastVerified: 'nexus_license_last_verified',
  // Cached credential hash enabling OFFLINE re-login on a device that was
  // already activated online. Lets the user back in without internet if they
  // logged out / cleared state while offline.
  offlineCred: 'nexus_offline_cred',
}

// How long an offline-activated device may keep working without re-verifying
// online. After this, an internet connection is required again.
export const OFFLINE_GRACE_DAYS = 14
