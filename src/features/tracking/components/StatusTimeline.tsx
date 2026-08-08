import { motion } from 'framer-motion'
import {
  Bike,
  ChefHat,
  CheckCircle2,
  ClipboardCheck,
  CookingPot,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  placed: ClipboardCheck,
  accepted: ChefHat,
  preparing: CookingPot,
  ready: PackageCheck,
  picked_up: Bike,
  out_for_delivery: Bike,
  delivered: CheckCircle2,
}

export function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status)

  return (
    <ol className="relative flex flex-col gap-0">
      {ORDER_STATUS_SEQUENCE.map((step, index) => {
        const Icon = STATUS_ICONS[step]
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === ORDER_STATUS_SEQUENCE.length - 1

        return (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span className="absolute top-9 left-[19px] h-full w-0.5 -translate-x-1/2 overflow-hidden bg-border">
                <motion.span
                  className="bg-primary block w-full origin-top"
                  initial={false}
                  animate={{ scaleY: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%' }}
                />
              </span>
            )}
            <span className="relative shrink-0">
              {isCurrent && step !== 'delivered' && (
                <motion.span
                  className="bg-primary/40 absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.span
                key={`${step}-${isComplete}-${isCurrent}`}
                initial={{ scale: 0.7, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className={cn(
                  'relative flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                  isComplete && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-gold border-gold text-gold-foreground',
                  !isComplete && !isCurrent && 'bg-muted border-border text-muted-foreground',
                )}
              >
                <Icon className="size-4.5" />
              </motion.span>
            </span>
            <div className={cn('pt-1.5', !isComplete && !isCurrent && 'opacity-50')}>
              <p className={cn('text-sm font-semibold', isCurrent && 'text-gold-foreground')}>
                {ORDER_STATUS_LABELS[step]}
              </p>
              {isCurrent && (
                <p className="text-muted-foreground text-xs">
                  {step === 'delivered' ? 'Completed' : 'In progress...'}
                </p>
              )}
              {isComplete && <p className="text-muted-foreground text-xs">Completed</p>}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
