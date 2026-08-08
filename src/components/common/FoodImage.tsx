import { useState } from 'react'
import { DishVisual } from '@/components/common/DishVisual'
import { getFoodImageUrl } from '@/lib/foodImages'
import { cn } from '@/lib/utils'
import type { MenuCategory } from '@/types'

/** Real dish photo when we have a verified one, falling back to the branded gradient on load failure. */
export function FoodImage({
  itemId,
  imageUrl,
  category,
  alt,
  className,
  iconClassName,
  loading = 'lazy',
}: {
  itemId: string
  /** Explicit override (e.g. an admin-edited image) — takes priority over the centralized mapping. */
  imageUrl?: string
  category?: MenuCategory
  alt: string
  className?: string
  iconClassName?: string
  loading?: 'lazy' | 'eager'
}) {
  const src = imageUrl || getFoodImageUrl(itemId)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <DishVisual category={category} seed={itemId} className={className} iconClassName={iconClassName} />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
