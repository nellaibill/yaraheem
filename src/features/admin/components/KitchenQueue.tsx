import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_META } from '@/features/tracking/lib/backendOrderStatus'
import { cn } from '@/lib/utils'
import type { BackendOrderStatus, OrderDto } from '@/lib/api/types'

const NEXT_KITCHEN_STATUS: Partial<Record<BackendOrderStatus, BackendOrderStatus>> = {
  2: 3, // Confirmed -> Processing
  3: 4, // Processing -> Shipped (kitchen's "ready for pickup")
}

const NEXT_LABEL: Partial<Record<BackendOrderStatus, string>> = {
  2: 'Start Preparing',
  3: 'Mark Ready',
}

export function KitchenQueue({
  orders,
  onAdvance,
}: {
  orders: OrderDto[]
  onAdvance: (orderId: string, next: BackendOrderStatus) => void
}) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Kitchen queue is clear — no orders cooking right now.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
        const next = NEXT_KITCHEN_STATUS[order.status]
        return (
          <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">#{order.orderNumber}</p>
              <p className="text-muted-foreground text-xs">{itemCount} items</p>
            </div>
            <Badge variant="outline" className={cn('border', ORDER_STATUS_META[order.status].badgeClassName)}>
              {ORDER_STATUS_META[order.status].label}
            </Badge>
            {next && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 shrink-0 gap-1.5 text-xs"
                onClick={() => onAdvance(order.id, next)}
              >
                <ChefHat className="size-3.5" />
                {NEXT_LABEL[order.status]}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
