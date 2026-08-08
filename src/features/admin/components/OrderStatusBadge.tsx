import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  preparing: 'bg-amber-100 text-amber-700 border-amber-200',
  ready: 'bg-orange-100 text-orange-700 border-orange-200',
  picked_up: 'bg-purple-100 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={cn('border', STATUS_STYLES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
