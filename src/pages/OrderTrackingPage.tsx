import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, PackageSearch, Phone, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageLoader } from '@/components/common/PageLoader'
import { BackendStatusTimeline } from '@/features/tracking/components/BackendStatusTimeline'
import { ORDER_STATUS_META } from '@/features/tracking/lib/backendOrderStatus'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ensureBackendSession } from '@/lib/api/authBridge'
import { fetchOrder, fetchOrderTracking } from '@/lib/api/ordersApi'
import type { OrderDto, OrderTrackingResponse } from '@/lib/api/types'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import { SITE } from '@/lib/constants'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDto | null>(null)
  const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  useDocumentTitle(order ? `Order #${order.orderNumber}` : 'Order')

  useEffect(() => {
    if (!id || !user) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    ensureBackendSession(user.mobile, user.name)
      .then(() => Promise.all([fetchOrder(id), fetchOrderTracking(id)]))
      .then(([orderResult, trackingResult]) => {
        if (cancelled) return
        setOrder(orderResult)
        setTracking(trackingResult)
      })
      .catch((error) => {
        console.error('Failed to load order.', error)
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, user])

  if (loading) return <PageLoader />

  if (notFound || !order || !tracking) {
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

  const isDelivered = order.status === 5
  const isCancelled = order.status === 6
  const address = order.shippingAddress

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
          ) : isCancelled ? (
            <p className="text-3xl">⚠️</p>
          ) : null}
        </motion.div>
        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
          {isDelivered ? 'Delivered! Enjoy your meal.' : isCancelled ? 'Order Cancelled' : ORDER_STATUS_META[order.status].label}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Order #{order.orderNumber}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <BackendStatusTimeline status={order.status} timeline={tracking.timeline} />
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
              {address.fullName} — {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} -{' '}
              {address.postalCode}
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
            {order.items.map((item) => (
              <div key={item.id} className="text-muted-foreground flex justify-between text-xs">
                <span>
                  {item.quantity} × {item.productName}
                </span>
                <span>{formatCurrency(item.lineTotal)}</span>
              </div>
            ))}
            <Separator className="my-1" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link to="/profile">View All Orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/print/invoice/${order.id}`} target="_blank" rel="noopener noreferrer">
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
