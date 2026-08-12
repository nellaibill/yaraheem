import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Check, ChefHat, Receipt, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDeliveryPartners } from '@/features/delivery/hooks/useDeliveryPartners'
import { getAssignedPartnerId, setAssignedPartnerId } from '@/features/admin/lib/orderDeliveryAssignmentStore'
import {
  ORDER_STATUS_ALLOWED_TRANSITIONS,
  ORDER_STATUS_META,
  ORDER_STATUS_SEQUENCE,
} from '@/features/tracking/lib/backendOrderStatus'
import { fetchAdminOrders, updateAdminOrderStatus } from '@/lib/api/adminOrdersApi'
import { ApiError } from '@/lib/api/client'
import { cn, formatCurrency } from '@/lib/utils'
import type { BackendOrderStatus, OrderDto } from '@/lib/api/types'

const FILTERABLE_STATUSES: BackendOrderStatus[] = [...ORDER_STATUS_SEQUENCE, 6]

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminOrdersPage() {
  const { partners } = useDeliveryPartners()
  const [statusFilter, setStatusFilter] = useState<BackendOrderStatus | 'all'>('all')
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const [, setAssignmentVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminOrders({ status: statusFilter === 'all' ? undefined : statusFilter })
      .then((result) => {
        if (!cancelled) setOrders(result.items)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load orders', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [statusFilter, version])

  function refresh() {
    setVersion((v) => v + 1)
  }

  async function handleStatusChange(orderId: string, status: BackendOrderStatus) {
    try {
      await updateAdminOrderStatus(orderId, status)
      toast.success(`Order updated to ${ORDER_STATUS_META[status].label}`)
      refresh()
    } catch (error) {
      toast.error('Could not update order status', { description: errorMessage(error) })
    }
  }

  function handleAssignPartner(orderId: string, partnerId: string) {
    setAssignedPartnerId(orderId, partnerId === 'unassigned' ? undefined : partnerId)
    setAssignmentVersion((v) => v + 1)
    toast.success(partnerId === 'unassigned' ? 'Delivery partner unassigned' : 'Delivery partner assigned')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm">{orders.length} orders</p>
        </div>
        <Select
          value={String(statusFilter)}
          onValueChange={(v) => setStatusFilter(v === 'all' ? 'all' : (Number(v) as BackendOrderStatus))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {FILTERABLE_STATUSES.map((status) => (
              <SelectItem key={status} value={String(status)}>
                {ORDER_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-5">
          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
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
                  {orders.map((order) => {
                    const isCancelled = order.status === 6
                    const isPending = order.status === 1
                    const nextOptions = ORDER_STATUS_ALLOWED_TRANSITIONS[order.status].filter((s) => s !== 6)
                    const assignedPartnerId = getAssignedPartnerId(order.id)

                    return (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium whitespace-nowrap">#{order.orderNumber}</td>
                        <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                          +91 {order.shippingAddress.phoneNumber}
                        </td>
                        <td className="text-muted-foreground py-2.5">
                          {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                        </td>
                        <td className="text-muted-foreground py-2.5 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2.5">
                          <Badge variant="outline" className={cn('border', ORDER_STATUS_META[order.status].badgeClassName)}>
                            {ORDER_STATUS_META[order.status].label}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right font-medium whitespace-nowrap">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-2.5 pl-4">
                          {isPending ? (
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={() => handleStatusChange(order.id, 2)}
                              >
                                <Check className="size-3.5" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 gap-1"
                                onClick={() => handleStatusChange(order.id, 6)}
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
                            value={String(order.status)}
                            disabled={isCancelled || nextOptions.length === 0}
                            onValueChange={(v) => handleStatusChange(order.id, Number(v) as BackendOrderStatus)}
                          >
                            <SelectTrigger className="h-8 w-40 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={String(order.status)}>{ORDER_STATUS_META[order.status].label}</SelectItem>
                              {nextOptions.map((status) => (
                                <SelectItem key={status} value={String(status)}>
                                  {ORDER_STATUS_META[status].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2.5 pl-4">
                          <Select
                            value={assignedPartnerId || 'unassigned'}
                            disabled={isCancelled}
                            onValueChange={(v) => handleAssignPartner(order.id, v)}
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
