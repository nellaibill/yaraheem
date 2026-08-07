import { useCallback, useMemo, useState } from 'react'
import { getAllOrders, getCustomerSummaries } from '@/features/admin/lib/adminStore'

/**
 * Admin data is aggregated by scanning localStorage across every customer's
 * scoped keys (no live backend to subscribe to), so this hook re-reads on
 * demand — call `refresh()` after any admin mutation (status change, etc).
 */
export function useAdminData() {
  const [version, setVersion] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const orders = useMemo(() => getAllOrders(), [version])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const customers = useMemo(() => getCustomerSummaries(), [version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return { orders, customers, refresh }
}
