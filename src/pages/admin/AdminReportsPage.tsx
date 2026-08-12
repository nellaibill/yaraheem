import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { RevenueChart } from '@/features/admin/components/RevenueChart'
import { TopSellingList } from '@/features/admin/components/TopSellingList'
import { ORDER_STATUS_META, ORDER_STATUS_SEQUENCE } from '@/features/tracking/lib/backendOrderStatus'
import {
  getPaymentMethodBreakdown,
  getRevenueByDay,
  getStatusBreakdown,
  getTopSellingItems,
} from '@/features/admin/lib/backendAnalytics'
import { fetchAdminOrders } from '@/lib/api/adminOrdersApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { BackendOrderStatus, OrderDto } from '@/lib/api/types'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
}

function BreakdownBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} ({percent}%)
        </span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function AdminReportsPage() {
  useDocumentTitle('Reports')
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAdminOrders({ pageSize: 100 })
      .then((result) => {
        if (!cancelled) setOrders(result.items)
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error('Could not load reports', {
            description: error instanceof ApiError ? error.message : 'Something went wrong.',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const revenueByDay = getRevenueByDay(orders, 14)
  const topSelling = getTopSellingItems(orders, 8)
  const paymentBreakdown = getPaymentMethodBreakdown(orders)
  const statusBreakdown = getStatusBreakdown(orders)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  const paymentColors: Record<string, string> = {
    COD: 'bg-primary',
    ONLINE: 'bg-gold',
  }

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Loading reports...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} orders · {formatCurrency(totalRevenue)} lifetime revenue
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-display mb-4 text-base font-semibold">Revenue — Last 14 Days</h2>
          <RevenueChart data={revenueByDay} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display mb-4 text-base font-semibold">Top Selling Foods</h2>
            <TopSellingList items={topSelling} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <h2 className="font-display mb-1 text-base font-semibold">Payment Methods</h2>
              {Object.keys(PAYMENT_METHOD_LABELS).map((method) => (
                <BreakdownBar
                  key={method}
                  label={PAYMENT_METHOD_LABELS[method]}
                  count={paymentBreakdown[method] ?? 0}
                  total={orders.length}
                  color={paymentColors[method]}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <h2 className="font-display mb-1 text-base font-semibold">Order Status</h2>
              {[...ORDER_STATUS_SEQUENCE, 6 as BackendOrderStatus].map((status) => (
                <BreakdownBar
                  key={status}
                  label={ORDER_STATUS_META[status].label}
                  count={statusBreakdown[status]}
                  total={orders.length}
                  color="bg-primary"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
