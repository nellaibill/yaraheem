import { useContext } from 'react'
import { StaffAuthContext } from '@/features/staff/context/staff-auth-context'

export function useStaffAuth() {
  const context = useContext(StaffAuthContext)
  if (!context) throw new Error('useStaffAuth must be used within a StaffAuthProvider')
  return context
}
