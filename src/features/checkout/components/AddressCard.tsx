import { Briefcase, Home, MapPin, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Address } from '@/types'

const LABEL_ICON = { Home, Work: Briefcase, Other: MapPin }

export function AddressCard({
  address,
  selected,
  onSelect,
  onRemove,
}: {
  address: Address
  selected: boolean
  onSelect: () => void
  onRemove?: () => void
}) {
  const Icon = LABEL_ICON[address.label]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        selected ? 'border-primary bg-secondary/50 ring-primary/20 ring-2' : 'hover:bg-secondary/30',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{address.label}</p>
        <p className="text-muted-foreground truncate text-xs">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
        </p>
      </div>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Remove address"
        >
          <Trash2 className="size-4" />
        </span>
      )}
    </button>
  )
}
