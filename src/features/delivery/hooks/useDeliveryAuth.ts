import { useContext } from 'react'
import { DeliveryAuthContext } from '@/features/delivery/context/delivery-auth-context'

export function useDeliveryAuth() {
  const context = useContext(DeliveryAuthContext)
  if (!context) throw new Error('useDeliveryAuth must be used within a DeliveryAuthProvider')
  return context
}
