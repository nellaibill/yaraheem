import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { DeliveryAuthContext } from '@/features/delivery/context/delivery-auth-context'

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const { partners, updateStatus } = useDeliveryPartners()
  const [activePartnerId, setActivePartnerId] = useLocalStorage<string | null>(
    STORAGE_KEYS.activePartnerId,
    null,
  )

  const login = useCallback(
    (mobile: string) => {
      const digits = mobile.replace(/\D/g, '')
      const match = partners.find((p) => p.mobile === digits)
      if (!match) return false
      setActivePartnerId(match.id)
      if (match.status === 'offline') updateStatus(match.id, 'available')
      return true
    },
    [partners, setActivePartnerId, updateStatus],
  )

  const logout = useCallback(() => {
    if (activePartnerId) updateStatus(activePartnerId, 'offline')
    setActivePartnerId(null)
  }, [activePartnerId, setActivePartnerId, updateStatus])

  const partner = activePartnerId ? (partners.find((p) => p.id === activePartnerId) ?? null) : null

  const value = useMemo(
    () => ({ partner, isAuthenticated: partner !== null, login, logout }),
    [partner, login, logout],
  )

  return <DeliveryAuthContext.Provider value={value}>{children}</DeliveryAuthContext.Provider>
}
