import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bike, IndianRupee, PackageCheck, PackageSearch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/features/admin/components/StatCard'
import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'
import { fetchMyDeliveryOrders, updateMyDeliveryStatus } from '@/lib/api/deliveryApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { DeliveryAssignmentStatus, MyDeliveryOrderDto } from '@/lib/api/types'

/**
 * Rough per-delivery payout estimate for the rider's own earnings widget — not the customer's
 * delivery fee (partner payout isn't order-fee-linked in this model) and not persisted anywhere.
 */
const ESTIMATED_PAYOUT_PER_DELIVERY = 40

function isToday(dateString: string) {
  return new Date(dateString).toDateString() === new Date().toDateString()
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function DeliveryDashboardPage() {
  useDocumentTitle('Delivery Dashboard')
  const { partner } = useDeliveryAuth()
  const [orders, setOrders] = useState<MyDeliveryOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMyDeliveryOrders()
      .then((result) => {
        if (!cancelled) setOrders(result)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load your orders', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  function refresh() {
    setVersion((v) => v + 1)
  }

  if (!partner) return null

  const active = orders.filter((o) => o.status !== 4)
  const completed = orders.filter((o) => o.status === 4)
  const deliveredToday = completed.filter((o) => isToday(o.assignedAt)).length
  const mockEarnings = completed.length * ESTIMATED_PAYOUT_PER_DELIVERY

  async function handleAdvance(orderId: string, next: DeliveryAssignmentStatus) {
    try {
      await updateMyDeliveryStatus(orderId, next)
      toast.success('Delivery status updated')
      refresh()
    } catch (error) {
      toast.error('Could not update delivery status', { description: errorMessage(error) })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome, {partner.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground text-sm">{active.length} active deliveries</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PackageCheck} label="Today's Deliveries" value={String(deliveredToday)} />
        <StatCard icon={Bike} label="Pending Deliveries" value={String(active.length)} accent="gold" />
        <StatCard icon={PackageSearch} label="Completed Deliveries" value={String(completed.length)} />
        <StatCard icon={IndianRupee} label="Mock Earnings" value={formatCurrency(mockEarnings)} accent="gold" />
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading your orders...</p>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 flex flex-col gap-4">
            {active.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No active deliveries"
                description="Orders assigned to you by an admin will show up here."
              />
            ) : (
              active.map((order) => (
                <DeliveryOrderCard key={order.orderId} order={order} onAdvance={handleAdvance} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 flex flex-col gap-4">
            {completed.length === 0 ? (
              <EmptyState icon={PackageSearch} title="No completed deliveries" description="Your delivery history will show up here." />
            ) : (
              completed.slice(0, 20).map((order) => <DeliveryOrderCard key={order.orderId} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
