import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, ChefHat, Receipt, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderStatusBadge } from '@/features/admin/components/OrderStatusBadge'
import { useAdminData } from '@/features/admin/hooks/useAdminData'
import { assignDeliveryPartnerGlobal, updateOrderStatusGlobal } from '@/features/admin/lib/adminStore'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { formatCurrency } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE } from '@/lib/constants'
import type { OrderStatus } from '@/types'

const FILTERABLE_STATUSES: OrderStatus[] = [...ORDER_STATUS_SEQUENCE, 'cancelled']

export default function AdminOrdersPage() {
  const { orders, refresh } = useAdminData()
  const { partners } = useDeliveryPartners()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)

  function handleStatusChange(mobile: string, orderId: string, status: OrderStatus) {
    updateOrderStatusGlobal(mobile, orderId, status)
    refresh()
    toast.success(`Order updated to ${ORDER_STATUS_LABELS[status]}`)
  }

  function handleAccept(mobile: string, orderId: string) {
    updateOrderStatusGlobal(mobile, orderId, 'accepted')
    refresh()
    toast.success('Order accepted')
  }

  function handleReject(mobile: string, orderId: string) {
    updateOrderStatusGlobal(mobile, orderId, 'cancelled')
    refresh()
    toast.error('Order rejected')
  }

  function handleAssignPartner(mobile: string, orderId: string, partnerId: string) {
    assignDeliveryPartnerGlobal(mobile, orderId, partnerId === 'unassigned' ? undefined : partnerId)
    refresh()
    toast.success(partnerId === 'unassigned' ? 'Delivery partner unassigned' : 'Delivery partner assigned')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {FILTERABLE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-5">
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No orders match this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                    <th className="pb-2 pl-4 font-medium">Accept / Reject</th>
                    <th className="pb-2 pl-4 font-medium">Update Status</th>
                    <th className="pb-2 pl-4 font-medium">Delivery Partner</th>
                    <th className="pb-2 pl-4 font-medium">Print</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const isCancelled = order.status === 'cancelled'
                    const isPlaced = order.status === 'placed'
                    return (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium whitespace-nowrap">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="text-muted-foreground py-2.5 whitespace-nowrap">+91 {order.mobile}</td>
                        <td className="text-muted-foreground py-2.5">
                          {order.lines.reduce((sum, l) => sum + l.quantity, 0)} items
                        </td>
                        <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2.5">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-2.5 text-right font-medium whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-2.5 pl-4">
                          {isPlaced ? (
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={() => handleAccept(order.mobile, order.id)}
                              >
                                <Check className="size-3.5" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 gap-1"
                                onClick={() => handleReject(order.mobile, order.id)}
                              >
                                <X className="size-3.5" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-4">
                          <Select
                            value={order.status}
                            disabled={isCancelled}
                            onValueChange={(v) => handleStatusChange(order.mobile, order.id, v as OrderStatus)}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUS_SEQUENCE.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {ORDER_STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2.5 pl-4">
                          <Select
                            value={order.deliveryPartnerId || 'unassigned'}
                            disabled={isCancelled}
                            onValueChange={(v) => handleAssignPartner(order.mobile, order.id, v)}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {partners.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2.5 pl-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Print KOT" asChild>
                              <Link to={`/print/kot/${order.id}`} target="_blank" rel="noopener noreferrer">
                                <ChefHat className="size-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" aria-label="Print invoice" asChild>
                              <Link to={`/print/invoice/${order.id}`} target="_blank" rel="noopener noreferrer">
                                <Receipt className="size-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
