import { createContext } from 'react'
import type { CartLine, MenuItem } from '@/types'

export interface CartLineWithItem extends CartLine {
  item: MenuItem
  lineTotal: number
}

export interface CartContextValue {
  lines: CartLineWithItem[]
  totalItems: number
  totalPrice: number
  addItem: (itemId: string, quantity?: number) => void
  removeItem: (itemId: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
