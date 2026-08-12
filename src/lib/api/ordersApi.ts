import { apiPost } from '@/lib/api/client'
import type { CheckoutRequest, CheckoutResponse } from '@/lib/api/types'

export function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiPost<CheckoutResponse>('/api/orders/checkout', request)
}
