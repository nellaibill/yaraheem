import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { readStorage, writeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { requestOtpCode, verifyOtpCode } from '@/lib/api/otpApi'
import { ApiError } from '@/lib/api/client'
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

  const requestOtp = useCallback(async (mobile: string) => {
    try {
      const result = await requestOtpCode(mobile)
      if (result.devOnlyCode) {
        // Backend only ever populates this outside Production — real deployments never see it.
        toast.success(`Dev-only OTP for ${mobile}: ${result.devOnlyCode}`, {
          description: 'No SMS provider configured on the backend — see backend/SECRETS.md.',
        })
      } else {
        toast.success('OTP sent', { description: `Sent to +91 ${mobile}` })
      }
      return result.devOnlyCode
    } catch (error) {
      toast.error('Could not send OTP', {
        description: error instanceof ApiError ? error.message : 'Something went wrong — please try again.',
      })
      return null
    }
  }, [])

  const verifyOtp = useCallback(
    async (mobile: string, code: string) => {
      let verified = false
      try {
        const result = await verifyOtpCode(mobile, code)
        verified = result.verified
      } catch (error) {
        toast.error('Could not verify OTP', {
          description: error instanceof ApiError ? error.message : 'Something went wrong — please try again.',
        })
        return false
      }

      if (!verified) return false

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
