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
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  'absolute top-9 left-[19px] h-full w-0.5 -translate-x-1/2',
                  isComplete ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
            <span className="relative shrink-0">
              {isCurrent && step !== 'delivered' && (
                <motion.span
                  className="bg-primary/40 absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <span
                className={cn(
                  'relative flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                  isComplete && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-gold border-gold text-gold-foreground',
                  !isComplete && !isCurrent && 'bg-muted border-border text-muted-foreground',
                )}
              >
                <Icon className="size-4.5" />
              </span>
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
          </li>
        )
      })}
    </ol>
  )
}
