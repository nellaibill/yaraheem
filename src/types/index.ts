export type SpiceLevel = 'mild' | 'medium' | 'spicy'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: MenuCategory
  spiceLevel: SpiceLevel
  isVeg: boolean
  isSignature?: boolean
}

export type MenuCategory =
  | 'biryani'
  | 'starters'
  | 'kebabs'
  | 'curries'
  | 'breads'
  | 'desserts'
  | 'beverages'

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
}

export type DeliveryPartnerStatus = 'available' | 'busy' | 'offline'
export type VehicleType = 'bike' | 'scooter' | 'bicycle'

export interface DeliveryPartner {
  id: string
  name: string
  mobile: string
  vehicleType: VehicleType
  rating: number
  status: DeliveryPartnerStatus
  activeOrderId?: string
  totalDeliveries: number
}

export interface RestaurantSettings {
  acceptingOrders: boolean
  minOrderValue: number
  deliveryRadiusKm: number
  openTime: string
  closeTime: string
}
