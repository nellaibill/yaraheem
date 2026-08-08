import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { getOrderById } from '@/features/admin/lib/adminStore'
import { getCustomerName } from '@/features/delivery/lib/deliveryStore'
import { formatCurrency } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS, SITE } from '@/lib/constants'

export default function InvoicePage() {
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
            <p className="font-medium">{getCustomerName(order.mobile)}</p>
            <p className="text-gray-600">+91 {order.mobile}</p>
            <p className="max-w-52 text-gray-600">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city},{' '}
              {order.address.state} - {order.address.pincode}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Invoice #</span> {order.id.slice(0, 8).toUpperCase()}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <p>
              <span className="font-semibold">Payment:</span> {PAYMENT_METHOD_LABELS[order.paymentMethod]}
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
            {order.lines.map((line) => (
              <tr key={line.itemId} className="border-b border-gray-200">
                <td className="py-2.5">{line.name}</td>
                <td className="py-2.5 text-right">{line.quantity}</td>
                <td className="py-2.5 text-right">{formatCurrency(line.price)}</td>
                <td className="py-2.5 text-right">{formatCurrency(line.price * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex w-56 flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.itemsTotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
          </div>
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
