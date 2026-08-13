import { apiPost } from '@/lib/api/client'
import { adminApiDelete, adminApiGet, adminApiPost, adminApiPut } from '@/lib/api/adminClient'
import type { ApplyCouponPreviewResponse, CouponDto, CreateCouponRequest, UpdateCouponRequest } from '@/lib/api/types'

export function previewCoupon(code: string, subtotal: number): Promise<ApplyCouponPreviewResponse> {
  return apiPost<ApplyCouponPreviewResponse>('/api/coupons/preview', { code, subtotal })
}

export function fetchAdminCoupons(): Promise<CouponDto[]> {
  return adminApiGet<CouponDto[]>('/api/admin/coupons')
}

export function createAdminCoupon(request: CreateCouponRequest): Promise<CouponDto> {
  return adminApiPost<CouponDto>('/api/admin/coupons', request)
}

export function updateAdminCoupon(id: string, request: UpdateCouponRequest): Promise<CouponDto> {
  return adminApiPut<CouponDto>(`/api/admin/coupons/${id}`, request)
}

export function deleteAdminCoupon(id: string): Promise<void> {
  return adminApiDelete<void>(`/api/admin/coupons/${id}`)
}
