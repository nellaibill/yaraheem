import { Link } from 'react-router-dom'
import { Flame, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FoodImage } from '@/components/common/FoodImage'
import { AddToCartButton } from '@/features/cart/components/AddToCartButton'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { formatCurrency } from '@/lib/utils'
import type { MenuItem } from '@/types'

export function MenuCard({ item }: { item: MenuItem }) {
  const isAvailable = item.isAvailable !== false

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="relative">
          <Link to={`/food/${item.id}`} className="block">
            <FoodImage
              itemId={item.id}
              category={item.category}
              alt={item.name}
              className="h-40 w-full"
            />
          </Link>
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="secondary">Sold Out</Badge>
            </div>
          )}
          <FavoriteButton itemId={item.id} className="absolute top-3 right-3" />
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/food/${item.id}`} className="hover:underline">
              <h3 className="font-display text-base leading-snug font-semibold">{item.name}</h3>
            </Link>
            {item.isVeg ? (
              <Leaf className="mt-1 size-4 shrink-0 text-green-600" aria-label="Vegetarian" />
            ) : (
              <span className="mt-1 inline-block size-3.5 shrink-0 rounded-sm border-2 border-red-600" aria-label="Non-vegetarian">
                <span className="m-auto block size-1.5 rounded-full bg-red-600" />
              </span>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            {item.isSignature && <Badge variant="gold">Signature</Badge>}
            {item.isBestSeller && <Badge variant="default">Bestseller</Badge>}
            {item.spiceLevel === 'spicy' && (
              <Badge variant="outline" className="gap-1">
                <Flame className="size-3" /> Spicy
              </Badge>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-semibold">{formatCurrency(item.price)}</span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
            {isAvailable && <AddToCartButton itemId={item.id} itemName={item.name} className="w-full" />}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
