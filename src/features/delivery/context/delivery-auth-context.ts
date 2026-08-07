import { createContext } from 'react'
import type { DeliveryPartner } from '@/types'

export interface DeliveryAuthContextValue {
  partner: DeliveryPartner | null
  isAuthenticated: boolean
  login: (mobile: string) => boolean
  logout: () => void
}

export const DeliveryAuthContext = createContext<DeliveryAuthContextValue | undefined>(undefined)
