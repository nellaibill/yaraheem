import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { adminLogin, adminLogout, getAdminSession } from '@/lib/api/adminClient'
import { AdminAuthContext, type AdminSessionUser } from '@/features/admin/context/admin-auth-context'

function toSessionUser(session: ReturnType<typeof getAdminSession>): AdminSessionUser | null {
  if (!session) return null
  return { name: `${session.user.firstName} ${session.user.lastName}`.trim(), email: session.user.email }
}

/** Admin login is real backend auth (the single seeded Admin account) — see lib/api/adminClient.ts. */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSessionUser | null>(() => toSessionUser(getAdminSession()))

  const login = useCallback(async (email: string, password: string) => {
    const success = await adminLogin(email, password)
    setAdmin(success ? toSessionUser(getAdminSession()) : null)
    return success
  }, [])

  const logout = useCallback(() => {
    adminLogout()
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
