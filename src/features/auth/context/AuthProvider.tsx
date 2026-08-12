import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { readStorage, writeStorage } from '@/lib/storage'
import { MOCK_OTP, STORAGE_KEYS } from '@/lib/constants'
import type { AuthUser } from '@/types'
import { AuthContext } from '@/features/auth/context/auth-context'

type UserDirectory = Record<string, AuthUser>

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserDirectory>(() => readStorage(STORAGE_KEYS.authUsers, {}))
  const [activeMobile, setActiveMobile] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE_KEYS.authActiveMobile, null),
  )

  const persistUsers = useCallback((next: UserDirectory) => {
    setUsers(next)
    writeStorage(STORAGE_KEYS.authUsers, next)
  }, [])

  const persistActiveMobile = useCallback((mobile: string | null) => {
    setActiveMobile(mobile)
    writeStorage(STORAGE_KEYS.authActiveMobile, mobile)
  }, [])

  const requestOtp = useCallback((mobile: string) => {
    // Never display the OTP value outside a dev build — this is a mock flow (no SMS is
    // actually sent), but the code itself must not be disclosed in anything resembling
    // a production build.
    if (import.meta.env.DEV) {
      toast.success(`Demo OTP for ${mobile}: ${MOCK_OTP}`, {
        description: 'This is a mock flow — no SMS is actually sent.',
      })
    } else {
      toast.success('OTP sent', { description: `Sent to +91 ${mobile}` })
    }
  }, [])

  const verifyOtp = useCallback(
    (mobile: string, code: string) => {
      if (code !== MOCK_OTP) return false

      const now = new Date().toISOString()
      const existing = users[mobile]
      const nextUser: AuthUser = existing
        ? { ...existing, lastLoginAt: now }
        : {
            mobile,
            name: `Guest ${mobile.slice(-4)}`,
            createdAt: now,
            lastLoginAt: now,
          }

      persistUsers({ ...users, [mobile]: nextUser })
      persistActiveMobile(mobile)
      return true
    },
    [users, persistUsers, persistActiveMobile],
  )

  const updateName = useCallback(
    (name: string) => {
      if (!activeMobile) return
      const existing = users[activeMobile]
      if (!existing) return
      persistUsers({ ...users, [activeMobile]: { ...existing, name } })
    },
    [activeMobile, users, persistUsers],
  )

  const logout = useCallback(() => {
    persistActiveMobile(null)
  }, [persistActiveMobile])

  const user = activeMobile ? (users[activeMobile] ?? null) : null

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      requestOtp,
      verifyOtp,
      updateName,
      logout,
    }),
    [user, requestOtp, verifyOtp, updateName, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
