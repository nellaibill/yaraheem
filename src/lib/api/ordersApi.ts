import { apiGet, apiPost } from '@/lib/api/client'
import type { CheckoutRequest, CheckoutResponse, OrderDto, OrderTrackingResponse, PagedResult } from '@/lib/api/types'

/**
 * idempotencyKey should be a fresh random value generated once per checkout attempt (not
 * per retry) — a resubmit of the same key returns the original order instead of placing a
 * duplicate one, guarding against double-clicks and network-retry double submits.
 */
export function checkout(request: CheckoutRequest, idempotencyKey: string): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>('/api/orders/checkout', request, { 'Idempotency-Key': idempotencyKey })
}

export function fetchMyOrders(page = 1, pageSize = 20): Promise<PagedResult<OrderDto>> {
  return apiGet<PagedResult<OrderDto>>('/api/orders/my-orders', { page, pageSize })
}

export function fetchOrder(id: string): Promise<OrderDto> {
  return apiGet<OrderDto>(`/api/orders/${id}`)
}

export function fetchOrderTracking(id: string): Promise<OrderTrackingResponse> {
  return apiGet<OrderTrackingResponse>(`/api/orders/${id}/tracking`)
}
