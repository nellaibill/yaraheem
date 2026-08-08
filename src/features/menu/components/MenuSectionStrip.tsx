import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { cn } from '@/lib/utils'
import type { MenuItem, MenuSection } from '@/types'

export function MenuSectionStrip({
  section,
  items,
  dark = false,
  limit = 4,
}: {
  section: MenuSection
  items: MenuItem[]
  dark?: boolean
  limit?: number
}) {
  if (items.length === 0) return null

  return (
    <section className={cn('py-16', dark && 'bg-primary text-primary-foreground')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span
              className={cn(
                'w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase',
                dark ? 'bg-gold/20 text-gold' : 'bg-gold/15 text-gold-foreground',
              )}
            >
              {section.tagline}
            </span>
            <h2 className="font-display mt-3 text-2xl font-bold sm:text-3xl">{section.name}</h2>
            <p className={cn('mt-2 flex items-center gap-1.5 text-sm', dark ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              <Clock className="size-3.5" />
              {section.availableTime}
            </p>
          </div>
          <Button
            asChild
            variant={dark ? 'gold' : 'outline'}
            className={cn('gap-1.5', !dark && undefined)}
          >
            <Link to={`/menu?section=${section.key}`}>
              View All <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, limit).map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
