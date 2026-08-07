export const SITE = {
  name: 'Yaraheem Catering Services',
  shortName: 'Yaraheem',
  tagline: 'Premium Biryani. Crafted with Tradition.',
  description:
    'Yaraheem Catering Services brings restaurant-grade biryani and royal Hyderabadi cuisine to your table — from intimate dinners to grand celebrations.',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'hello@yaraheem.com',
  address: '14, Masab Tank Road, Hyderabad, Telangana 500028',
  hours: 'Everyday · 11:00 AM – 11:00 PM',
  social: {
    instagram: 'https://instagram.com/yaraheemcatering',
    facebook: 'https://facebook.com/yaraheemcatering',
  },
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
  restaurantSettings: 'yaraheem:admin:settings',
  adminSeeded: 'yaraheem:admin:seeded',
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

/** Staff-facing portals — surfaced discreetly in the footer for this POC demo. */
export const STAFF_LINKS = [
  { label: 'Admin Dashboard', to: '/admin' },
  { label: 'Delivery Partner Login', to: '/delivery/login' },
] as const
