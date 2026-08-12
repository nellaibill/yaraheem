import { deliveryApiGet, deliveryApiPut } from '@/lib/api/deliveryClient'
import type { DeliveryAssignmentStatus, MyDeliveryOrderDto } from '@/lib/api/types'

export function fetchMyDeliveryOrders(): Promise<MyDeliveryOrderDto[]> {
  return deliveryApiGet<MyDeliveryOrderDto[]>('/api/delivery/my-orders')
}

export function updateMyDeliveryStatus(orderId: string, status: DeliveryAssignmentStatus): Promise<MyDeliveryOrderDto> {
  return deliveryApiPut<MyDeliveryOrderDto>(`/api/delivery/orders/${orderId}/status`, { status })
}
