import { useCallback } from 'react'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { STORAGE_KEYS, ORDER_STATUS_SEQUENCE } from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'

export function useOrders() {
  const [orders, setOrders] = useScopedStorage<Order[]>(STORAGE_KEYS.orders, [])

  const placeOrder = useCallback(
    (order: Order) => {
      setOrders((prev) => [order, ...prev])
    },
    [setOrders],
  )

  const advanceStatus = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order
          const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status)
          const nextStatus = ORDER_STATUS_SEQUENCE[currentIndex + 1] as OrderStatus | undefined
          if (!nextStatus) return order
          return { ...order, status: nextStatus, statusUpdatedAt: new Date().toISOString() }
        }),
      )
    },
    [setOrders],
  )

  const setStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status, statusUpdatedAt: new Date().toISOString() } : order,
        ),
      )
    },
    [setOrders],
  )

  const getOrder = useCallback((orderId: string) => orders.find((o) => o.id === orderId), [orders])

  return { orders, placeOrder, advanceStatus, setStatus, getOrder }
}
