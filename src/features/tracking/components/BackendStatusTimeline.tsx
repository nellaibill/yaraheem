import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { ORDER_STATUS_META, ORDER_STATUS_SEQUENCE } from '@/features/tracking/lib/backendOrderStatus'
import { cn } from '@/lib/utils'
import type { BackendOrderStatus, OrderTrackingEventDto } from '@/lib/api/types'

/** Live-backend counterpart to StatusTimeline — driven by the real 5-step OrderStatus enum. */
export function BackendStatusTimeline({
  status,
  timeline,
}: {
  status: BackendOrderStatus
  timeline: OrderTrackingEventDto[]
}) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status)
  const timestampFor = (step: BackendOrderStatus) => timeline.find((event) => event.status === step)?.timestamp

  if (status === 6) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-destructive/30 bg-destructive/5 flex items-center gap-3 rounded-xl border p-4"
      >
        <span className="bg-destructive text-destructive-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
          <XCircle className="size-4.5" />
        </span>
        <div>
          <p className="text-destructive text-sm font-semibold">Order Cancelled</p>
          <p className="text-muted-foreground text-xs">This order was cancelled and will not be delivered.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <ol className="relative flex flex-col gap-0">
      {ORDER_STATUS_SEQUENCE.map((step, index) => {
        const meta = ORDER_STATUS_META[step]
        const Icon = meta.icon
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === ORDER_STATUS_SEQUENCE.length - 1
        const timestamp = timestampFor(step)

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
              {isCurrent && (
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
              <p className={cn('text-sm font-semibold', isCurrent && 'text-gold-foreground')}>{meta.label}</p>
              {timestamp && (isComplete || isCurrent) && (
                <p className="text-muted-foreground text-xs">
                  {new Date(timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
