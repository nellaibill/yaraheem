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

/**
 * Reads every localStorage entry namespaced under `${baseKey}:*` — used by
 * the admin dashboard to aggregate per-customer data (e.g. orders) across
 * every mobile number without a real backend to query.
 */
export function readAllScoped<T>(baseKey: string): Array<{ scope: string; value: T }> {
  if (!isBrowser) return []
  const prefix = `${baseKey}:`
  const results: Array<{ scope: string; value: T }> = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key || !key.startsWith(prefix)) continue
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      results.push({ scope: key.slice(prefix.length), value: JSON.parse(raw) as T })
    } catch {
      // skip malformed entries
    }
  }
  return results
}
