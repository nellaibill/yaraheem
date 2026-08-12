import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminMenuData } from '@/lib/api/adminProductsApi'
import { ApiError } from '@/lib/api/client'
import { toAdminMenuItems, type AdminMenuItem } from '@/features/menu/lib/adminMenuMapping'
import type { CategoryDto, ProductDetailsResponse } from '@/lib/api/types'

/**
 * Live-API-backed menu data for the Admin Portal, replacing the old fully-local
 * menuStore.ts mock CRUD. Presentational fields (spice/veg/badges/sections/combos) still
 * come from the static overlay via toAdminMenuItems — see that file's doc comment.
 */
export function useAdminMenuData() {
  const [products, setProducts] = useState<ProductDetailsResponse[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminMenuData()
      .then((result) => {
        if (cancelled) return
        setProducts(result.products)
        setCategories(result.categories)
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error('Could not load menu items', {
            description: error instanceof ApiError ? error.message : 'Something went wrong.',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const items: AdminMenuItem[] = toAdminMenuItems(products, categories)

  return { products, categories, items, loading, refresh }
}
