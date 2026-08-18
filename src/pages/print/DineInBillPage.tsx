import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { fetchTableSession } from '@/lib/api/dineInApi'
import { cn, formatCurrency } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import type { TableSessionDto } from '@/lib/api/types'

export default function DineInBillPage() {
  const { id } = useParams()
  const [session, setSession] = useState<TableSessionDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchTableSession(id)
      .then((result) => {
        if (!cancelled) setSession(result)
      })
      .catch(() => {
        if (!cancelled) setSession(null)
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

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium">Table session not found</p>
        <Button asChild variant="outline">
          <Link to="/staff">Back to Tables</Link>
        </Button>
      </div>
    )
  }

  const items = session.rounds.filter((r) => r.status !== 5).flatMap((r) => r.items)
  const paidPayments = session.payments.filter((p) => p.status === 2)

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to={`/staff/sessions/${session.id}`}>Back</Link>
        </Button>
        <Button variant="gold" className="gap-2" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print Bill
        </Button>
      </div>

      <div className="print-page mx-auto max-w-xl bg-white p-8 text-black shadow-lg print:max-w-none print:shadow-none">
        <PrintHeader subtitle="Bill" />

        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p>
              <span className="font-semibold">Table:</span> {session.tableLabel}
            </p>
            <p>
              <span className="font-semibold">Guests:</span> {session.guestCount}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Date:</span> {new Date(session.openedAt).toLocaleDateString('en-IN')}
            </p>
            {session.closedAt && (
              <p>
                <span className="font-semibold">Closed:</span>{' '}
                {new Date(session.closedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-2 text-left font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Rate</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2.5">
                  {item.productName}
                  {item.isComped && <span className="ml-1.5 text-xs text-gray-500">(Comped{item.compReason ? `: ${item.compReason}` : ''})</span>}
                </td>
                <td className="py-2.5 text-right">{item.quantity}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className={cn('py-2.5 text-right', item.isComped && 'text-gray-400 line-through')}>{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto flex w-56 flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(session.subtotal)}</span>
          </div>
          {session.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount{session.discountReason ? ` (${session.discountReason})` : ''}</span>
              <span>-{formatCurrency(session.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tax ({session.taxRatePercent}%)</span>
            <span>{formatCurrency(session.taxAmount)}</span>
          </div>
          {session.serviceChargeAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Service Charge ({session.serviceChargePercent}%)</span>
              <span>{formatCurrency(session.serviceChargeAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t-2 border-black pt-1.5 text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(session.total)}</span>
          </div>
        </div>

        {paidPayments.length > 0 && (
          <div className="mt-6 border-t border-dashed border-gray-400 pt-3 text-sm">
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">Payment</p>
            {paidPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between text-gray-700">
                <span>
                  {payment.label} — {payment.method}
                </span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-dashed border-gray-400 pt-4 text-center text-xs text-gray-500">
          <p>Thank you for dining with {SITE.name}!</p>
        </div>
      </div>
    </div>
  )
}
