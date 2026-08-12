import { adminApiGet, adminApiPut } from '@/lib/api/adminClient'
import type { BackendOrderStatus, OrderDto, PagedResult } from '@/lib/api/types'

export interface AdminOrderQuery {
  status?: BackendOrderStatus
  orderNumber?: string
  customerEmail?: string
  page?: number
  pageSize?: number
}

export function fetchAdminOrders(query: AdminOrderQuery = {}): Promise<PagedResult<OrderDto>> {
  return adminApiGet<PagedResult<OrderDto>>('/api/admin/orders', {
    status: query.status,
    orderNumber: query.orderNumber,
    customerEmail: query.customerEmail,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 100,
  })
}

export function updateAdminOrderStatus(orderId: string, status: BackendOrderStatus, notes?: string): Promise<OrderDto> {
  return adminApiPut<OrderDto>(`/api/admin/orders/${orderId}/status`, { status, notes })
}
