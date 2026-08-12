import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { fetchAdminOrder } from '@/lib/api/adminOrdersApi'
import type { OrderDto } from '@/lib/api/types'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
}

export default function KotPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchAdminOrder(id)
      .then((result) => {
        if (!cancelled) setOrder(result)
      })
      .catch(() => {
        if (!cancelled) setOrder(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium">Order not found</p>
        <Button asChild variant="outline">
          <Link to="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/orders">Back</Link>
        </Button>
        <Button variant="gold" className="gap-2" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print KOT
        </Button>
      </div>

      <div className="print-page mx-auto max-w-xl bg-white p-8 text-black shadow-lg print:max-w-none print:shadow-none">
        <PrintHeader subtitle="Kitchen Order Ticket" />

        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p>
              <span className="font-semibold">Order #</span> {order.orderNumber}
            </p>
            <p>
              <span className="font-semibold">Customer:</span> {order.shippingAddress.fullName}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{' '}
              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 text-left font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-dashed border-gray-400">
                <td className="py-2.5 text-base">{item.productName}</td>
                <td className="py-2.5 text-right text-base font-bold">×{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between border-t-2 border-black pt-3 text-xs text-gray-600">
          <span>Delivery · {order.paymentMethod ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod) : 'Not recorded'}</span>
          <span>Prepared by: ______________</span>
        </div>
      </div>
    </div>
  )
}
