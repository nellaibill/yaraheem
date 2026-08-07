import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'primary',
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  accent?: 'primary' | 'gold'
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
          <p className="font-display mt-1 text-2xl font-bold">{value}</p>
          {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            accent === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-gold text-gold-foreground',
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </CardContent>
    </Card>
  )
}
