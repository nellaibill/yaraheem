import { Bike, MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { DeliveryAssignmentStatus, MyDeliveryOrderDto } from '@/lib/api/types'

const STATUS_LABELS: Record<DeliveryAssignmentStatus, string> = {
  1: 'Assigned',
  2: 'Picked Up',
  3: 'Out for Delivery',
  4: 'Delivered',
}

const NEXT_ACTION: Partial<Record<DeliveryAssignmentStatus, { label: string; next: DeliveryAssignmentStatus }>> = {
  1: { label: 'Mark Picked Up', next: 2 },
  2: { label: 'Start Delivery', next: 3 },
  3: { label: 'Mark Delivered', next: 4 },
}

export function DeliveryOrderCard({
  order,
  onAdvance,
}: {
  order: MyDeliveryOrderDto
  onAdvance?: (orderId: string, next: DeliveryAssignmentStatus) => void
}) {
  const action = NEXT_ACTION[order.status]
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const fullAddress = `${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ''}, ${order.city}, ${order.state} - ${order.postalCode}`

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{order.customerName}</p>
            <p className="text-muted-foreground text-xs">
              Order #{order.orderNumber} · {itemCount} items
            </p>
          </div>
          <Badge variant={order.status === 4 ? 'secondary' : 'gold'}>{STATUS_LABELS[order.status]}</Badge>
        </div>

        <div className="text-muted-foreground flex items-start gap-1.5 text-xs">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span>{fullAddress}</span>
        </div>

        <p className="text-sm font-semibold">{formatCurrency(order.total)}</p>

        {order.status !== 4 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`tel:+91${order.customerPhone}`}>
                <Phone className="size-3.5" />
                Call Customer
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-3.5" />
                Navigate
              </a>
            </Button>
          </div>
        )}

        {action && onAdvance && (
          <Button variant="gold" className="gap-1.5" onClick={() => onAdvance(order.orderId, action.next)}>
            <Bike className="size-4" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
