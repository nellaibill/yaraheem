import { Link } from 'react-router-dom'
import { Flame, Leaf, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DishVisual } from '@/components/common/DishVisual'
import { useCart } from '@/features/cart/hooks/useCart'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { formatCurrency } from '@/lib/utils'
import type { MenuItem } from '@/types'
import { toast } from 'sonner'

export function MenuCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart()

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
            <DishVisual category={item.category} seed={item.id} className="h-40 w-full" />
          </Link>
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
          <div className="flex items-center gap-2">
            {item.isSignature && <Badge variant="gold">Signature</Badge>}
            {item.spiceLevel === 'spicy' && (
              <Badge variant="outline" className="gap-1">
                <Flame className="size-3" /> Spicy
              </Badge>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-display text-lg font-semibold">{formatCurrency(item.price)}</span>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => {
                addItem(item.id)
                toast.success(`${item.name} added to your order`)
              }}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
