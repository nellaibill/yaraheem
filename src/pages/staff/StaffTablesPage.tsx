import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchTables, markTableCleaned, openTableSession } from '@/lib/api/dineInApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { DiningTableDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const STATUS_LABEL: Record<number, string> = { 1: 'Available', 2: 'Occupied', 3: 'Needs Cleaning' }
const STATUS_BADGE: Record<number, 'gold' | 'secondary' | 'outline'> = { 1: 'gold', 2: 'secondary', 3: 'outline' }

export default function StaffTablesPage() {
  useDocumentTitle('Tables')
  const navigate = useNavigate()
  const [tables, setTables] = useState<DiningTableDto[]>([])
  const [loading, setLoading] = useState(true)
  const [seatingTable, setSeatingTable] = useState<DiningTableDto | null>(null)
  const [guestCount, setGuestCount] = useState('2')
  const [opening, setOpening] = useState(false)
  const [cleaningTableId, setCleaningTableId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetchTables()
      .then(setTables)
      .catch((error) => toast.error('Could not load tables', { description: errorMessage(error) }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSeat() {
    if (!seatingTable) return
    const count = Number(guestCount)
    if (!count || count <= 0) {
      toast.error('Enter a valid guest count')
      return
    }
    setOpening(true)
    try {
      const session = await openTableSession(seatingTable.id, count)
      setSeatingTable(null)
      navigate(`/staff/sessions/${session.id}`)
    } catch (error) {
      toast.error('Could not open table', { description: errorMessage(error) })
    } finally {
      setOpening(false)
    }
  }

  async function handleMarkCleaned(tableId: string) {
    setCleaningTableId(tableId)
    try {
      await markTableCleaned(tableId)
      load()
    } catch (error) {
      toast.error('Could not update table', { description: errorMessage(error) })
    } finally {
      setCleaningTableId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Tables</h1>
        <p className="text-muted-foreground text-base">Tap a table to seat guests or view its running tab.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className="cursor-pointer transition-shadow hover:shadow-md active:scale-[0.98]"
              onClick={() => {
                if (table.activeSessionId) navigate(`/staff/sessions/${table.activeSessionId}`)
                else if (table.status === 1) {
                  setSeatingTable(table)
                  setGuestCount('2')
                }
              }}
            >
              <CardContent className="flex flex-col items-center gap-2.5 p-6 text-center">
                <p className="font-display text-xl font-semibold">{table.label}</p>
                <Badge variant={STATUS_BADGE[table.status]} className="px-3 py-1 text-sm">
                  {STATUS_LABEL[table.status]}
                </Badge>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Users className="size-4" />
                  {table.capacity} seats
                </p>
                {table.runningTotal !== null && (
                  <p className="text-base font-semibold">{formatCurrency(table.runningTotal)}</p>
                )}
                {table.status === 3 && (
                  <Button
                    size="lg"
                    variant="gold"
                    className="mt-1 w-full"
                    disabled={cleaningTableId === table.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkCleaned(table.id)
                    }}
                  >
                    {cleaningTableId === table.id ? 'Updating...' : 'Mark as Cleaned'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={seatingTable !== null} onOpenChange={(open) => !open && setSeatingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat guests at {seatingTable?.label}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1.5 py-2">
            <Label htmlFor="guest-count">Number of guests</Label>
            <Input
              id="guest-count"
              type="number"
              min={1}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              autoFocus
              className="h-12 text-base"
            />
          </div>
          <DialogFooter>
            <Button size="lg" variant="outline" onClick={() => setSeatingTable(null)}>
              Cancel
            </Button>
            <Button size="lg" variant="gold" onClick={handleSeat} disabled={opening}>
              {opening ? 'Opening...' : 'Open Table'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
