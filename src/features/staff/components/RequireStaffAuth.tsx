import { Navigate, Outlet } from 'react-router-dom'
import { useStaffAuth } from '@/features/staff/hooks/useStaffAuth'

export function RequireStaffAuth() {
  const { isAuthenticated } = useStaffAuth()
  if (!isAuthenticated) return <Navigate to="/staff/login" replace />
  return <Outlet />
}
