import { useState } from 'react'
import { toast } from 'sonner'
import { Bike, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatusBadge } from '@/features/admin/components/OrderStatusBadge'
import { MockMapDialog } from '@/features/delivery/components/MockMapDialog'
import { getCustomerName } from '@/features/delivery/lib/deliveryStore'
import { formatCurrency } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  ready: { label: 'Mark Picked Up', next: 'picked_up' },
  picked_up: { label: 'Start Delivery', next: 'out_for_delivery' },
  out_for_delivery: { label: 'Mark Delivered', next: 'delivered' },
}

export function DeliveryOrderCard({
  order,
  mode,
  onAccept,
  onAdvance,
}: {
  order: Order
  mode: 'available' | 'assigned' | 'completed'
  onAccept?: (order: Order) => void
  onAdvance?: (order: Order, next: OrderStatus) => void
}) {
  const [mapOpen, setMapOpen] = useState(false)
  const customerName = getCustomerName(order.mobile)
  const action = NEXT_ACTION[order.status]
  const itemCount = order.lines.reduce((sum, l) => sum + l.quantity, 0)

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{customerName}</p>
            <p className="text-muted-foreground text-xs">
              Order #{order.id.slice(0, 8).toUpperCase()} · {itemCount} items
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="text-muted-foreground flex items-start gap-1.5 text-xs">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city} -{' '}
            {order.address.pincode}
          </span>
        </div>

        <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>

        <div className="flex flex-wrap gap-2">
          {mode !== 'completed' && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={`tel:+91${order.mobile}`}>
                  <Phone className="size-3.5" />
                  Call Customer
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setMapOpen(true)}>
                <MapPin className="size-3.5" />
                View Location
              </Button>
            </>
          )}
        </div>

        {mode === 'available' && onAccept && (
          <Button
            variant="gold"
            className="gap-1.5"
            onClick={() => {
              onAccept(order)
              toast.success('Order accepted')
            }}
          >
            <Bike className="size-4" />
            Accept Order
          </Button>
        )}

        {mode === 'assigned' && action && onAdvance && (
          <Button
            variant="gold"
            className="gap-1.5"
            onClick={() => {
              onAdvance(order, action.next)
              toast.success(`Order marked "${action.label}"`)
            }}
          >
            <Bike className="size-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
      <MockMapDialog open={mapOpen} onOpenChange={setMapOpen} address={order.address} />
    </Card>
  )
}
