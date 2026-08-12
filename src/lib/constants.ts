import type { MenuSectionKey } from '@/types'

export const SITE = {
  name: 'Ya Raheem Catering Services',
  shortName: 'Ya Raheem',
  tagline: 'Premium Biryani. Rooted in Tamil Tradition.',
  description:
    'Ya Raheem Catering Services brings authentic South Tamil Nadu biryani, chicken specials, and festive catering spreads to your table — serving Melapalayam and nearby Tirunelveli.',
  phone: '+91 90801 39363',
  whatsapp: '919080139363',
  email: 'shahulhameed6643@gmail.com',
  address: 'Rahimaniya Puram North North Street, Melapalayam, Tirunelveli, Tamil Nadu – 627005',
  hours: 'Everyday · 11:00 AM – 11:00 PM · Midnight Fuel till 2:00 AM',
  social: {
    instagram: 'https://instagram.com/yaraheemcatering',
    facebook: 'https://facebook.com/yaraheemcatering',
  },
} as const

/** Approximate coordinates for Melapalayam, Tirunelveli — used only for the mock service-area check. */
export const SERVICE_AREA = {
  centerLat: 8.7278,
  centerLng: 77.6857,
  radiusKm: 15,
  message: 'Serving Melapalayam & Nearby Tirunelveli',
} as const

export const STORAGE_KEYS = {
  cart: 'yaraheem:cart',
  cateringInquiries: 'yaraheem:catering-inquiries',
  contactMessages: 'yaraheem:contact-messages',
  theme: 'yaraheem:theme',
  authUsers: 'yaraheem:auth:users',
  authActiveMobile: 'yaraheem:auth:active-mobile',
  authSeenWelcome: 'yaraheem:auth:seen-welcome',
  addresses: 'yaraheem:addresses',
  orders: 'yaraheem:orders',
  favorites: 'yaraheem:favorites',
  deliveryPartners: 'yaraheem:delivery-partners',
  activePartnerId: 'yaraheem:delivery:active-partner-id',
  adminUsers: 'yaraheem:admin:users',
  adminSession: 'yaraheem:admin:session',
  restaurantSettings: 'yaraheem:admin:settings',
  adminSeeded: 'yaraheem:admin:seeded',
  menuItemsOverride: 'yaraheem:menu:items',
  menuSectionsOverride: 'yaraheem:menu:sections',
  promoBanner: 'yaraheem:promo-banner',
  apiSession: 'yaraheem:api:session',
  adminApiSession: 'yaraheem:api:admin-session',
  adminOrderDeliveryAssignments: 'yaraheem:admin:order-delivery-assignments',
} as const

export const DEFAULT_PROMO_BANNER = {
  title: 'Weekend Treat',
  description: '15% off every Saturday and Sunday. Use code WEEKEND15 at checkout.',
  code: 'WEEKEND15',
  enabled: true,
} as const

/** Fake OTP used across the mock auth flow — this is a POC with no real SMS provider. */
export const MOCK_OTP = '1234'

export const DELIVERY_FEE = 40
export const FREE_DELIVERY_THRESHOLD = 799

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash on Delivery',
  upi: 'UPI',
  card: 'Credit / Debit Card',
} as const

export const ORDER_STATUS_LABELS = {
  placed: 'Order Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const

export const ORDER_STATUS_SEQUENCE = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'picked_up',
  'out_for_delivery',
  'delivered',
] as const

export const DELIVERY_PARTNER_STATUS_LABELS = {
  available: 'Available',
  busy: 'On Delivery',
  offline: 'Offline',
} as const

export const DEFAULT_RESTAURANT_SETTINGS = {
  acceptingOrders: true,
  minOrderValue: 199,
  deliveryRadiusKm: 12,
  openTime: '11:00',
  closeTime: '23:00',
  offersEnabled: true,
  todaysSpecialKey: 'daily',
} as const

export const MENU_SECTION_LABELS: Record<MenuSectionKey, string> = {
  daily: "Today's Special",
  friday: 'Friday Special',
  sunday: 'Sunday Special',
  weekend: 'Weekend Special',
  midnight: 'Midnight Fuel',
  lunch: 'Lunch Menu',
  dinner: 'Dinner Menu',
  catering: 'Catering Packages',
} as const

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Offers', to: '/offers' },
  { label: 'Catering', to: '/catering' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const

export const FOOTER_LINKS = [
  { label: 'Categories', to: '/categories' },
  { label: 'Search', to: '/search' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Restaurant Info', to: '/restaurant-info' },
] as const

/** Staff-facing entry point — a single gated link, never a direct link to /admin or /delivery. */
export const PORTAL_LOGIN_LINK = { label: 'Portal Login', to: '/portal' } as const
