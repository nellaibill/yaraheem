import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchAuditLogs } from '@/lib/api/auditApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { AuditLogEntryDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ACTION_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'gold'> = {
  Deleted: 'destructive',
  Created: 'gold',
}

function badgeVariantForAction(action: string) {
  const suffix = action.split('.').pop() ?? ''
  return ACTION_BADGE_VARIANT[suffix] ?? 'secondary'
}

export default function AdminAuditLogPage() {
  useDocumentTitle('Audit Log')
  const [entries, setEntries] = useState<AuditLogEntryDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actorEmail, setActorEmail] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 50

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAuditLogs({ actorEmail: actorEmail || undefined, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setEntries(result.items)
        setTotalCount(result.totalCount)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load audit log', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actorEmail])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground text-sm">{totalCount} recorded action{totalCount === 1 ? '' : 's'} — admin logins, order status changes, menu edits, and delivery partner changes.</p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by actor email..."
          value={actorEmail}
          onChange={(e) => {
            setPage(1)
            setActorEmail(e.target.value)
          }}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          {loading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">No audit entries match this filter.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badgeVariantForAction(entry.action)}>{entry.action}</Badge>
                      {entry.entityType && (
                        <span className="text-muted-foreground text-xs">
                          {entry.entityType}
                          {entry.entityId ? ` #${entry.entityId.slice(0, 8)}` : ''}
                        </span>
                      )}
                    </div>
                    {entry.details && <p className="mt-1 text-sm">{entry.details}</p>}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {entry.actorEmail ?? 'System'} {entry.ipAddress ? `· ${entry.ipAddress}` : ''}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">{formatDateTime(entry.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-muted-foreground text-xs">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
