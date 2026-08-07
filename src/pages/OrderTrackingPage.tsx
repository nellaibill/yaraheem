import { Link, useParams } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrders } from '@/features/checkout/hooks/useOrders'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { getOrder } = useOrders()
  const order = id ? getOrder(id) : undefined

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <PackageSearch className="text-muted-foreground size-14" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold">Order not found</h1>
        <p className="text-muted-foreground">We couldn't find this order in your history.</p>
        <Button asChild variant="gold">
          <Link to="/menu">Back to Menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Order Confirmed</h1>
      <p className="text-muted-foreground mt-2">
        Order #{order.id.slice(0, 8).toUpperCase()} — {ORDER_STATUS_LABELS[order.status]}
      </p>
      <p className="mt-4 font-semibold">{formatCurrency(order.total)}</p>
    </div>
  )
}
