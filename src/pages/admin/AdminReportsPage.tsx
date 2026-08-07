import { Card, CardContent } from '@/components/ui/card'
import { RevenueChart } from '@/features/admin/components/RevenueChart'
import { TopSellingList } from '@/features/admin/components/TopSellingList'
import { useAdminData } from '@/features/admin/hooks/useAdminData'
import {
  getPaymentMethodBreakdown,
  getRevenueByDay,
  getStatusBreakdown,
  getTopSellingItems,
} from '@/features/admin/lib/analytics'
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { OrderStatus, PaymentMethod } from '@/types'

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
  const { orders } = useAdminData()

  const revenueByDay = getRevenueByDay(orders, 14)
  const topSelling = getTopSellingItems(orders, 8)
  const paymentBreakdown = getPaymentMethodBreakdown(orders)
  const statusBreakdown = getStatusBreakdown(orders)
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  const paymentColors: Record<PaymentMethod, string> = {
    cash: 'bg-primary',
    upi: 'bg-gold',
    card: 'bg-chart-2',
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
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <BreakdownBar
                  key={method}
                  label={PAYMENT_METHOD_LABELS[method]}
                  count={paymentBreakdown[method]}
                  total={orders.length}
                  color={paymentColors[method]}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <h2 className="font-display mb-1 text-base font-semibold">Order Status</h2>
              {(Object.keys(statusBreakdown) as OrderStatus[]).map((status) => (
                <BreakdownBar
                  key={status}
                  label={ORDER_STATUS_LABELS[status]}
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
