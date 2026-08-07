import { createContext } from 'react'
import type { AuthUser } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  requestOtp: (mobile: string) => void
  verifyOtp: (mobile: string, code: string) => boolean
  updateName: (name: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
