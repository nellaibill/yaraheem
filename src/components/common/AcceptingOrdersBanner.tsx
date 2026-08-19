import { useRestaurantSettings } from '@/hooks/useRestaurantSettings'

export function AcceptingOrdersBanner() {
  const { settings, loading } = useRestaurantSettings()
  if (loading || settings.acceptingOrders) return null

  return (
    <div className="bg-destructive px-4 py-1.5 text-center text-xs font-medium text-white">
      We&rsquo;re not accepting new orders right now — browsing is still open, please check back shortly.
    </div>
  )
}
