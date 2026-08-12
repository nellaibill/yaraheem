import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { deliveryLogin, deliveryLogout, getDeliverySession, type StoredDeliverySession } from '@/lib/api/deliveryClient'
import { DeliveryAuthContext, type DeliveryAuthPartner } from '@/features/delivery/context/delivery-auth-context'

function sessionToPartner(session: StoredDeliverySession | null): DeliveryAuthPartner | null {
  if (!session) return null
  return {
    id: session.user.id,
    name: `${session.user.firstName} ${session.user.lastName}`.trim(),
    email: session.user.email,
  }
}

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<DeliveryAuthPartner | null>(() => sessionToPartner(getDeliverySession()))

  const login = useCallback(async (email: string, password: string) => {
    const success = await deliveryLogin(email, password)
    if (success) setPartner(sessionToPartner(getDeliverySession()))
    return success
  }, [])

  const logout = useCallback(() => {
    deliveryLogout()
    setPartner(null)
  }, [])

  const value = useMemo(() => ({ partner, isAuthenticated: partner !== null, login, logout }), [partner, login, logout])

  return <DeliveryAuthContext.Provider value={value}>{children}</DeliveryAuthContext.Provider>
}
