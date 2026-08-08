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
      '2 chicken specials + 1 curry',
      'Live counter for Jigarthanda',
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
      'Choice of 3 biryanis + Mandi',
      '4 chicken specials, 2 curries, parotta counter',
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
    description: 'A no-compromise South Tamil Nadu feast for landmark celebrations.',
    highlights: [
      'Unlimited biryani, Mandi & curry stations',
      '6+ chicken specials with live grill',
      'Dedicated Jigarthanda & shawarma counter',
      'Premium dessert counters',
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
      'Raita & dessert included',
      'On-time doorstep delivery',
    ],
  },
]
