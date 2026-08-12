import { createContext } from 'react'

export interface AdminSessionUser {
  name: string
  email: string
}

export interface AdminAuthContextValue {
  admin: AdminSessionUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)
