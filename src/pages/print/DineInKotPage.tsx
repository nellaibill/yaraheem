import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrintHeader } from '@/features/print/components/PrintHeader'
import { fetchDineInRoundForPrint } from '@/lib/api/dineInApi'
import type { DineInRoundPrintDto } from '@/lib/api/types'

export default function DineInKotPage() {
  const { id } = useParams()
  const [data, setData] = useState<DineInRoundPrintDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchDineInRoundForPrint(id)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setData(null)
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

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="font-medium">Round not found</p>
        <Button asChild variant="outline">
          <Link to="/staff">Back to Tables</Link>
        </Button>
      </div>
    )
  }

  const { tableLabel, round } = data

  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-xl justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to="/staff">Back</Link>
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
              <span className="font-semibold">Table:</span> {tableLabel}
            </p>
            <p>
              <span className="font-semibold">Round:</span> {round.roundNumber}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Date:</span> {new Date(round.firedAt).toLocaleDateString('en-IN')}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{' '}
              {new Date(round.firedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
            {round.items.map((item) => (
              <tr key={item.id} className="border-b border-dashed border-gray-400">
                <td className="py-2.5 text-base">{item.productName}</td>
                <td className="py-2.5 text-right text-base font-bold">×{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between border-t-2 border-black pt-3 text-xs text-gray-600">
          <span>Dine-in</span>
          <span>Prepared by: ______________</span>
        </div>
      </div>
    </div>
  )
}
