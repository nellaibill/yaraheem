import { useCallback } from 'react'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { STORAGE_KEYS } from '@/lib/constants'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useScopedStorage<string[]>(STORAGE_KEYS.favorites, [])

  const isFavorite = useCallback((itemId: string) => favoriteIds.includes(itemId), [favoriteIds])

  const toggleFavorite = useCallback(
    (itemId: string) => {
      setFavoriteIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
      )
    },
    [setFavoriteIds],
  )

  return { favoriteIds, isFavorite, toggleFavorite }
}
