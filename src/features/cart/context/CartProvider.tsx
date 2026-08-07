import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readStorage, writeStorage, scopedKey } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { menuItems } from '@/features/menu/data/menuData'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { CartLine } from '@/types'
import { CartContext, type CartLineWithItem } from '@/features/cart/context/cart-context'

/**
 * Cart is namespaced per mobile number so each logged-in user gets an
 * independent bag. Persistence is done explicitly at each mutation site
 * (rather than via a blanket write-on-change effect) so switching users
 * can't race and clobber the next user's freshly-loaded cart.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const storageKey = scopedKey(STORAGE_KEYS.cart, user?.mobile ?? 'guest')

  const [lines, setLines] = useState<CartLine[]>(() => readStorage(storageKey, []))

  useEffect(() => {
    setLines(readStorage(storageKey, []))
  }, [storageKey])

  const persist = useCallback(
    (next: CartLine[]) => {
      setLines(next)
      writeStorage(storageKey, next)
    },
    [storageKey],
  )

  const addItem = useCallback(
    (itemId: string, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((line) => line.itemId === itemId)
        const next = existing
          ? prev.map((line) =>
              line.itemId === itemId ? { ...line, quantity: line.quantity + quantity } : line,
            )
          : [...prev, { itemId, quantity }]
        writeStorage(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      setLines((prev) => {
        const next = prev.filter((line) => line.itemId !== itemId)
        writeStorage(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setLines((prev) => {
        const next =
          quantity <= 0
            ? prev.filter((line) => line.itemId !== itemId)
            : prev.map((line) => (line.itemId === itemId ? { ...line, quantity } : line))
        writeStorage(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  const clear = useCallback(() => persist([]), [persist])

  const enrichedLines = useMemo<CartLineWithItem[]>(() => {
    return lines
      .map((line) => {
        const item = menuItems.find((menuItem) => menuItem.id === line.itemId)
        if (!item) return null
        return { ...line, item, lineTotal: item.price * line.quantity }
      })
      .filter((line): line is CartLineWithItem => line !== null)
  }, [lines])

  const totalItems = enrichedLines.reduce((sum, line) => sum + line.quantity, 0)
  const totalPrice = enrichedLines.reduce((sum, line) => sum + line.lineTotal, 0)

  const value = useMemo(
    () => ({ lines: enrichedLines, totalItems, totalPrice, addItem, removeItem, setQuantity, clear }),
    [enrichedLines, totalItems, totalPrice, addItem, removeItem, setQuantity, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
