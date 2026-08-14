import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchAdminDineInSessions } from '@/lib/api/adminDineInApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { TableSessionDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const SESSION_STATUS_LABEL: Record<number, string> = { 1: 'Open', 2: 'Bill Requested', 3: 'Closed' }
const SESSION_STATUS_BADGE: Record<number, 'gold' | 'secondary' | 'outline'> = { 1: 'gold', 2: 'secondary', 3: 'outline' }

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminDineInPage() {
  useDocumentTitle('Dine-In')
  const [sessions, setSessions] = useState<TableSessionDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminDineInSessions()
      .then(setSessions)
      .catch((error) => toast.error('Could not load dine-in sessions', { description: errorMessage(error) }))
      .finally(() => setLoading(false))
  }, [])

  const todaysClosed = sessions.filter((s) => s.status === 3 && s.closedAt && isToday(s.closedAt))
  const todaysRevenue = todaysClosed.reduce((sum, s) => sum + s.total, 0)
  const activeCount = sessions.filter((s) => s.status !== 3).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dine-In</h1>
        <p className="text-muted-foreground text-sm">
          Every table session from the waiter portal — kept separate from online/delivery orders below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Dine-In Revenue (Today)</p>
            <p className="font-display mt-1 text-2xl font-bold">{formatCurrency(todaysRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Tables Currently Active</p>
            <p className="font-display mt-1 text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-muted-foreground text-xs">Closed Today</p>
            <p className="font-display mt-1 text-2xl font-bold">{todaysClosed.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No dine-in sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Table</th>
                    <th className="pb-2 font-medium">Guests</th>
                    <th className="pb-2 font-medium">Rounds</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Payment</th>
                    <th className="pb-2 font-medium">Opened</th>
                    <th className="pb-2 font-medium">Closed</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{session.tableLabel}</td>
                      <td className="text-muted-foreground py-2.5">{session.guestCount}</td>
                      <td className="text-muted-foreground py-2.5">{session.rounds.length}</td>
                      <td className="py-2.5">
                        <Badge variant={SESSION_STATUS_BADGE[session.status]}>{SESSION_STATUS_LABEL[session.status]}</Badge>
                      </td>
                      <td className="text-muted-foreground py-2.5">{session.paymentMethod ?? '—'}</td>
                      <td className="text-muted-foreground py-2.5">{formatDateTime(session.openedAt)}</td>
                      <td className="text-muted-foreground py-2.5">{session.closedAt ? formatDateTime(session.closedAt) : '—'}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(session.total)}</td>
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

function isToday(isoDate: string) {
  const date = new Date(isoDate)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}
