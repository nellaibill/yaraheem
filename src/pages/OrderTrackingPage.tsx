import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, FastForward, MapPin, PackageSearch, Phone, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusTimeline } from '@/features/tracking/components/StatusTimeline'
import { EmptyState } from '@/components/common/EmptyState'
import { useOrders } from '@/features/checkout/hooks/useOrders'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, SITE } from '@/lib/constants'

const AUTO_ADVANCE_MS = 5000

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { getOrder, advanceStatus } = useOrders()
  const order = id ? getOrder(id) : undefined
  const [now, setNow] = useState(() => Date.now())
  useDocumentTitle(order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : 'Order Not Found')

  const isDelivered = order?.status === 'delivered'

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!order || isDelivered) return
    const timer = setInterval(() => advanceStatus(order.id), AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [order, isDelivered, advanceStatus])

  if (!order) {
    return (
      <EmptyState
        fullPage
        icon={PackageSearch}
        title="Order not found"
        description="We couldn't find this order in your history."
        actionLabel="Back to Menu"
        actionTo="/menu"
      />
    )
  }

  const elapsedMs = now - new Date(order.createdAt).getTime()
  const remainingMinutes = Math.max(
    order.estimatedDeliveryMinutes - Math.floor(elapsedMs / 60000),
    0,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {isDelivered ? (
            <p className="text-3xl">🎉</p>
          ) : (
            <span className="bg-secondary text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium">
              <Clock className="size-3.5" />
              {remainingMinutes > 0 ? `Estimated delivery in ${remainingMinutes} min` : 'Arriving any moment'}
            </span>
          )}
        </motion.div>
        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
          {isDelivered ? 'Delivered! Enjoy your meal.' : ORDER_STATUS_LABELS[order.status]}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <StatusTimeline status={order.status} />
          {!isDelivered && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground mt-2 gap-1.5"
              onClick={() => advanceStatus(order.id)}
            >
              <FastForward className="size-3.5" />
              Simulate next step (demo)
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4" />
              Delivering To
            </h2>
            <p className="text-muted-foreground text-sm">
              {order.address.label} — {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city},{' '}
              {order.address.state} - {order.address.pincode}
            </p>
            <Separator />
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="size-4" />
              Need Help?
            </h2>
            <a href={`tel:${SITE.phone}`} className="text-primary text-sm font-medium">
              {SITE.phone}
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
              <Receipt className="size-4" />
              Order Summary
            </h2>
            {order.lines.map((line) => (
              <div key={line.itemId} className="text-muted-foreground flex justify-between text-xs">
                <span>
                  {line.quantity} × {line.name}
                </span>
                <span>{formatCurrency(line.price * line.quantity)}</span>
              </div>
            ))}
            <Separator className="my-1" />
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-green-700">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Paid via {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/profile">View All Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/print/invoice/${order.id}`} target="_blank">
            Print Invoice
          </Link>
        </Button>
        <Button asChild variant="gold">
          <Link to="/menu">Order Again</Link>
        </Button>
      </div>
    </div>
  )
}
