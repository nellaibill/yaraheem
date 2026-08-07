import { useCallback, useMemo, useState } from 'react'
import { getAssignedOrders, getAvailableOrders, getCompletedOrders } from '@/features/delivery/lib/deliveryStore'

export function useDeliveryOrders(partnerId: string | undefined) {
  const [version, setVersion] = useState(0)

  const assigned = useMemo(
    () => (partnerId ? getAssignedOrders(partnerId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
    [partnerId, version],
  )
  const available = useMemo(
    () => getAvailableOrders(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
    [version],
  )
  const completed = useMemo(
    () => (partnerId ? getCompletedOrders(partnerId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
    [partnerId, version],
  )

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return { assigned, available, completed, refresh }
}
