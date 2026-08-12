import { adminApiGet, adminApiPost, adminApiPut } from '@/lib/api/adminClient'
import type {
  CreateDeliveryPartnerRequest,
  DeliveryPartnerDto,
  OrderAssignmentDto,
  UpdateDeliveryPartnerRequest,
} from '@/lib/api/types'

export function fetchAdminDeliveryPartners(): Promise<DeliveryPartnerDto[]> {
  return adminApiGet<DeliveryPartnerDto[]>('/api/admin/delivery-partners')
}

export function createAdminDeliveryPartner(request: CreateDeliveryPartnerRequest): Promise<DeliveryPartnerDto> {
  return adminApiPost<DeliveryPartnerDto>('/api/admin/delivery-partners', request)
}

export function updateAdminDeliveryPartner(id: string, request: UpdateDeliveryPartnerRequest): Promise<DeliveryPartnerDto> {
  return adminApiPut<DeliveryPartnerDto>(`/api/admin/delivery-partners/${id}`, request)
}

export function fetchOrderDeliveryAssignment(orderId: string): Promise<OrderAssignmentDto | null> {
  return adminApiGet<OrderAssignmentDto | null>(`/api/admin/orders/${orderId}/delivery-assignment`)
}

export function assignOrderDelivery(orderId: string, deliveryPartnerId: string): Promise<OrderAssignmentDto> {
  return adminApiPut<OrderAssignmentDto>(`/api/admin/orders/${orderId}/assign-delivery`, { deliveryPartnerId })
}
