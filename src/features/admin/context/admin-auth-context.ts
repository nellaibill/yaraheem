import { createContext } from 'react'
import type { AdminUser } from '@/types'

export interface AdminAuthContextValue {
  admin: AdminUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)
