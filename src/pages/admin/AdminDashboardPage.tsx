import { Link } from 'react-router-dom'
import { IndianRupee, Receipt, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/features/admin/components/StatCard'
import { RevenueChart } from '@/features/admin/components/RevenueChart'
import { TopSellingList } from '@/features/admin/components/TopSellingList'
import { OrderStatusBadge } from '@/features/admin/components/OrderStatusBadge'
import { useAdminData } from '@/features/admin/hooks/useAdminData'
import {
  getAverageOrderValue,
  getRevenueByDay,
  getTodayOrders,
  getTodayRevenue,
  getTopSellingItems,
} from '@/features/admin/lib/analytics'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { orders, customers } = useAdminData()

  const todayOrders = getTodayOrders(orders)
  const todayRevenue = getTodayRevenue(orders)
  const avgOrderValue = getAverageOrderValue(orders)
  const revenueByDay = getRevenueByDay(orders)
  const topSelling = getTopSellingItems(orders)
  const recentOrders = orders.slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of today's performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's Revenue" value={formatCurrency(todayRevenue)} accent="gold" />
        <StatCard icon={Receipt} label="Today's Orders" value={String(todayOrders.length)} />
        <StatCard icon={Users} label="Total Customers" value={String(customers.length)} />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={formatCurrency(avgOrderValue)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Revenue — Last 7 Days</h2>
            <RevenueChart data={revenueByDay} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Top Selling Foods</h2>
            <TopSellingList items={topSelling} />
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
                      <td className="py-2.5 font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="text-muted-foreground py-2.5">+91 {order.mobile}</td>
                      <td className="py-2.5">
                        <OrderStatusBadge status={order.status} />
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
