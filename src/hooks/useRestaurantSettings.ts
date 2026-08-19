import { useEffect, useState } from 'react'
import { fetchRestaurantSettings } from '@/lib/api/restaurantSettingsApi'
import { DEFAULT_RESTAURANT_SETTINGS } from '@/lib/constants'
import type { RestaurantSettingsDto } from '@/lib/api/types'

/**
 * Storefront-wide operational settings (order acceptance, offers/banner visibility, today's
 * special, hours) — public, unauthenticated, same trust level as the product catalog. Starts
 * from DEFAULT_RESTAURANT_SETTINGS so there's no layout shift while the real fetch resolves.
 */
export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettingsDto>(DEFAULT_RESTAURANT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchRestaurantSettings()
      .then((result) => {
        if (!cancelled) setSettings(result)
      })
      .catch(() => {
        // silent — the storefront just keeps showing defaults rather than breaking the page
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}
