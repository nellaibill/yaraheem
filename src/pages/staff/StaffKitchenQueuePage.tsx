import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChefHat, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { advanceRoundStatus, fetchKitchenQueue } from '@/lib/api/dineInApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { KitchenRoundDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const STATUS_LABEL: Record<number, string> = { 1: 'Fired', 2: 'Preparing', 3: 'Ready' }
const STATUS_BADGE: Record<number, 'gold' | 'secondary' | 'outline'> = { 1: 'gold', 2: 'secondary', 3: 'outline' }
const NEXT_ACTION_LABEL: Record<number, string> = { 1: 'Start Preparing', 2: 'Mark Ready', 3: 'Mark Served' }

const POLL_INTERVAL_MS = 5000

function minutesAgo(isoDate: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000))
  return minutes === 0 ? 'just now' : `${minutes} min ago`
}

export default function StaffKitchenQueuePage() {
  useDocumentTitle('Kitchen')
  const [rounds, setRounds] = useState<KitchenRoundDto[]>([])
  const [loading, setLoading] = useState(true)
  const [advancingId, setAdvancingId] = useState<string | null>(null)

  const load = useCallback((showSpinner: boolean) => {
    if (showSpinner) setLoading(true)
    fetchKitchenQueue()
      .then(setRounds)
      .catch((error) => toast.error('Could not load kitchen queue', { description: errorMessage(error) }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(true)
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [load])

  async function handleAdvance(round: KitchenRoundDto) {
    setAdvancingId(round.id)
    try {
      await advanceRoundStatus(round.id)
      load(false)
    } catch (error) {
      toast.error('Could not update round', { description: errorMessage(error) })
    } finally {
      setAdvancingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
          <ChefHat className="size-7" />
          Kitchen Queue
        </h1>
        <p className="text-muted-foreground text-base">Every round waiting on you, oldest first. Updates every few seconds.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
      ) : rounds.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-base">Nothing fired right now — the queue is clear.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => (
            <Card key={round.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl font-semibold">{round.tableLabel}</p>
                  <Badge variant={STATUS_BADGE[round.status]}>{STATUS_LABEL[round.status]}</Badge>
                </div>
                <p className="text-muted-foreground -mt-2 flex items-center gap-1.5 text-sm">
                  <Flame className="size-3.5" />
                  Round {round.roundNumber} · fired {minutesAgo(round.firedAt)}
                </p>
                <div className="flex flex-col gap-1 text-base">
                  {round.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  variant="gold"
                  className="mt-1 w-full"
                  disabled={advancingId === round.id}
                  onClick={() => handleAdvance(round)}
                >
                  {advancingId === round.id ? 'Updating...' : NEXT_ACTION_LABEL[round.status]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
