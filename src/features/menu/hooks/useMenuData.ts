import { useCallback, useMemo, useState } from 'react'
import { getMenuItems, getMenuSections } from '@/features/menu/lib/menuStore'

/**
 * The menu catalog has no live backend to subscribe to, so this hook re-reads
 * localStorage on demand — call `refresh()` after any admin mutation.
 */
export function useMenuData() {
  const [version, setVersion] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const items = useMemo(() => getMenuItems(), [version])
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an intentional manual invalidation trigger
  const sections = useMemo(() => getMenuSections(), [version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return { items, sections, refresh }
}
