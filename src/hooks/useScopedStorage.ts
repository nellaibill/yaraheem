import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage, scopedKey } from '@/lib/storage'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Like useLocalStorage, but namespaced per logged-in mobile number so each
 * user gets independent data (orders, addresses, favorites, ...). Reloads
 * from storage whenever the active user changes, and persists synchronously
 * at the point of mutation to avoid racing a stale write against a fresh
 * user's just-loaded state.
 */
export function useScopedStorage<T>(baseKey: string, initialValue: T) {
  const { user } = useAuth()
  const storageKey = scopedKey(baseKey, user?.mobile ?? 'guest')

  const [value, setValue] = useState<T>(() => readStorage(storageKey, initialValue))

  useEffect(() => {
    setValue(readStorage(storageKey, initialValue))
    // storageKey change is what should trigger a reload; initialValue is a fallback, not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
        writeStorage(storageKey, resolved)
        return resolved
      })
    },
    [storageKey],
  )

  return [value, update] as const
}
