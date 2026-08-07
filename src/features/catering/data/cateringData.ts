import type { CateringPackage } from '@/types'

export const cateringPackages: CateringPackage[] = [
  {
    id: 'intimate-gatherings',
    name: 'Intimate Gatherings',
    guestsRange: '20 – 50 guests',
    pricePerPlate: 450,
    description: 'Perfect for birthdays, house parties, and small family celebrations.',
    highlights: [
      'Choice of 2 biryanis (veg / non-veg)',
      '2 starters + 1 curry',
      'Live counter for Irani chai',
      'Basic table & buffet setup',
    ],
  },
  {
    id: 'grand-celebrations',
    name: 'Grand Celebrations',
    guestsRange: '100 – 300 guests',
    pricePerPlate: 650,
    description: 'Our most-loved package for weddings, engagements, and corporate galas.',
    highlights: [
      'Choice of 3 biryanis + 1 pulao',
      '4 starters, 3 curries, 2 breads',
      'Live dum biryani counter',
      'Dessert & mocktail counter',
      'Full staffing, crockery & decor',
    ],
    isPopular: true,
  },
  {
    id: 'royal-feast',
    name: 'Royal Feast',
    guestsRange: '300+ guests',
    pricePerPlate: 850,
    description: 'A no-compromise Nizami spread for landmark celebrations.',
    highlights: [
      'Unlimited biryani, pulao & curry stations',
      '6+ starters with live grill',
      'Dedicated haleem & kebab counter',
      'Premium dessert & chaat counters',
      'Full-service staff, valet & premium decor',
    ],
  },
  {
    id: 'corporate-lunch',
    name: 'Corporate Lunch Box',
    guestsRange: '10 – 500 boxes',
    pricePerPlate: 280,
    description: 'Neatly packed biryani boxes delivered on time, every time — for offices and conferences.',
    highlights: [
      'Single-serve sealed boxes',
      'Choice of veg / chicken / mutton',
      'Raita, salan & dessert included',
      'On-time doorstep delivery',
    ],
  },
]
