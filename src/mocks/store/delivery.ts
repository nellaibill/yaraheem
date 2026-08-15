import { DemoError } from '@/mocks/errors'
import { findSeedOrderBySuffix, getOrderById, updateOrderStatus } from '@/mocks/store/orders'
import type {
  DeliveryAssignmentStatus,
  DeliveryPartnerDto,
  DeliveryPartnerStatus,
  MyDeliveryOrderDto,
  OrderAssignmentDto,
} from '@/lib/api/types'

interface PartnerRecord {
  id: string
  userId: string
  name: string
  phoneNumber: string
  vehicleType: string
  email: string
  status: DeliveryPartnerStatus
}

interface AssignmentRecord {
  orderId: string
  deliveryPartnerId: string
  status: DeliveryAssignmentStatus
  assignedAt: string
}

let idCounter = 1
function genId(prefix: string): string {
  return `${prefix}-${idCounter++}`
}

const partners: PartnerRecord[] = [
  {
    id: genId('partner'),
    userId: 'user-partner1',
    name: 'Ravi Kumar',
    phoneNumber: '9840012345',
    vehicleType: 'Bike',
    email: 'partner1@ecommerce.local',
    status: 1,
  },
  {
    id: genId('partner'),
    userId: 'user-partner2',
    name: 'Suresh Babu',
    phoneNumber: '9840012346',
    vehicleType: 'Scooter',
    email: 'partner2@ecommerce.local',
    status: 1,
  },
]

const assignments: AssignmentRecord[] = []

function seedAssignments() {
  const shipped = findSeedOrderBySuffix('0004')
  const delivered = findSeedOrderBySuffix('0005')
  const now = new Date().toISOString()
  if (shipped)
    assignments.push({
      orderId: shipped.id,
      deliveryPartnerId: partners[0].id,
      status: 3,
      assignedAt: now,
    })
  if (delivered)
    assignments.push({
      orderId: delivered.id,
      deliveryPartnerId: partners[1].id,
      status: 4,
      assignedAt: now,
    })
}

seedAssignments()

function toPartnerDto(p: PartnerRecord): DeliveryPartnerDto {
  return {
    id: p.id,
    name: p.name,
    phoneNumber: p.phoneNumber,
    vehicleType: p.vehicleType,
    status: p.status,
    email: p.email,
  }
}

function toAssignmentDto(a: AssignmentRecord | undefined): OrderAssignmentDto {
  if (!a)
    return {
      orderId: '',
      deliveryPartnerId: null,
      deliveryPartnerName: null,
      status: null,
      assignedAt: null,
    }
  const partner = partners.find((p) => p.id === a.deliveryPartnerId)
  return {
    orderId: a.orderId,
    deliveryPartnerId: a.deliveryPartnerId,
    deliveryPartnerName: partner?.name ?? null,
    status: a.status,
    assignedAt: a.assignedAt,
  }
}

export function getPartners(): DeliveryPartnerDto[] {
  return partners.map(toPartnerDto)
}

export function createPartner(
  name: string,
  phoneNumber: string,
  vehicleType: string,
  email: string,
): DeliveryPartnerDto {
  const partner: PartnerRecord = {
    id: genId('partner'),
    userId: genId('user'),
    name,
    phoneNumber,
    vehicleType,
    email,
    status: 1,
  }
  partners.push(partner)
  return toPartnerDto(partner)
}

export function updatePartner(
  id: string,
  name: string,
  phoneNumber: string,
  vehicleType: string,
  status: DeliveryPartnerStatus,
): DeliveryPartnerDto {
  const partner = partners.find((p) => p.id === id)
  if (!partner) throw new DemoError(404, 'Delivery partner not found.')
  partner.name = name
  partner.phoneNumber = phoneNumber
  partner.vehicleType = vehicleType
  partner.status = status
  return toPartnerDto(partner)
}

export function getAssignmentForOrder(orderId: string): OrderAssignmentDto {
  return toAssignmentDto(assignments.find((a) => a.orderId === orderId))
}

export function assignDelivery(orderId: string, deliveryPartnerId: string): OrderAssignmentDto {
  if (!partners.some((p) => p.id === deliveryPartnerId))
    throw new DemoError(404, 'Delivery partner not found.')
  const existing = assignments.find((a) => a.orderId === orderId)
  if (existing) {
    existing.deliveryPartnerId = deliveryPartnerId
    existing.assignedAt = new Date().toISOString()
  } else {
    assignments.push({
      orderId,
      deliveryPartnerId,
      status: 1,
      assignedAt: new Date().toISOString(),
    })
  }
  return toAssignmentDto(assignments.find((a) => a.orderId === orderId))
}

export function getMyOrders(partnerUserId: string): MyDeliveryOrderDto[] {
  const partner = partners.find((p) => p.userId === partnerUserId)
  if (!partner) return []
  return assignments
    .filter((a) => a.deliveryPartnerId === partner.id && a.status !== 4)
    .map((a) => {
      const order = getOrderById(a.orderId)
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: a.status,
        customerName: order.shippingAddress.fullName,
        customerPhone: order.shippingAddress.phoneNumber,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
        total: order.total,
        assignedAt: a.assignedAt,
      }
    })
}

export function updateMyOrderStatus(
  partnerUserId: string,
  orderId: string,
  status: DeliveryAssignmentStatus,
): MyDeliveryOrderDto {
  const partner = partners.find((p) => p.userId === partnerUserId)
  if (!partner) throw new DemoError(404, 'Delivery partner not found.')
  const assignment = assignments.find(
    (a) => a.orderId === orderId && a.deliveryPartnerId === partner.id,
  )
  if (!assignment) throw new DemoError(404, 'Assignment not found.')
  assignment.status = status
  if (status === 4) updateOrderStatus(orderId, 5, 'Delivered')

  const order = getOrderById(orderId)
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: assignment.status,
    customerName: order.shippingAddress.fullName,
    customerPhone: order.shippingAddress.phoneNumber,
    addressLine1: order.shippingAddress.addressLine1,
    addressLine2: order.shippingAddress.addressLine2,
    city: order.shippingAddress.city,
    state: order.shippingAddress.state,
    postalCode: order.shippingAddress.postalCode,
    items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
    total: order.total,
    assignedAt: assignment.assignedAt,
  }
}
