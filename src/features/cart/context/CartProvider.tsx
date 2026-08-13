import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { ensureBackendSession } from '@/lib/api/authBridge'
import { ApiError } from '@/lib/api/client'
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from '@/lib/api/cartApi'
import { fetchProducts } from '@/lib/api/catalogApi'
import type { CartDto } from '@/lib/api/types'
import { CartContext, type CartLineWithItem } from '@/features/cart/context/cart-context'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

/**
 * Cart is the live backend cart (per-user, tied to the real JWT session). Line items
 * are keyed by product slug on the frontend and product id (Guid) on the backend —
 * productIndex bridges the two, built once from the same product list useMenuData()
 * already fetches.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { items: menuItems } = useMenuData()

  const [productIndex, setProductIndex] = useState<{
    slugToId: Map<string, string>
    idToSlug: Map<string, string>
  } | null>(null)
  const [backendCart, setBackendCart] = useState<CartDto | null>(null)

  // Mutations read this (not the `backendCart` state closure) so a burst of quick
  // clicks — e.g. the quantity stepper — each act on the result of the one before
  // them instead of racing off the same stale snapshot.
  const backendCartRef = useRef<CartDto | null>(null)
  const setCart = useCallback((cart: CartDto) => {
    backendCartRef.current = cart
    setBackendCart(cart)
  }, [])

  // Serializes cart mutations so concurrent calls (double-clicks, StrictMode, etc.)
  // apply one at a time against the latest server state rather than in parallel.
  const mutationQueueRef = useRef<Promise<unknown>>(Promise.resolve())
  const enqueue = useCallback(
    (mutation: () => Promise<CartDto | null>, onError: (error: unknown) => void) => {
      const run = mutationQueueRef.current.then(async () => {
        try {
          const result = await mutation()
          if (result) setCart(result)
        } catch (error) {
          onError(error)
        }
      })
      mutationQueueRef.current = run
      return run
    },
    [setCart],
  )

  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((products) => {
        if (cancelled) return
        setProductIndex({
          slugToId: new Map(products.map((p) => [p.slug, p.id])),
          idToSlug: new Map(products.map((p) => [p.id, p.slug])),
        })
      })
      .catch((error) => console.error('Failed to load product catalog for cart.', error))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user) {
      backendCartRef.current = null
      setBackendCart(null)
      return
    }
    let cancelled = false
    ensureBackendSession(user.mobile, user.name)
      .then(() => fetchCart())
      .then((cart) => {
        if (!cancelled) setCart(cart)
      })
      .catch((error) => {
        if (!cancelled) console.error('Failed to sync cart with the backend.', error)
      })
    return () => {
      cancelled = true
    }
  }, [user, setCart])

  const addItem = useCallback(
    (itemId: string, quantity = 1) => {
      const productId = productIndex?.slugToId.get(itemId)
      if (!productId) {
        toast.error('Still connecting to the menu — try again in a moment.')
        return Promise.resolve()
      }
      return enqueue(
        () => addCartItem({ productId, quantity }),
        (error) => toast.error('Could not add item to cart', { description: errorMessage(error) }),
      )
    },
    [productIndex, enqueue],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      const productId = productIndex?.slugToId.get(itemId)
      if (!productId) return Promise.resolve()
      return enqueue(
        () => {
          const existing = backendCartRef.current?.items.find((i) => i.productId === productId)
          return existing ? removeCartItem(existing.id) : Promise.resolve(null)
        },
        (error) => toast.error('Could not remove item', { description: errorMessage(error) }),
      )
    },
    [productIndex, enqueue],
  )

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const productId = productIndex?.slugToId.get(itemId)
      if (!productId) return Promise.resolve()
      return enqueue(
        () => {
          const existing = backendCartRef.current?.items.find((i) => i.productId === productId)
          if (quantity <= 0) {
            return existing ? removeCartItem(existing.id) : Promise.resolve(null)
          }
          return existing ? updateCartItem(existing.id, { quantity }) : addCartItem({ productId, quantity })
        },
        (error) => toast.error('Could not update cart', { description: errorMessage(error) }),
      )
    },
    [productIndex, enqueue],
  )

  const clear = useCallback(
    () => enqueue(() => clearCart(), (error) => toast.error('Could not clear cart', { description: errorMessage(error) })),
    [enqueue],
  )

  const enrichedLines = useMemo<CartLineWithItem[]>(() => {
    if (!backendCart || !productIndex) return []
    return backendCart.items
      .map((cartItem) => {
        const slug = productIndex.idToSlug.get(cartItem.productId)
        const item = menuItems.find((menuItem) => menuItem.id === slug)
        if (!slug || !item) return null
        return { itemId: slug, quantity: cartItem.quantity, item, lineTotal: cartItem.lineTotal }
      })
      .filter((line): line is CartLineWithItem => line !== null)
  }, [backendCart, productIndex, menuItems])

  const totalItems = backendCart?.totalItems ?? 0
  const totalPrice = backendCart?.subtotal ?? 0
  const deliveryFee = backendCart?.deliveryFee ?? 0
  const grandTotal = backendCart?.total ?? 0

  const value = useMemo(
    () => ({ lines: enrichedLines, totalItems, totalPrice, deliveryFee, grandTotal, addItem, removeItem, setQuantity, clear }),
    [enrichedLines, totalItems, totalPrice, deliveryFee, grandTotal, addItem, removeItem, setQuantity, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
