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
}

export interface CheckoutResponse {
  orderId: string
  orderNumber: string
  paymentStatus: string
  transactionReference: string
}

export interface ProblemDetails {
  status?: number
  title?: string
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}
