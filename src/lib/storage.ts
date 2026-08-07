/**
 * Thin wrapper around localStorage — centralizes JSON parsing and guards
 * against storage being unavailable (private browsing, SSR, etc.).
 */
const isBrowser = typeof window !== 'undefined'

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or blocked — fail silently, POC has no persistence guarantees
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

/**
 * Namespaces a storage key by mobile number so each logged-in user gets an
 * independent cart / order history / address book / favorites list.
 */
export function scopedKey(base: string, mobile: string): string {
  return `${base}:${mobile}`
}
