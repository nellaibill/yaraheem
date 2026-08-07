import { readStorage, writeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { getAllOrders, getAllUsers } from '@/features/admin/lib/adminStore'
import type { Order, OrderStatus } from '@/types'

/** Orders ready for pickup that no partner has claimed yet. */
export function getAvailableOrders(): Order[] {
  return getAllOrders().filter((o) => o.status === 'ready' && !o.deliveryPartnerId)
}

/** Orders currently assigned to this partner and not yet delivered. */
export function getAssignedOrders(partnerId: string): Order[] {
  return getAllOrders().filter((o) => o.deliveryPartnerId === partnerId && o.status !== 'delivered')
}

/** This partner's completed deliveries, most recent first. */
export function getCompletedOrders(partnerId: string): Order[] {
  return getAllOrders().filter((o) => o.deliveryPartnerId === partnerId && o.status === 'delivered')
}

export function getCustomerName(mobile: string): string {
  return getAllUsers().find((u) => u.mobile === mobile)?.name ?? `Guest ${mobile.slice(-4)}`
}

export function acceptOrder(order: Order, partnerId: string) {
  const key = `${STORAGE_KEYS.orders}:${order.mobile}`
  const orders = readStorage<Order[]>(key, [])
  const next = orders.map((o) => (o.id === order.id ? { ...o, deliveryPartnerId: partnerId } : o))
  writeStorage(key, next)
}

export function updateDeliveryOrderStatus(order: Order, status: OrderStatus) {
  const key = `${STORAGE_KEYS.orders}:${order.mobile}`
  const orders = readStorage<Order[]>(key, [])
  const next = orders.map((o) =>
    o.id === order.id ? { ...o, status, statusUpdatedAt: new Date().toISOString() } : o,
  )
  writeStorage(key, next)
}
