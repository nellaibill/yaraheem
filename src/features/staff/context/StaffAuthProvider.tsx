import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { staffLogin, staffLogout, getStaffSession, type StoredStaffSession } from '@/lib/api/staffClient'
import { StaffAuthContext, type StaffAuthUser } from '@/features/staff/context/staff-auth-context'

function sessionToStaff(session: StoredStaffSession | null): StaffAuthUser | null {
  if (!session) return null
  return {
    id: session.user.id,
    name: `${session.user.firstName} ${session.user.lastName}`.trim(),
    email: session.user.email,
    roles: session.user.roles,
  }
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffAuthUser | null>(() => sessionToStaff(getStaffSession()))

  const login = useCallback(async (email: string, password: string) => {
    const success = await staffLogin(email, password)
    if (success) setStaff(sessionToStaff(getStaffSession()))
    return success
  }, [])

  const logout = useCallback(() => {
    staffLogout()
    setStaff(null)
  }, [])

  const value = useMemo(() => ({ staff, isAuthenticated: staff !== null, login, logout }), [staff, login, logout])

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
}
