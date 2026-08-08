import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/features/admin/components/OrderStatusBadge'
import type { Order, OrderStatus } from '@/types'

const NEXT_KITCHEN_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  accepted: 'preparing',
  preparing: 'ready',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  accepted: 'Start Preparing',
  preparing: 'Mark Ready',
}

export function KitchenQueue({
  orders,
  onAdvance,
}: {
  orders: Order[]
  onAdvance: (mobile: string, orderId: string, next: OrderStatus) => void
}) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Kitchen queue is clear — no orders cooking right now.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const itemCount = order.lines.reduce((sum, l) => sum + l.quantity, 0)
        const next = NEXT_KITCHEN_STATUS[order.status]
        return (
          <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-muted-foreground text-xs">{itemCount} items</p>
            </div>
            <OrderStatusBadge status={order.status} />
            {next && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 shrink-0 gap-1.5 text-xs"
                onClick={() => onAdvance(order.mobile, order.id, next)}
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
