import {
  type LucideIcon,
  Soup,
  Drumstick,
  Wheat,
  IceCreamCone,
  CupSoda,
  ChefHat,
  Sandwich,
  Package,
} from 'lucide-react'
import type { MenuCategory } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICON: Record<MenuCategory, LucideIcon> = {
  biryani: Soup,
  'rice-noodles': Soup,
  'chicken-specials': Drumstick,
  'burgers-wraps': Sandwich,
  'sides-breads': Wheat,
  beverages: CupSoda,
  combos: Package,
  desserts: IceCreamCone,
}

const GRADIENTS = [
  'from-maroon via-maroon/80 to-[#3a0d18]',
  'from-gold via-[#b8842a] to-maroon',
  'from-[#5c1a2c] via-maroon to-[#26080e]',
  'from-[#d8ac52] via-gold to-[#8a5a1e]',
]

function hashToIndex(seed: string, length: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash % length
}

export function DishVisual({
  category,
  seed,
  className,
  iconClassName,
}: {
  category?: MenuCategory
  seed: string
  className?: string
  iconClassName?: string
}) {
  const Icon = category ? CATEGORY_ICON[category] : ChefHat
  const gradient = GRADIENTS[hashToIndex(seed, GRADIENTS.length)]

  return (
    <div
      className={cn(
        'bg-noise relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-white/90',
        gradient,
        className,
      )}
      aria-hidden="true"
    >
      <Icon className={cn('size-10 drop-shadow-sm', iconClassName)} strokeWidth={1.5} />
    </div>
  )
}
