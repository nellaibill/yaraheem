import { Heart } from 'lucide-react'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { cn } from '@/lib/utils'

export function FavoriteButton({ itemId, className }: { itemId: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(itemId)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(itemId)
      }}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      className={cn(
        'flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white',
        className,
      )}
    >
      <Heart className={cn('size-4 transition-colors', active ? 'fill-destructive text-destructive' : 'text-foreground/60')} />
    </button>
  )
}
