import type { MenuItem, Order, OrderStatus } from '@/types'

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

export function getTodayOrders(orders: Order[]): Order[] {
  const today = new Date()
  return orders.filter((o) => isSameDay(new Date(o.createdAt), today))
}

export function getTodayRevenue(orders: Order[]): number {
  return getTodayOrders(orders).reduce((sum, o) => sum + o.total, 0)
}

export function getAverageOrderValue(orders: Order[]): number {
  if (orders.length === 0) return 0
  return Math.round(orders.reduce((sum, o) => sum + o.total, 0) / orders.length)
}

export interface DayRevenue {
  label: string
  date: string
  revenue: number
  orderCount: number
}

export function getRevenueByDay(orders: Order[], days = 7): DayRevenue[] {
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

export function getTopSellingItems(orders: Order[], limit = 5): TopSellingItem[] {
  const map = new Map<string, TopSellingItem>()
  for (const order of orders) {
    for (const line of order.lines) {
      const existing = map.get(line.itemId)
      if (existing) {
        existing.quantitySold += line.quantity
        existing.revenue += line.price * line.quantity
      } else {
        map.set(line.itemId, {
          itemId: line.itemId,
          name: line.name,
          quantitySold: line.quantity,
          revenue: line.price * line.quantity,
        })
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit)
}

export function getPaymentMethodBreakdown(orders: Order[]) {
  const counts = { cash: 0, upi: 0, card: 0 }
  for (const order of orders) counts[order.paymentMethod]++
  return counts
}

export function getStatusBreakdown(orders: Order[]) {
  const counts: Record<string, number> = {}
  for (const order of orders) counts[order.status] = (counts[order.status] ?? 0) + 1
  return counts
}

const PENDING_STATUSES: OrderStatus[] = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'out_for_delivery']

export function getOrderCountByStatus(orders: Order[], statuses: OrderStatus[]): number {
  return orders.filter((o) => statuses.includes(o.status)).length
}

export function getPendingOrdersCount(orders: Order[]): number {
  return getOrderCountByStatus(orders, PENDING_STATUSES)
}

export function getCompletedOrdersCount(orders: Order[]): number {
  return getOrderCountByStatus(orders, ['delivered'])
}

export function getCancelledOrdersCount(orders: Order[]): number {
  return getOrderCountByStatus(orders, ['cancelled'])
}

/** Kitchen-facing view: orders actively being cooked right now. */
export function getKitchenQueue(orders: Order[]): Order[] {
  return orders.filter((o) => o.status === 'accepted' || o.status === 'preparing')
}

export function getPopularCombos(orders: Order[], menuItems: MenuItem[], limit = 4): TopSellingItem[] {
  const comboIds = new Set(menuItems.filter((item) => item.category === 'combos').map((item) => item.id))
  return getTopSellingItems(orders, Number.MAX_SAFE_INTEGER)
    .filter((item) => comboIds.has(item.itemId))
    .slice(0, limit)
}
