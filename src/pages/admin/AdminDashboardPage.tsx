import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Bike, ClipboardCheck, IndianRupee, PackageX, Receipt, TrendingUp, Users, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/features/admin/components/StatCard'
import { RevenueChart } from '@/features/admin/components/RevenueChart'
import { OrdersChart } from '@/features/admin/components/OrdersChart'
import { TopSellingList } from '@/features/admin/components/TopSellingList'
import { KitchenQueue } from '@/features/admin/components/KitchenQueue'
import { OrderTimeline } from '@/features/admin/components/OrderTimeline'
import { QuickActions } from '@/features/admin/components/QuickActions'
import { ORDER_STATUS_META } from '@/features/tracking/lib/backendOrderStatus'
import {
  getAverageOrderValue,
  getKitchenQueue,
  getPendingOrdersCount,
  getCompletedOrdersCount,
  getCancelledOrdersCount,
  getPopularCombos,
  getRevenueByDay,
  getTodayOrders,
  getTodayRevenue,
  getTopSellingItems,
} from '@/features/admin/lib/backendAnalytics'
import { fetchAdminOrders, updateAdminOrderStatus } from '@/lib/api/adminOrdersApi'
import { fetchAdminCustomers } from '@/lib/api/adminCustomersApi'
import { fetchAdminDeliveryPartners } from '@/lib/api/adminDeliveryApi'
import { ApiError } from '@/lib/api/client'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency, cn } from '@/lib/utils'
import type { BackendOrderStatus, CustomerSummaryDto, DeliveryPartnerDto, OrderDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard')
  const { items: menuItems } = useMenuData()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [customers, setCustomers] = useState<CustomerSummaryDto[]>([])
  const [partners, setPartners] = useState<DeliveryPartnerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchAdminOrders({ pageSize: 100 }), fetchAdminCustomers(), fetchAdminDeliveryPartners()])
      .then(([orderResult, customerResult, partnerResult]) => {
        if (cancelled) return
        setOrders(orderResult.items)
        setCustomers(customerResult)
        setPartners(partnerResult)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load dashboard data', { description: errorMessage(error) })
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

  const todayOrders = getTodayOrders(orders)
  const todayRevenue = getTodayRevenue(orders)
  const avgOrderValue = getAverageOrderValue(orders)
  const revenueByDay = getRevenueByDay(orders)
  const topSelling = getTopSellingItems(orders)
  const popularCombos = getPopularCombos(orders, menuItems)
  const kitchenQueue = getKitchenQueue(orders)
  const activePartners = partners.filter((p) => p.status !== 3).length
  const recentOrders = orders.slice(0, 6)

  async function handleKitchenAdvance(orderId: string, next: BackendOrderStatus) {
    try {
      await updateAdminOrderStatus(orderId, next)
      toast.success('Kitchen status updated')
      refresh()
    } catch (error) {
      toast.error('Could not update order', { description: errorMessage(error) })
    }
  }

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Loading dashboard...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of today's performance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's Revenue" value={formatCurrency(todayRevenue)} accent="gold" />
        <StatCard icon={Receipt} label="Today's Orders" value={String(todayOrders.length)} />
        <StatCard icon={ClipboardCheck} label="Pending Orders" value={String(getPendingOrdersCount(orders))} accent="gold" />
        <StatCard icon={Receipt} label="Completed Orders" value={String(getCompletedOrdersCount(orders))} />
        <StatCard icon={XCircle} label="Cancelled Orders" value={String(getCancelledOrdersCount(orders))} />
        <StatCard icon={Bike} label="Active Delivery Partners" value={String(activePartners)} accent="gold" />
        <StatCard icon={Users} label="Total Customers" value={String(customers.length)} />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={formatCurrency(avgOrderValue)} />
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-display mb-3 text-base font-semibold">Quick Actions</h2>
          <QuickActions />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Revenue — Last 7 Days</h2>
            <RevenueChart data={revenueByDay} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Orders — Last 7 Days</h2>
            <OrdersChart data={revenueByDay} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Best Selling Menu</h2>
            <TopSellingList items={topSelling} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Popular Combos</h2>
            {popularCombos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No combo orders yet.</p>
            ) : (
              <TopSellingList items={popularCombos} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 flex items-center gap-2 text-base font-semibold">
              <PackageX className="size-4" />
              Kitchen Queue
            </h2>
            <KitchenQueue orders={kitchenQueue} onAdvance={handleKitchenAdvance} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Order Timeline</h2>
            <OrderTimeline orders={orders} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">#{order.orderNumber}</td>
                      <td className="text-muted-foreground py-2.5">+91 {order.shippingAddress.phoneNumber}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={cn('border', ORDER_STATUS_META[order.status].badgeClassName)}>
                          {ORDER_STATUS_META[order.status].label}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
