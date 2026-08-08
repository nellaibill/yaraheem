import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth'

export function RequireAdminAuth() {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
