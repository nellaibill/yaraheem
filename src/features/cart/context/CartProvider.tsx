import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import { menuItems } from '@/features/menu/data/menuData'
import type { CartLine } from '@/types'
import { CartContext, type CartLineWithItem } from '@/features/cart/context/cart-context'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useLocalStorage<CartLine[]>(STORAGE_KEYS.cart, [])

  const addItem = useCallback(
    (itemId: string, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((line) => line.itemId === itemId)
        if (existing) {
          return prev.map((line) =>
            line.itemId === itemId ? { ...line, quantity: line.quantity + quantity } : line,
          )
        }
        return [...prev, { itemId, quantity }]
      })
    },
    [setLines],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      setLines((prev) => prev.filter((line) => line.itemId !== itemId))
    },
    [setLines],
  )

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        setLines((prev) => prev.filter((line) => line.itemId !== itemId))
        return
      }
      setLines((prev) => prev.map((line) => (line.itemId === itemId ? { ...line, quantity } : line)))
    },
    [setLines],
  )

  const clear = useCallback(() => setLines([]), [setLines])

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
