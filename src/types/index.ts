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
