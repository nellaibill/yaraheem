import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, variant = 'default' }: { className?: string; variant?: 'default' | 'inverted' }) {
  const inverted = variant === 'inverted'

  return (
    <Link to="/" className={cn('flex items-center gap-2 shrink-0', className)}>
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full',
          inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        <UtensilsCrossed className="size-4.5" strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-lg font-bold tracking-tight', inverted && 'text-primary-foreground')}>
          Yaraheem
        </span>
        <span
          className={cn(
            'text-[10px] tracking-[0.2em] uppercase',
            inverted ? 'text-primary-foreground/60' : 'text-muted-foreground',
          )}
        >
          Catering
        </span>
      </span>
    </Link>
  )
}
