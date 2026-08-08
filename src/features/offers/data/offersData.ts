export interface Offer {
  code: string
  title: string
  description: string
  discountPercent: number
  maxDiscount?: number
  minOrder: number
  expiresOn: string
}

export const offers: Offer[] = [
  {
    code: 'WELCOME50',
    title: 'Welcome Offer',
    description: 'Flat 50% off on your first order.',
    discountPercent: 50,
    maxDiscount: 150,
    minOrder: 299,
    expiresOn: '2026-12-31',
  },
  {
    code: 'BIRYANI20',
    title: 'Biryani Special',
    description: '20% off on all biryani orders above Rs. 500.',
    discountPercent: 20,
    maxDiscount: 200,
    minOrder: 500,
    expiresOn: '2026-12-31',
  },
  {
    code: 'FAMILY100',
    title: 'Family Feast',
    description: 'Flat Rs. 100 off on orders above Rs. 999 — perfect for family orders.',
    discountPercent: 10,
    maxDiscount: 100,
    minOrder: 999,
    expiresOn: '2026-12-31',
  },
  {
    code: 'WEEKEND15',
    title: 'Weekend Treat',
    description: '15% off every Saturday and Sunday.',
    discountPercent: 15,
    maxDiscount: 120,
    minOrder: 349,
    expiresOn: '2026-12-31',
  },
]

export function findOffer(code: string): Offer | undefined {
  return offers.find((offer) => offer.code.toLowerCase() === code.trim().toLowerCase())
}

export function calculateDiscount(offer: Offer, subtotal: number): number {
  if (subtotal < offer.minOrder) return 0
  const raw = (subtotal * offer.discountPercent) / 100
  return offer.maxDiscount ? Math.min(raw, offer.maxDiscount) : raw
}
