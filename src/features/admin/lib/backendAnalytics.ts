import type { MenuItem } from '@/types'
import type { BackendOrderStatus, OrderDto } from '@/lib/api/types'

/**
 * Same shape/behavior as features/admin/lib/analytics.ts, ported to operate on real
 * OrderDto[] from the backend instead of the local order mirror. Aggregation stays
 * client-side (same pattern AdminOrdersPage already uses) rather than adding dedicated
 * backend report endpoints — order volume at this scale doesn't need one, and this keeps
 * every existing chart/list component reusable with just a data-source swap.
 */

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

export function getTodayOrders(orders: OrderDto[]): OrderDto[] {
  const today = new Date()
  return orders.filter((o) => isSameDay(new Date(o.createdAt), today))
}

export function getTodayRevenue(orders: OrderDto[]): number {
  return getTodayOrders(orders).reduce((sum, o) => sum + o.total, 0)
}

export function getAverageOrderValue(orders: OrderDto[]): number {
  if (orders.length === 0) return 0
  return Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)
}

export interface DayRevenue {
  label: string
  date: string
  revenue: number
  orderCount: number
}

export function getRevenueByDay(orders: OrderDto[], days = 7): DayRevenue[] {
  const buckets: DayRevenue[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayOrders = orders.filter((o) => isSameDay(new Date(o.createdAt), date))
    buckets.push({
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: date.toISOString(),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orderCount: dayOrders.length,
    })
  }
  return buckets
}

export interface TopSellingItem {
  itemId: string
  name: string
  quantitySold: number
  revenue: number
}

export function getTopSellingItems(orders: OrderDto[], limit = 5): TopSellingItem[] {
  const map = new Map<string, TopSellingItem>()
  for (const order of orders) {
    for (const item of order.items) {
      const existing = map.get(item.productId)
      if (existing) {
        existing.quantitySold += item.quantity
        existing.revenue += item.lineTotal
      } else {
        map.set(item.productId, {
          itemId: item.productId,
          name: item.productName,
          quantitySold: item.quantity,
          revenue: item.lineTotal,
        })
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit)
}

const PAYMENT_METHOD_KEYS = ['COD', 'ONLINE'] as const

export function getPaymentMethodBreakdown(orders: OrderDto[]): Record<string, number> {
  const counts: Record<string, number> = { COD: 0, ONLINE: 0 }
  for (const order of orders) {
    const key = order.paymentMethod && PAYMENT_METHOD_KEYS.includes(order.paymentMethod as (typeof PAYMENT_METHOD_KEYS)[number])
      ? order.paymentMethod
      : undefined
    if (key) counts[key]++
  }
  return counts
}

export function getStatusBreakdown(orders: OrderDto[]): Record<BackendOrderStatus, number> {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<BackendOrderStatus, number>
  for (const order of orders) counts[order.status]++
  return counts
}

const PENDING_STATUSES: BackendOrderStatus[] = [1, 2, 3, 4]

export function getOrderCountByStatus(orders: OrderDto[], statuses: BackendOrderStatus[]): number {
  return orders.filter((o) => statuses.includes(o.status)).length
}

export function getPendingOrdersCount(orders: OrderDto[]): number {
  return getOrderCountByStatus(orders, PENDING_STATUSES)
}

export function getCompletedOrdersCount(orders: OrderDto[]): number {
  return getOrderCountByStatus(orders, [5])
}

export function getCancelledOrdersCount(orders: OrderDto[]): number {
  return getOrderCountByStatus(orders, [6])
}

/** Kitchen-facing view: orders confirmed or already being prepared. */
export function getKitchenQueue(orders: OrderDto[]): OrderDto[] {
  return orders.filter((o) => o.status === 2 || o.status === 3)
}

export function getPopularCombos(orders: OrderDto[], menuItems: MenuItem[], limit = 4): TopSellingItem[] {
  // Order items are keyed by the backend product id (a Guid); menu items are keyed by slug.
  // There's no shared id to join on here, so match by product name instead.
  const comboNames = new Set(menuItems.filter((item) => item.category === 'combos').map((item) => item.name))
  return getTopSellingItems(orders, Number.MAX_SAFE_INTEGER)
    .filter((item) => comboNames.has(item.name))
    .slice(0, limit)
}

/** Most recent status change per order, for a simple activity feed. */
export function getLastUpdatedAt(order: OrderDto): string {
  const last = [...order.statusHistory].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())[0]
  return last?.changedAt ?? order.createdAt
}
