import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import { defaultAdminUsers } from '@/features/admin/data/adminUsers'
import { AdminAuthContext } from '@/features/admin/context/admin-auth-context'
import type { AdminUser } from '@/types'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [users] = useLocalStorage<AdminUser[]>(STORAGE_KEYS.adminUsers, defaultAdminUsers)
  const [sessionUsername, setSessionUsername] = useLocalStorage<string | null>(
    STORAGE_KEYS.adminSession,
    null,
  )

  const login = useCallback(
    (username: string, password: string) => {
      const match = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
      )
      if (!match) return false
      setSessionUsername(match.username)
      return true
    },
    [users, setSessionUsername],
  )

  const logout = useCallback(() => setSessionUsername(null), [setSessionUsername])

  const admin = sessionUsername ? (users.find((u) => u.username === sessionUsername) ?? null) : null

  const value = useMemo(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
