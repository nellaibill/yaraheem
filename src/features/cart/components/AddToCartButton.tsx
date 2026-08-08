import { useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/features/cart/hooks/useCart'
import { cn } from '@/lib/utils'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

/**
 * Swiggy/Zomato-style add-to-cart control: a prominent full-width ADD button
 * that morphs into a quantity stepper the instant an item is in the cart.
 */
export function AddToCartButton({
  itemId,
  itemName,
  className,
  size = 'default',
}: {
  itemId: string
  itemName: string
  className?: string
  size?: 'default' | 'sm'
}) {
  const { lines, addItem, setQuantity } = useCart()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const quantity = lines.find((line) => line.itemId === itemId)?.quantity ?? 0
  // Both sizes stay >= 44px tall — Swiggy/Zomato-style tap targets, never smaller.
  const heightClass = size === 'sm' ? 'h-11' : 'h-12'

  function spawnRipple(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const rippleSize = Math.max(rect.width, rect.height) * 1.4
    const ripple: Ripple = {
      id: Date.now() + Math.random(),
      x: event.clientX - rect.left - rippleSize / 2,
      y: event.clientY - rect.top - rippleSize / 2,
      size: rippleSize,
    }
    setRipples((prev) => [...prev, ripple])
    window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 650)
  }

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    spawnRipple(event)
    addItem(itemId, 1)
    toast.success('Added to Cart', { description: itemName })
  }

  return (
    <div className={cn('relative', heightClass, className)} onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="popLayout" initial={false}>
        {quantity === 0 ? (
          <motion.button
            key="add"
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={handleAdd}
            className={cn(
              'bg-gold text-gold-foreground relative flex w-full min-w-[6.5rem] items-center justify-center gap-1.5 overflow-hidden rounded-lg text-sm font-bold tracking-wide shadow-sm transition-transform active:scale-[0.96]',
              heightClass,
            )}
            aria-label={`Add ${itemName} to cart`}
          >
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ opacity: 0.35, scale: 0 }}
                animate={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="pointer-events-none absolute rounded-full bg-white"
                style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
              />
            ))}
            <Plus className="size-4" />
            ADD
          </motion.button>
        ) : (
          <motion.div
            key="stepper"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'bg-gold text-gold-foreground flex w-full min-w-[6.5rem] items-center justify-between rounded-lg text-sm font-bold shadow-sm',
              heightClass,
            )}
          >
            <button
              type="button"
              onClick={() => setQuantity(itemId, quantity - 1)}
              className="flex h-full flex-1 items-center justify-center transition-transform active:scale-90"
              aria-label={`Decrease ${itemName} quantity`}
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-6 text-center text-base tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(itemId, quantity + 1)}
              className="flex h-full flex-1 items-center justify-center transition-transform active:scale-90"
              aria-label={`Increase ${itemName} quantity`}
            >
              <Plus className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
