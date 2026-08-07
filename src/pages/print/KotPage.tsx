import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { getOrderById } from '@/features/admin/lib/adminStore'
import { getCustomerName } from '@/features/delivery/lib/deliveryStore'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'

export default function KotPage() {
  const { id } = useParams()
  const order = id ? getOrderById(id) : undefined

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
              <span className="font-semibold">Order #</span> {order.id.slice(0, 8).toUpperCase()}
            </p>
            <p>
              <span className="font-semibold">Customer:</span> {getCustomerName(order.mobile)}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN')}
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
            {order.lines.map((line) => (
              <tr key={line.itemId} className="border-b border-dashed border-gray-400">
                <td className="py-2.5 text-base">{line.name}</td>
                <td className="py-2.5 text-right text-base font-bold">×{line.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between border-t-2 border-black pt-3 text-xs text-gray-600">
          <span>Delivery · {PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
          <span>Prepared by: ______________</span>
        </div>
      </div>
    </div>
  )
}
