import { createContext } from 'react'

export interface StaffAuthUser {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface StaffAuthContextValue {
  staff: StaffAuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined)
