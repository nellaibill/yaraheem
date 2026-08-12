import { createContext } from 'react'

export interface DeliveryAuthPartner {
  id: string
  name: string
  email: string
}

export interface DeliveryAuthContextValue {
  partner: DeliveryAuthPartner | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const DeliveryAuthContext = createContext<DeliveryAuthContextValue | undefined>(undefined)
