import { OrderStatusBadge } from '@/features/admin/components/OrderStatusBadge'
import { getRelativeTimeLabel } from '@/lib/utils'
import type { Order } from '@/types'

export function OrderTimeline({ orders }: { orders: Order[] }) {
  const recent = [...orders].sort(
    (a, b) => new Date(b.statusUpdatedAt).getTime() - new Date(a.statusUpdatedAt).getTime(),
  )

  if (recent.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No order activity yet.</p>
  }

  return (
    <ol className="flex flex-col gap-4">
      {recent.slice(0, 8).map((order, index) => (
        <li key={order.id} className="relative flex gap-3 pb-4 last:pb-0">
          {index !== recent.slice(0, 8).length - 1 && (
            <span className="bg-border absolute top-3 left-[5px] h-full w-px" />
          )}
          <span className="bg-primary relative mt-1.5 size-2.5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {getRelativeTimeLabel(order.statusUpdatedAt)}
              </span>
            </div>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
