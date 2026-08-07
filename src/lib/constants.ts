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
} as const

/** Fake OTP used across the mock auth flow — this is a POC with no real SMS provider. */
export const MOCK_OTP = '1234'

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Menu', to: '/menu' },
  { label: 'Catering', to: '/catering' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const
