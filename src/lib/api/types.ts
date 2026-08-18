export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ProductListResponse {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  comparePrice: number | null
  thumbnailUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  stockQuantity: number
  categoryId: string
  categoryName: string
}

export interface ProductDetailsResponse {
  id: string
  name: string
  slug: string
  description: string | null
  sku: string
  price: number
  comparePrice: number | null
  thumbnailUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  isActive: boolean
  stockQuantity: number
  categoryId: string
  categoryName: string
}

export interface CreateProductRequest {
  name: string
  slug: string
  description: string | null
  sku: string
  price: number
  comparePrice: number | null
  thumbnailUrl: string | null
  categoryId: string
  isFeatured?: boolean
  isPublished?: boolean
}

export interface UpdateProductRequest {
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  thumbnailUrl: string | null
  categoryId: string
  isFeatured: boolean
  isPublished: boolean
  isActive: boolean
}

export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentCategoryId: string | null
  displayOrder: number
  isActive: boolean
}

export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  roles: string[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: UserDto
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface CartItemDto {
  id: string
  productId: string
  productName: string
  productVariantId: string | null
  variantName: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CartDto {
  cartId: string
  items: CartItemDto[]
  subtotal: number
  deliveryFee: number
  total: number
  totalItems: number
}

export interface AddCartItemRequest {
  productId: string
  productVariantId?: string | null
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface ShippingAddressRequest {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export interface CheckoutRequest {
  paymentMethod: string
  shippingAddress: ShippingAddressRequest
  couponCode?: string | null
}

export interface CheckoutResponse {
  orderId: string
  orderNumber: string
  paymentStatus: string
  transactionReference: string
  /** Present only when a real Razorpay gateway is configured on the backend and payment is still pending. */
  razorpayKeyId: string | null
}

export interface ProblemDetails {
  status?: number
  title?: string
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}

/** Matches Ecommerce.Modules.Orders.Domain.OrderStatus — serialized as its int value. */
export type BackendOrderStatus = 1 | 2 | 3 | 4 | 5 | 6

export interface OrderItemDto {
  id: string
  productId: string
  productVariantId: string | null
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderStatusHistoryDto {
  previousStatus: BackendOrderStatus | null
  newStatus: BackendOrderStatus
  notes: string | null
  changedAt: string
}

export interface AddressDto {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export interface OrderDto {
  id: string
  orderNumber: string
  userId: string
  status: BackendOrderStatus
  subtotal: number
  deliveryFee: number
  discountAmount: number
  couponCode: string | null
  total: number
  shippingAddress: AddressDto
  items: OrderItemDto[]
  statusHistory: OrderStatusHistoryDto[]
  createdAt: string
  paymentMethod: string | null
}

export interface CouponDto {
  id: string
  code: string
  title: string
  description: string | null
  discountPercent: number
  maxDiscountAmount: number | null
  minOrderSubtotal: number
  usageLimit: number | null
  usageCount: number
  perUserLimit: number | null
  validUntil: string | null
  isActive: boolean
}

export interface CreateCouponRequest {
  code: string
  title: string
  description?: string | null
  discountPercent: number
  maxDiscountAmount?: number | null
  minOrderSubtotal: number
  usageLimit?: number | null
  perUserLimit?: number | null
  validUntil?: string | null
}

export interface UpdateCouponRequest {
  title: string
  description: string | null
  discountPercent: number
  maxDiscountAmount: number | null
  minOrderSubtotal: number
  usageLimit: number | null
  perUserLimit: number | null
  validUntil: string | null
  isActive: boolean
}

export interface ApplyCouponPreviewResponse {
  isValid: boolean
  errorMessage: string | null
  discountAmount: number
}

export type IntegrationSettingSource = 0 | 1 | 2 // NotConfigured | Config | Database

export interface IntegrationSettingFieldDto {
  key: string
  label: string
  source: IntegrationSettingSource
  maskedValue: string | null
}

export interface IntegrationSettingsGroupDto {
  provider: string
  title: string
  fields: IntegrationSettingFieldDto[]
}

export interface IntegrationSettingsResponse {
  groups: IntegrationSettingsGroupDto[]
}

export type DiningTableStatus = 1 | 2 | 3 // Available | Occupied | NeedsCleaning
export type TableSessionStatus = 1 | 2 | 3 // Open | BillRequested | Closed
export type DineInRoundStatus = 1 | 2 | 3 | 4 | 5 // Fired | Preparing | Ready | Served | Cancelled
export type DineInPaymentStatus = 1 | 2 | 3 // Pending | Paid | Failed

export interface DiningTableDto {
  id: string
  label: string
  capacity: number
  status: DiningTableStatus
  activeSessionId: string | null
  runningTotal: number | null
}

export interface DineInRoundItemDto {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface DineInRoundDto {
  id: string
  roundNumber: number
  status: DineInRoundStatus
  firedAt: string
  items: DineInRoundItemDto[]
  roundTotal: number
}

export interface DineInRoundPrintDto {
  tableLabel: string
  round: DineInRoundDto
}

export interface DineInPaymentDto {
  id: string
  tableSessionId: string
  label: string
  amount: number
  method: string
  status: DineInPaymentStatus
  razorpayOrderId: string | null
  paidAt: string | null
}

export interface CreateDineInPaymentResponse {
  payment: DineInPaymentDto
  razorpayKeyId: string | null
  razorpayAmountInPaise: number | null
}

export interface KitchenRoundDto {
  id: string
  sessionId: string
  tableLabel: string
  roundNumber: number
  status: DineInRoundStatus
  firedAt: string
  items: DineInRoundItemDto[]
}

export interface TableSessionDto {
  id: string
  tableId: string
  tableLabel: string
  openedByUserId: string
  guestCount: number
  status: TableSessionStatus
  openedAt: string
  closedAt: string | null
  paymentMethod: string | null
  rounds: DineInRoundDto[]
  payments: DineInPaymentDto[]
  subtotal: number
  taxRatePercent: number
  taxAmount: number
  serviceChargePercent: number
  serviceChargeAmount: number
  total: number
}

export interface AuditLogEntryDto {
  id: string
  actorUserId: string | null
  actorEmail: string | null
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface CustomerSummaryDto {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  createdAt: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string | null
}

export interface OrderTrackingEventDto {
  status: BackendOrderStatus
  timestamp: string
}

export interface OrderTrackingResponse {
  orderNumber: string
  status: BackendOrderStatus
  updatedAt: string
  timeline: OrderTrackingEventDto[]
}

export interface ContactMessageDto {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isResolved: boolean
  createdAt: string
}

export interface SubmitContactMessageRequest {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export type CateringInquiryStatus = 1 | 2 | 3 | 4

export interface CateringInquiryDto {
  id: string
  name: string
  phone: string
  email: string | null
  eventDate: string | null
  guestCount: number | null
  packageName: string | null
  message: string | null
  status: CateringInquiryStatus
  createdAt: string
}

export interface SubmitCateringInquiryRequest {
  name: string
  phone: string
  email?: string | null
  eventDate?: string | null
  guestCount?: number | null
  packageName?: string | null
  message?: string | null
}

export type DeliveryPartnerStatus = 1 | 2 | 3

export interface DeliveryPartnerDto {
  id: string
  name: string
  phoneNumber: string
  vehicleType: string
  status: DeliveryPartnerStatus
  email: string
}

export interface CreateDeliveryPartnerRequest {
  name: string
  phoneNumber: string
  vehicleType: string
  email: string
  password: string
}

export interface UpdateDeliveryPartnerRequest {
  name: string
  phoneNumber: string
  vehicleType: string
  status: DeliveryPartnerStatus
}

export type DeliveryAssignmentStatus = 1 | 2 | 3 | 4

export interface OrderAssignmentDto {
  orderId: string
  deliveryPartnerId: string | null
  deliveryPartnerName: string | null
  status: DeliveryAssignmentStatus | null
  assignedAt: string | null
}

export interface DeliveryOrderItemDto {
  productName: string
  quantity: number
}

export interface MyDeliveryOrderDto {
  orderId: string
  orderNumber: string
  status: DeliveryAssignmentStatus
  customerName: string
  customerPhone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  items: DeliveryOrderItemDto[]
  total: number
  assignedAt: string
}
