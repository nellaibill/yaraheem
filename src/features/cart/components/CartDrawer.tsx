import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { SITE } from '@/lib/constants'

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { lines, totalItems, totalPrice, setQuantity, removeItem, clear } = useCart()
  const navigate = useNavigate()

  function handleCheckout() {
    onOpenChange(false)
    navigate('/checkout')
  }

  function handleWhatsAppOrder() {
    if (lines.length === 0) return
    const summary = lines.map((line) => `${line.quantity}x ${line.item.name}`).join(', ')
    const message = encodeURIComponent(
      `Hello Ya Raheem Catering, I'd like to place an order: ${summary}. Estimated total ${formatCurrency(totalPrice)}.`,
    )
    window.open(`https://wa.me/${SITE.whatsapp}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-gold" />
            Your Order ({totalItems})
          </SheetTitle>
          <SheetDescription>Items are saved locally in your browser.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-sm">
              <ShoppingBag className="size-8 opacity-40" />
              Your bag is empty. Add some biryani!
            </div>
          ) : (
            <ul className="flex flex-col divide-y">
              {lines.map((line) => (
                <li key={line.itemId} className="flex items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.item.name}</p>
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
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <SheetFooter className="border-t px-4 pt-4">
            <div className="mb-2 flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <Button variant="gold" size="lg" className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full" onClick={handleWhatsAppOrder}>
              Order via WhatsApp instead
            </Button>
            <Button variant="ghost" className="w-full" onClick={clear}>
              Clear order
            </Button>
          </SheetFooter>
        )}
        {lines.length === 0 && <Separator />}
      </SheetContent>
    </Sheet>
  )
}
