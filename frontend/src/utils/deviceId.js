/**
 * Returns a stable, per-device identifier. Generated once and persisted in
 * localStorage so the same browser/installed-app instance keeps the same ID.
 * Used for single-device session enforcement.
 */
const DEVICE_ID_KEY = 'nexus_device_id'

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

function generateId() {
  // Prefer the native UUID generator; fall back to a random string.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'dev-' + crypto.randomUUID()
  }
  return 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

/**
 * A human-friendly label for this device (OS/browser), shown to the admin in
 * the sessions view. Best-effort parse of the user agent.
 */
export function getDeviceLabel() {
  try {
    const ua = navigator.userAgent || ''
    let os = 'Unknown OS'
    if (/Windows/i.test(ua)) os = 'Windows'
    else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS'
    else if (/Linux/i.test(ua)) os = 'Linux'
    else if (/Android/i.test(ua)) os = 'Android'
    else if (/iPhone|iPad/i.test(ua)) os = 'iOS'

    let browser = 'Browser'
    if (/Edg\//i.test(ua)) browser = 'Edge'
    else if (/Chrome\//i.test(ua)) browser = 'Chrome'
    else if (/Firefox\//i.test(ua)) browser = 'Firefox'
    else if (/Safari\//i.test(ua)) browser = 'Safari'

    return `${os} · ${browser}`
  } catch {
    return 'Unknown device'
  }
}
