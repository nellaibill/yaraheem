import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client'
import type { AddCartItemRequest, CartDto, UpdateCartItemRequest } from '@/lib/api/types'

export function fetchCart(): Promise<CartDto> {
  return apiGet<CartDto>('/api/cart')
}

export function addCartItem(request: AddCartItemRequest): Promise<CartDto> {
  return apiPost<CartDto>('/api/cart/items', request)
}

export function updateCartItem(itemId: string, request: UpdateCartItemRequest): Promise<CartDto> {
  return apiPut<CartDto>(`/api/cart/items/${itemId}`, request)
}

export function removeCartItem(itemId: string): Promise<CartDto> {
  return apiDelete<CartDto>(`/api/cart/items/${itemId}`)
}

export function clearCart(): Promise<CartDto> {
  return apiDelete<CartDto>('/api/cart/clear')
}
