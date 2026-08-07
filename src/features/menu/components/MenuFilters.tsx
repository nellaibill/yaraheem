import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import type { MenuCategory } from '@/types'

const CATEGORIES = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]

export function MenuFilters({
  active,
  onChange,
  vegOnly,
  onVegOnlyChange,
}: {
  active: MenuCategory | 'all'
  onChange: (category: MenuCategory | 'all') => void
  vegOnly: boolean
  onVegOnlyChange: (value: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={active === 'all' ? 'default' : 'outline'}
          onClick={() => onChange('all')}
        >
          All
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={active === category ? 'default' : 'outline'}
            onClick={() => onChange(category)}
          >
            {MENU_CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>
      <button
        onClick={() => onVegOnlyChange(!vegOnly)}
        className={cn(
          'flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
          vegOnly ? 'border-green-600 bg-green-600/10 text-green-700' : 'border-input text-muted-foreground',
        )}
      >
        <span
          className={cn(
            'flex size-3.5 items-center justify-center rounded-sm border-2',
            vegOnly ? 'border-green-600' : 'border-muted-foreground',
          )}
        >
          <span className={cn('size-1.5 rounded-full', vegOnly ? 'bg-green-600' : 'bg-muted-foreground')} />
        </span>
        Veg only
      </button>
    </div>
  )
}
