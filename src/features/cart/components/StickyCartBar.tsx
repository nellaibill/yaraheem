import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency } from '@/lib/utils'

/** Mobile-only sticky bar so checkout is always one thumb-tap away once the cart isn't empty. */
export function StickyCartBar({ hidden }: { hidden?: boolean }) {
  const { totalItems, totalPrice } = useCart()
  const navigate = useNavigate()
  const visible = !hidden && totalItems > 0

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
        >
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="bg-primary text-primary-foreground flex h-14 w-full items-center justify-between rounded-xl px-4 shadow-lg active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="bg-primary-foreground/15 flex size-8 items-center justify-center rounded-full">
                <ShoppingBag className="size-4" />
              </span>
              {totalItems} item{totalItems === 1 ? '' : 's'} · {formatCurrency(totalPrice)}
            </span>
            <span className="text-sm font-bold tracking-wide">View Cart</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
