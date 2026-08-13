import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { fetchAdminOrder } from '@/lib/api/adminOrdersApi'
import { formatCurrency } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import type { OrderDto } from '@/lib/api/types'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment',
}

export default function InvoicePage() {
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

  const address = order.shippingAddress

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-2xl justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/orders">Back</Link>
        </Button>
        <Button variant="gold" className="gap-2" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print Invoice
        </Button>
      </div>

      <div className="print-page mx-auto max-w-2xl bg-white p-10 text-black shadow-lg print:max-w-none print:shadow-none">
        <PrintHeader subtitle="Tax Invoice" />

        <div className="mt-6 flex justify-between text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">Billed To</p>
            <p className="font-medium">{address.fullName}</p>
            <p className="text-gray-600">+91 {address.phoneNumber}</p>
            <p className="max-w-52 text-gray-600">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} -{' '}
              {address.postalCode}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Invoice #</span> {order.orderNumber}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p>
              <span className="font-semibold">Payment:</span>{' '}
              {order.paymentMethod ? (PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod) : 'Not recorded'}
            </p>
            <p className="text-gray-500">GSTIN: 36AABCU1234A1Z5 (mock)</p>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 text-left font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Rate</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2.5">{item.productName}</td>
                <td className="py-2.5 text-right">{item.quantity}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex w-56 flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t-2 border-black pt-1.5 text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="mt-10 border-t border-dashed border-gray-400 pt-4 text-center text-xs text-gray-500">
          <p>Thank you for ordering from {SITE.name}!</p>
          <p>This is a system-generated invoice for a proof-of-concept demo.</p>
        </div>
      </div>
    </div>
  )
}
