import { createContext } from 'react'
import type { AuthUser } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** Resolves with a dev-only OTP value (non-null only outside production builds) so the UI can surface it for local testing. */
  requestOtp: (mobile: string) => Promise<string | null>
  verifyOtp: (mobile: string, code: string) => Promise<boolean>
  updateName: (name: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
