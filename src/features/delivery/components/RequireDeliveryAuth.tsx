import { Navigate, Outlet } from 'react-router-dom'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'

export function RequireDeliveryAuth() {
  const { isAuthenticated } = useDeliveryAuth()
  if (!isAuthenticated) return <Navigate to="/delivery/login" replace />
  return <Outlet />
}
