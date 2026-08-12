export type SpiceLevel = 'mild' | 'medium' | 'spicy'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: MenuCategory
  spiceLevel: SpiceLevel
  isVeg: boolean
  isSignature?: boolean
  isBestSeller?: boolean
  isAvailable?: boolean
  imageUrl?: string
  sections?: MenuSectionKey[]
  comboSlots?: string[]
}

export type MenuCategory =
  | 'biryani'
  | 'rice-noodles'
  | 'chicken-specials'
  | 'burgers-wraps'
  | 'sides-breads'
  | 'beverages'
  | 'combos'
  | 'desserts'

export type MenuSectionKey =
  | 'daily'
  | 'friday'
  | 'sunday'
  | 'weekend'
  | 'midnight'
  | 'lunch'
  | 'dinner'
  | 'catering'

export interface MenuSection {
  key: MenuSectionKey
  name: string
  tagline: string
  bannerImageUrl: string
  availableTime: string
  description: string
  isAvailableToday: boolean
  itemIds: string[]
}

export interface CartLine {
  itemId: string
  quantity: number
}

export interface CateringPackage {
  id: string
  name: string
  guestsRange: string
  pricePerPlate: number
  description: string
  highlights: string[]
  isPopular?: boolean
}

export interface GalleryImage {
  id: string
  caption: string
  category: 'events' | 'dishes' | 'kitchen'
}

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
  rating: number
}

export interface CateringInquiry {
  id: string
  name: string
  phone: string
  email: string
  eventDate: string
  guestCount: number
  packageId?: string
  message: string
  createdAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
}

export interface AuthUser {
  mobile: string
  name: string
  createdAt: string
  lastLoginAt: string
}

export type AddressLabel = 'Home' | 'Work' | 'Other'

export interface Address {
  id: string
  label: AddressLabel
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
  /** Mock coordinates picked on the mock map — used only for the service-area distance check. */
  lat?: number
  lng?: number
}

export type PaymentMethod = 'cash' | 'upi' | 'card'

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderLine {
  itemId: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  mobile: string
  lines: OrderLine[]
  itemsTotal: number
  discount: number
  deliveryFee: number
  total: number
  couponCode?: string
  address: Address
  paymentMethod: PaymentMethod
  status: OrderStatus
  statusUpdatedAt: string
  createdAt: string
  estimatedDeliveryMinutes: number
  deliveryPartnerId?: string
  cancellationReason?: string
}

/** Mock admin account for the gated Admin Portal login — plaintext is fine, this is a POC with no real auth. */
export interface AdminUser {
  username: string
  password: string
  name: string
}

export interface PromoBanner {
  title: string
  description: string
  code?: string
  enabled: boolean
}

export interface RestaurantSettings {
  acceptingOrders: boolean
  minOrderValue: number
  deliveryRadiusKm: number
  openTime: string
  closeTime: string
  offersEnabled: boolean
  todaysSpecialKey: MenuSectionKey
}
