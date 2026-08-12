import { useCallback, useMemo, useState } from 'react'
import { getMenuItems, getMenuSections } from '@/features/menu/lib/menuStore'

/**
 * localStorage-backed menu data for the Admin Portal's mock CRUD flow, which has no
 * real backend auth to write through. Kept separate from the public useMenuData()
 * hook (which now reads the live Catalog API) so admin edits keep working exactly as
 * before without silently no-oping against API-sourced data.
 */
export function useLocalMenuData() {
  const [version, setVersion] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const items = useMemo(() => getMenuItems(), [version])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const sections = useMemo(() => getMenuSections(), [version])
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  return { items, sections, refresh }
}
