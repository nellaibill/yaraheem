import { readAllScoped, readStorage, writeStorage } from '@/lib/storage'
import { STORAGE_KEYS, ORDER_STATUS_SEQUENCE, SERVICE_AREA } from '@/lib/constants'
import { getMenuItems } from '@/features/menu/lib/menuStore'
import type { Address, AuthUser, Order, OrderStatus } from '@/types'

export function getAllOrders(): Order[] {
  return readAllScoped<Order[]>(STORAGE_KEYS.orders)
    .flatMap((entry) => entry.value)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getOrderById(orderId: string): Order | undefined {
  return getAllOrders().find((o) => o.id === orderId)
}

export function getAllUsers(): AuthUser[] {
  const users = readStorage<Record<string, AuthUser>>(STORAGE_KEYS.authUsers, {})
  return Object.values(users)
}

export interface CustomerSummary extends AuthUser {
  orderCount: number
  totalSpent: number
  lastOrderAt: string | null
}

export function getCustomerSummaries(): CustomerSummary[] {
  const users = getAllUsers()
  const orders = getAllOrders()

  return users
    .map((user) => {
      const userOrders = orders.filter((o) => o.mobile === user.mobile)
      return {
        ...user,
        orderCount: userOrders.length,
        totalSpent: userOrders.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: userOrders[0]?.createdAt ?? null,
      }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

export function updateOrderStatusGlobal(mobile: string, orderId: string, status: OrderStatus) {
  const key = `${STORAGE_KEYS.orders}:${mobile}`
  const orders = readStorage<Order[]>(key, [])
  const next = orders.map((o) =>
    o.id === orderId ? { ...o, status, statusUpdatedAt: new Date().toISOString() } : o,
  )
  writeStorage(key, next)
}

export function assignDeliveryPartnerGlobal(mobile: string, orderId: string, partnerId: string | undefined) {
  const key = `${STORAGE_KEYS.orders}:${mobile}`
  const orders = readStorage<Order[]>(key, [])
  const next = orders.map((o) => (o.id === orderId ? { ...o, deliveryPartnerId: partnerId } : o))
  writeStorage(key, next)
}

const SEED_NAMES = [
  'Ayesha Khan',
  'Rahul Varma',
  'Farhana Sultana',
  'Vikram Reddy',
  'Sana Mirza',
  'Arjun Nair',
  'Priya Deshmukh',
  'Mohammed Irfan',
  'Lakshmi Iyer',
  'Kiran Rao',
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomSeedAddress(): Address {
  // Random offset up to ~18km from the service center — mostly inside the 15km radius, occasionally just outside.
  const offsetLat = (Math.random() - 0.5) * 0.32
  const offsetLng = (Math.random() - 0.5) * 0.32
  return {
    id: crypto.randomUUID(),
    label: 'Home',
    line1: `${randomInt(1, 300)}, Road No. ${randomInt(1, 20)}`,
    line2: 'Near Bus Stand',
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    pincode: `6270${randomInt(10, 99)}`,
    lat: SERVICE_AREA.centerLat + offsetLat,
    lng: SERVICE_AREA.centerLng + offsetLng,
  }
}

function buildSeedOrder(mobile: string, daysAgo: number): Order {
  const itemCount = randomInt(1, 3)
  const shuffled = [...getMenuItems()].sort(() => Math.random() - 0.5).slice(0, itemCount)
  const lines = shuffled.map((item) => ({
    itemId: item.id,
    name: item.name,
    price: item.price,
    quantity: randomInt(1, 2),
  }))
  const itemsTotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const deliveryFee = itemsTotal >= 799 ? 0 : 40
  const createdAt = new Date(Date.now() - daysAgo * 86400000 - randomInt(0, 20000000)).toISOString()
  const isHistorical = daysAgo > 0
  const status: OrderStatus = isHistorical
    ? 'delivered'
    : ORDER_STATUS_SEQUENCE[randomInt(0, ORDER_STATUS_SEQUENCE.length - 1)]

  return {
    id: crypto.randomUUID(),
    mobile,
    lines,
    itemsTotal,
    discount: 0,
    deliveryFee,
    total: itemsTotal + deliveryFee,
    address: randomSeedAddress(),
    paymentMethod: (['cash', 'upi', 'card'] as const)[randomInt(0, 2)],
    status,
    statusUpdatedAt: createdAt,
    createdAt,
    estimatedDeliveryMinutes: 35,
  }
}

/** Seeds realistic demo customers + order history once, so the admin dashboard isn't empty. */
export function seedDemoDataIfNeeded() {
  if (readStorage(STORAGE_KEYS.adminSeeded, false)) return

  const users = readStorage<Record<string, AuthUser>>(STORAGE_KEYS.authUsers, {})

  SEED_NAMES.forEach((name, index) => {
    const mobile = `90000000${String(index + 10).padStart(2, '0')}`
    if (users[mobile]) return

    const joinedDaysAgo = randomInt(10, 120)
    const createdAt = new Date(Date.now() - joinedDaysAgo * 86400000).toISOString()
    users[mobile] = { mobile, name, createdAt, lastLoginAt: createdAt }

    const orderCount = randomInt(2, 6)
    const orders: Order[] = []
    for (let i = 0; i < orderCount; i++) {
      const daysAgo = i === 0 && index < 3 ? 0 : randomInt(1, 13)
      orders.push(buildSeedOrder(mobile, daysAgo))
    }
    writeStorage(`${STORAGE_KEYS.orders}:${mobile}`, orders)
  })

  writeStorage(STORAGE_KEYS.authUsers, users)
  writeStorage(STORAGE_KEYS.adminSeeded, true)
}
