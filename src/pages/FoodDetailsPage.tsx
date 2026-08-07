import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Flame, Leaf, Minus, Plus, Star, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DishVisual } from '@/components/common/DishVisual'
import { EmptyState } from '@/components/common/EmptyState'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { menuItems } from '@/features/menu/data/menuData'
import { testimonials } from '@/features/testimonials/data/testimonialsData'
import { useCart } from '@/features/cart/hooks/useCart'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency, getMockRating, cn } from '@/lib/utils'

export default function FoodDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const item = menuItems.find((menuItem) => menuItem.id === id)
  useDocumentTitle(item?.name ?? 'Dish Not Found')

  if (!item) {
    return (
      <EmptyState
        fullPage
        icon={UtensilsCrossed}
        title="Dish not found"
        description="This item may no longer be on the menu."
        actionLabel="Back to Menu"
        actionTo="/menu"
      />
    )
  }

  const rating = getMockRating(item.id)
  const related = menuItems.filter((m) => m.category === item.category && m.id !== item.id).slice(0, 3)
  const reviews = testimonials.slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Back
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <DishVisual category={item.category} seed={item.id} className="aspect-square w-full rounded-2xl" iconClassName="size-16" />
          <FavoriteButton itemId={item.id} className="absolute top-4 right-4 size-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-bold">{item.name}</h1>
            {item.isVeg ? (
              <Leaf className="mt-1.5 size-5 shrink-0 text-green-600" aria-label="Vegetarian" />
            ) : (
              <span className="mt-1.5 inline-block size-4 shrink-0 rounded-sm border-2 border-red-600" aria-label="Non-vegetarian">
                <span className="m-auto block size-2 rounded-full bg-red-600" />
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.isSignature && <Badge variant="gold">Signature</Badge>}
            {item.spiceLevel === 'spicy' && (
              <Badge variant="outline" className="gap-1">
                <Flame className="size-3" /> Spicy
              </Badge>
            )}
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Star className="fill-gold text-gold size-4" />
              <span className="text-foreground font-medium">{rating.average}</span>
              <span>({rating.count} ratings)</span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{item.description}</p>

          <p className="font-display text-3xl font-bold">{formatCurrency(item.price)}</p>

          <div className="flex items-center gap-4">
            <div className="border-input flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              onClick={() => {
                addItem(item.id, quantity)
                toast.success(`${quantity} × ${item.name} added to your order`)
              }}
            >
              Add {quantity > 1 ? `${quantity} ` : ''}to Order — {formatCurrency(item.price * quantity)}
            </Button>
          </div>
        </motion.div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-16">
          <Separator className="mb-10" />
          <h2 className="font-display mb-6 text-xl font-bold">What people are saying</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border p-4">
                <div className="mb-2 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('size-3.5', i < review.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30')}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground line-clamp-3 text-sm italic">&ldquo;{review.quote}&rdquo;</p>
                <p className="mt-2 text-xs font-medium">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <Separator className="mb-10" />
          <h2 className="font-display mb-6 text-xl font-bold">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((related) => (
              <MenuCard key={related.id} item={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
