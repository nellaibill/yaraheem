import { findDemoProduct } from '@/mocks/fixtures/catalog'
import { DemoError } from '@/mocks/errors'
import { getCart, clearCart } from '@/mocks/store/cart'
import type {
  AddressDto,
  BackendOrderStatus,
  CheckoutRequest,
  CheckoutResponse,
  OrderDto,
  OrderItemDto,
  OrderStatusHistoryDto,
  OrderTrackingResponse,
  PagedResult,
} from '@/lib/api/types'

let idCounter = 1
function genId(): string {
  return `order-${idCounter++}`
}

const orders: OrderDto[] = []

function seedAddress(fullName: string): AddressDto {
  return {
    fullName,
    phoneNumber: '9999999999',
    addressLine1: '1 MG Road',
    addressLine2: null,
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    country: 'India',
  }
}

function seedItem(productId: string, quantity = 1): OrderItemDto {
  const product = findDemoProduct(productId)
  if (!product) throw new Error(`Demo seed referenced unknown product "${productId}"`)
  return {
    id: `${productId}-item`,
    productId: product.id,
    productVariantId: null,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    lineTotal: product.price * quantity,
  }
}

function seedOrders() {
  const now = Date.now()
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString()
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '')

  const specs: {
    number: string
    userId: string
    name: string
    product: string
    status: BackendOrderStatus
    minutesAgo: number
  }[] = [
    {
      number: '0001',
      userId: 'user-customer1',
      name: 'Demo Customer1',
      product: 'mandi-biryani',
      status: 1,
      minutesAgo: 20,
    },
    {
      number: '0002',
      userId: 'user-customer2',
      name: 'Demo Customer2',
      product: 'chicken-65',
      status: 2,
      minutesAgo: 40,
    },
    {
      number: '0003',
      userId: 'user-customer1',
      name: 'Demo Customer1',
      product: 'pepper-chicken',
      status: 3,
      minutesAgo: 60,
    },
    {
      number: '0004',
      userId: 'user-customer2',
      name: 'Demo Customer2',
      product: 'chicken-fried-rice',
      status: 4,
      minutesAgo: 90,
    },
    {
      number: '0005',
      userId: 'user-customer1',
      name: 'Demo Customer1',
      product: 'grill-chicken',
      status: 5,
      minutesAgo: 120,
    },
    {
      number: '0006',
      userId: 'user-customer2',
      name: 'Demo Customer2',
      product: 'chicken-burger',
      status: 6,
      minutesAgo: 30,
    },
  ]

  const progression: BackendOrderStatus[] = [2, 3, 4, 5]

  for (const spec of specs) {
    const item = seedItem(spec.product)
    const deliveryFee = 40
    const total = item.lineTotal + deliveryFee

    const history: OrderStatusHistoryDto[] = [
      {
        previousStatus: null,
        newStatus: 1,
        notes: 'Order placed',
        changedAt: iso(spec.minutesAgo),
      },
    ]
    let previous: BackendOrderStatus = 1
    if (spec.status === 6) {
      history.push({
        previousStatus: 1,
        newStatus: 6,
        notes: 'Cancelled',
        changedAt: iso(spec.minutesAgo - 5),
      })
    } else {
      for (const step of progression) {
        if (step > spec.status) break
        history.push({
          previousStatus: previous,
          newStatus: step,
          notes: `Moved to ${step}`,
          changedAt: iso(spec.minutesAgo - progression.indexOf(step) * 5 - 5),
        })
        previous = step
      }
    }

    orders.push({
      id: genId(),
      orderNumber: `ORD-${datePrefix}-${spec.number}`,
      userId: spec.userId,
      status: spec.status,
      subtotal: item.lineTotal,
      deliveryFee,
      discountAmount: 0,
      couponCode: null,
      total,
      shippingAddress: seedAddress(spec.name),
      items: [item],
      statusHistory: history,
      createdAt: iso(spec.minutesAgo),
      paymentMethod: 'COD',
    })
  }
}

seedOrders()

export function checkout(userId: string, request: CheckoutRequest): CheckoutResponse {
  const cart = getCart(userId)
  if (cart.items.length === 0) throw new DemoError(409, 'Your cart is empty.')

  const orderNumber = `ORD-DEMO-${Date.now()}`
  const now = new Date().toISOString()
  const items: OrderItemDto[] = cart.items.map((i) => ({
    id: i.id,
    productId: i.productId,
    productVariantId: i.productVariantId,
    productName: i.productName,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    lineTotal: i.lineTotal,
  }))

  const order: OrderDto = {
    id: genId(),
    orderNumber,
    userId,
    status: 2,
    subtotal: cart.subtotal,
    deliveryFee: cart.deliveryFee,
    discountAmount: 0,
    couponCode: request.couponCode ?? null,
    total: cart.total,
    shippingAddress: {
      fullName: request.shippingAddress.fullName,
      phoneNumber: request.shippingAddress.phoneNumber,
      addressLine1: request.shippingAddress.addressLine1,
      addressLine2: request.shippingAddress.addressLine2 ?? null,
      city: request.shippingAddress.city,
      state: request.shippingAddress.state,
      postalCode: request.shippingAddress.postalCode,
      country: request.shippingAddress.country,
    },
    items,
    statusHistory: [
      { previousStatus: null, newStatus: 1, notes: 'Order placed', changedAt: now },
      { previousStatus: 1, newStatus: 2, notes: 'Payment confirmed', changedAt: now },
    ],
    createdAt: now,
    paymentMethod: request.paymentMethod,
  }
  orders.push(order)
  clearCart(userId)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus: 'Paid',
    transactionReference: `DEMO-${orderNumber}`,
    razorpayKeyId: null,
  }
}

export function getMyOrders(userId: string, page: number, pageSize: number): PagedResult<OrderDto> {
  const mine = orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(mine, page, pageSize)
}

export function getAdminOrders(page: number, pageSize: number): PagedResult<OrderDto> {
  const all = orders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(all, page, pageSize)
}

function paginate(items: OrderDto[], page: number, pageSize: number): PagedResult<OrderDto> {
  const safePage = page > 0 ? page : 1
  const safeSize = pageSize > 0 ? pageSize : 20
  const start = (safePage - 1) * safeSize
  return {
    items: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / safeSize)),
  }
}

export function getOrderById(id: string): OrderDto {
  const order = orders.find((o) => o.id === id)
  if (!order) throw new DemoError(404, 'Order not found.')
  return order
}

/** For cross-store demo seeding only — looks up a seeded order by its "0004"-style suffix. */
export function findSeedOrderBySuffix(suffix: string): OrderDto | undefined {
  return orders.find((o) => o.orderNumber.endsWith(`-${suffix}`))
}

export function getOrderTracking(id: string): OrderTrackingResponse {
  const order = getOrderById(id)
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    updatedAt: order.statusHistory[order.statusHistory.length - 1]?.changedAt ?? order.createdAt,
    timeline: order.statusHistory.map((h) => ({ status: h.newStatus, timestamp: h.changedAt })),
  }
}

export function updateOrderStatus(
  id: string,
  status: BackendOrderStatus,
  notes: string | null,
): OrderDto {
  const order = getOrderById(id)
  order.statusHistory.push({
    previousStatus: order.status,
    newStatus: status,
    notes,
    changedAt: new Date().toISOString(),
  })
  order.status = status
  return order
}
