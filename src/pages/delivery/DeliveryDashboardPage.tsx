import { Bike, IndianRupee, PackageCheck, PackageSearch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/features/admin/components/StatCard'
import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'
import { useDeliveryOrders } from '@/features/delivery/hooks/useDeliveryOrders'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { acceptOrder, updateDeliveryOrderStatus } from '@/features/delivery/lib/deliveryStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import { DELIVERY_FEE } from '@/lib/constants'
import type { Order, OrderStatus } from '@/types'

function isToday(dateString: string) {
  return new Date(dateString).toDateString() === new Date().toDateString()
}

export default function DeliveryDashboardPage() {
  useDocumentTitle('Delivery Dashboard')
  const { partner } = useDeliveryAuth()
  const { assignOrder } = useDeliveryPartners()
  const { assigned, available, completed, refresh } = useDeliveryOrders(partner?.id)

  if (!partner) return null

  const deliveredToday = completed.filter((o) => isToday(o.statusUpdatedAt)).length
  const mockEarnings = completed.length * DELIVERY_FEE

  function handleAccept(order: Order) {
    acceptOrder(order, partner!.id)
    assignOrder(partner!.id, order.id)
    refresh()
  }

  function handleAdvance(order: Order, next: OrderStatus) {
    updateDeliveryOrderStatus(order, next)
    if (next === 'delivered') assignOrder(partner!.id, undefined)
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome, {partner.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground text-sm">
          {assigned.length} active · {available.length} available nearby
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PackageCheck} label="Today's Deliveries" value={String(deliveredToday)} />
        <StatCard icon={Bike} label="Pending Deliveries" value={String(assigned.length)} accent="gold" />
        <StatCard icon={PackageSearch} label="Completed Deliveries" value={String(completed.length)} />
        <StatCard icon={IndianRupee} label="Mock Earnings" value={formatCurrency(mockEarnings)} accent="gold" />
      </div>

      <Tabs defaultValue="assigned">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="assigned">Assigned ({assigned.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4 flex flex-col gap-4">
          {assigned.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No active deliveries"
              description="Check the Available tab for new orders."
            />
          ) : (
            assigned.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} mode="assigned" onAdvance={handleAdvance} />
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4 flex flex-col gap-4">
          {available.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No orders ready" description="Nothing available for pickup right now." />
          ) : (
            available.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} mode="available" onAccept={handleAccept} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 flex flex-col gap-4">
          {completed.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No completed deliveries" description="Your delivery history will show up here." />
          ) : (
            completed.slice(0, 20).map((order) => <DeliveryOrderCard key={order.id} order={order} mode="completed" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
