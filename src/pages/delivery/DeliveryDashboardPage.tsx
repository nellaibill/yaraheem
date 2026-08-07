import { PackageSearch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'
import { useDeliveryOrders } from '@/features/delivery/hooks/useDeliveryOrders'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { acceptOrder, updateDeliveryOrderStatus } from '@/features/delivery/lib/deliveryStore'
import type { Order, OrderStatus } from '@/types'

export default function DeliveryDashboardPage() {
  const { partner } = useDeliveryAuth()
  const { assignOrder } = useDeliveryPartners()
  const { assigned, available, completed, refresh } = useDeliveryOrders(partner?.id)

  if (!partner) return null

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

      <Tabs defaultValue="assigned">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="assigned">Assigned ({assigned.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4 flex flex-col gap-4">
          {assigned.length === 0 ? (
            <EmptyState message="No active deliveries. Check the Available tab for new orders." />
          ) : (
            assigned.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} mode="assigned" onAdvance={handleAdvance} />
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4 flex flex-col gap-4">
          {available.length === 0 ? (
            <EmptyState message="No orders ready for pickup right now." />
          ) : (
            available.map((order) => (
              <DeliveryOrderCard key={order.id} order={order} mode="available" onAccept={handleAccept} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 flex flex-col gap-4">
          {completed.length === 0 ? (
            <EmptyState message="No completed deliveries yet." />
          ) : (
            completed.slice(0, 20).map((order) => <DeliveryOrderCard key={order.id} order={order} mode="completed" />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <PackageSearch className="text-muted-foreground size-10" strokeWidth={1.5} />
      <p className="text-muted-foreground max-w-xs text-sm">{message}</p>
    </div>
  )
}
