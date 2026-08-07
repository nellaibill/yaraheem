import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  bordered = true,
  fullPage = false,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  bordered?: boolean
  /** Full-bleed centered variant for whole-page states (empty cart, not-found, etc). */
  fullPage?: boolean
  className?: string
}) {
  if (fullPage) {
    return (
      <div
        className={cn(
          'mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center',
          className,
        )}
      >
        <Icon className="text-muted-foreground size-14" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
        {actionLabel && actionTo && (
          <Button asChild variant="gold" size="lg">
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl py-16 text-center',
        bordered && 'border border-dashed',
        className,
      )}
    >
      <Icon className="text-muted-foreground size-10" strokeWidth={1.5} />
      <p className="font-medium">{title}</p>
      {description && <p className="text-muted-foreground max-w-xs text-sm">{description}</p>}
      {actionLabel && actionTo && (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
