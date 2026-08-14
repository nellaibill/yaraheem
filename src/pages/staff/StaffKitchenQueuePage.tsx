import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChefHat, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { advanceRoundStatus, fetchKitchenQueue } from '@/lib/api/dineInApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'
import type { KitchenRoundDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const POLL_INTERVAL_MS = 5000

type Urgency = 'normal' | 'amber' | 'red'

function urgencyFor(firedAt: string): Urgency {
  const minutes = (Date.now() - new Date(firedAt).getTime()) / 60000
  if (minutes >= 20) return 'red'
  if (minutes >= 10) return 'amber'
  return 'normal'
}

const URGENCY_CARD_CLASS: Record<Urgency, string> = {
  normal: '',
  amber: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30',
  red: 'border-red-400 bg-red-50 dark:bg-red-950/30 animate-pulse motion-reduce:animate-none',
}

const URGENCY_TIME_CLASS: Record<Urgency, string> = {
  normal: 'text-muted-foreground',
  amber: 'text-amber-700 dark:text-amber-400 font-semibold',
  red: 'text-red-700 dark:text-red-400 font-semibold',
}

function minutesAgo(isoDate: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000))
  return minutes === 0 ? 'just now' : `${minutes} min ago`
}

interface Lane {
  status: 1 | 2 | 3
  title: string
  /** null means this lane is a display-only hand-off shelf — the waiter, not the kitchen, closes it out. */
  actionLabel: string | null
  headerClass: string
}

const LANES: Lane[] = [
  { status: 1, title: 'New', actionLabel: 'Start Preparing', headerClass: 'text-foreground' },
  { status: 2, title: 'Preparing', actionLabel: 'Mark Ready', headerClass: 'text-foreground' },
  { status: 3, title: 'Ready to Serve', actionLabel: null, headerClass: 'text-primary' },
]

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {LANES.map((lane) => {
            const laneRounds = rounds.filter((r) => r.status === lane.status)
            return (
              <div key={lane.status} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className={cn('font-display text-lg font-semibold', lane.headerClass)}>{lane.title}</h2>
                  <span className="bg-secondary text-secondary-foreground flex size-6 items-center justify-center rounded-full text-xs font-semibold">
                    {laneRounds.length}
                  </span>
                </div>

                {laneRounds.length === 0 ? (
                  <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">Nothing here</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {laneRounds.map((round) => {
                      const urgency = urgencyFor(round.firedAt)
                      return (
                        <Card key={round.id} className={cn('transition-colors', URGENCY_CARD_CLASS[urgency])}>
                          <CardContent className="flex flex-col gap-3 p-5">
                            <div className="flex items-center justify-between">
                              <p className="font-display text-xl font-semibold">{round.tableLabel}</p>
                            </div>
                            <p className={cn('-mt-2 flex items-center gap-1.5 text-sm', URGENCY_TIME_CLASS[urgency])}>
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
                            {lane.actionLabel ? (
                              <Button
                                size="lg"
                                variant="gold"
                                className="mt-1 w-full"
                                disabled={advancingId === round.id}
                                onClick={() => handleAdvance(round)}
                              >
                                {advancingId === round.id ? 'Updating...' : lane.actionLabel}
                              </Button>
                            ) : (
                              <p className="text-muted-foreground mt-1 text-center text-sm">Waiting for the waiter to pick up</p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
