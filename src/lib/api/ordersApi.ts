import { apiGet, apiPost } from '@/lib/api/client'
import type { CheckoutRequest, CheckoutResponse, OrderDto, OrderTrackingResponse, PagedResult } from '@/lib/api/types'

export function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>('/api/orders/checkout', request)
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
