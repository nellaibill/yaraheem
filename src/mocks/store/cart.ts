import { findDemoProduct } from '@/mocks/fixtures/catalog'
import { DemoError } from '@/mocks/errors'
import type { CartDto, CartItemDto } from '@/lib/api/types'

interface CartLine {
  id: string
  productId: string
  quantity: number
}

const cartsByUser = new Map<string, CartLine[]>()
let idCounter = 1
function genId(): string {
  return `cart-item-${idCounter++}`
}

const DELIVERY_FEE = 40

function linesFor(userId: string): CartLine[] {
  let lines = cartsByUser.get(userId)
  if (!lines) {
    lines = []
    cartsByUser.set(userId, lines)
  }
  return lines
}

function toCartDto(userId: string): CartDto {
  const lines = linesFor(userId)
  const items: CartItemDto[] = lines.map((line) => {
    const product = findDemoProduct(line.productId)
    const unitPrice = product?.price ?? 0
    return {
      id: line.id,
      productId: line.productId,
      productName: product?.name ?? 'Unknown item',
      productVariantId: null,
      variantName: null,
      quantity: line.quantity,
      unitPrice,
      lineTotal: unitPrice * line.quantity,
    }
  })
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0
  return {
    cartId: `cart-${userId}`,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

export function getCart(userId: string): CartDto {
  return toCartDto(userId)
}

export function addItem(userId: string, productId: string, quantity: number): CartDto {
  if (!findDemoProduct(productId)) throw new DemoError(404, 'Product not found.')
  const lines = linesFor(userId)
  const existing = lines.find((l) => l.productId === productId)
  if (existing) existing.quantity += quantity
  else lines.push({ id: genId(), productId, quantity })
  return toCartDto(userId)
}

export function updateItem(userId: string, itemId: string, quantity: number): CartDto {
  const lines = linesFor(userId)
  const line = lines.find((l) => l.id === itemId)
  if (!line) throw new DemoError(404, 'Cart item not found.')
  if (quantity <= 0) {
    cartsByUser.set(
      userId,
      lines.filter((l) => l.id !== itemId),
    )
  } else {
    line.quantity = quantity
  }
  return toCartDto(userId)
}

export function removeItem(userId: string, itemId: string): CartDto {
  cartsByUser.set(
    userId,
    linesFor(userId).filter((l) => l.id !== itemId),
  )
  return toCartDto(userId)
}

export function clearCart(userId: string): CartDto {
  cartsByUser.set(userId, [])
  return toCartDto(userId)
}
