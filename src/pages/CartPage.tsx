import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SectionHeading } from '@/components/common/SectionHeading'
import { FoodImage } from '@/components/common/FoodImage'
import { EmptyState } from '@/components/common/EmptyState'
import { useCart } from '@/features/cart/hooks/useCart'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/constants'

export default function CartPage() {
  const { lines, totalItems, totalPrice, setQuantity, removeItem, clear } = useCart()
  const navigate = useNavigate()
  useDocumentTitle('Your Cart')

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD || totalPrice === 0 ? 0 : DELIVERY_FEE
  const grandTotal = totalPrice + deliveryFee

  if (lines.length === 0) {
    return (
      <EmptyState
        fullPage
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add some biryani to get started."
        actionLabel="Browse Menu"
        actionTo="/menu"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      <SectionHeading eyebrow="Your Order" title="Cart" align="left" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <Card key={line.itemId} className="overflow-hidden py-0">
              <CardContent className="flex items-center gap-4 p-4">
                <FoodImage
                  itemId={line.itemId}
                  category={line.item.category}
                  alt={line.item.name}
                  className="size-16 shrink-0 rounded-lg"
                  iconClassName="size-6"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{line.item.name}</p>
                  <p className="text-muted-foreground text-xs">{formatCurrency(line.item.price)} each</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() => setQuantity(line.itemId, line.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() => setQuantity(line.itemId, line.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-semibold">{formatCurrency(line.lineTotal)}</span>
                  <button
                    onClick={() => removeItem(line.itemId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${line.item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          <button onClick={clear} className="text-muted-foreground hover:text-destructive w-fit text-xs">
            Clear cart
          </button>
        </div>

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-lg font-semibold">Order Summary</h2>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Items ({totalItems})</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-muted-foreground text-xs">
                Add {formatCurrency(FREE_DELIVERY_THRESHOLD - totalPrice)} more for free delivery
              </p>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
            <Button variant="gold" size="lg" className="mt-2 w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/menu">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur-md lg:hidden">
        <Button variant="gold" size="lg" className="w-full gap-2" onClick={() => navigate('/checkout')}>
          Proceed to Checkout — {formatCurrency(grandTotal)}
        </Button>
      </div>
    </div>
  )
}
