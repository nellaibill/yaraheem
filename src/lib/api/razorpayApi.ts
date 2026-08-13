import { apiPost } from '@/lib/api/client'

export interface RazorpayVerifyRequest {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export function verifyRazorpayPayment(request: RazorpayVerifyRequest): Promise<void> {
  return apiPost<void>('/api/payments/orders/razorpay/verify', request)
}
