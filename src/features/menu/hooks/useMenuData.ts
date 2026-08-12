import { useCallback, useEffect, useState } from 'react'
import { fetchCategories, fetchProducts } from '@/lib/api/catalogApi'
import { menuItems as staticMenuItems, menuSections as staticMenuSections } from '@/features/menu/data/menuData'
import type { MenuItem } from '@/types'

/**
 * The backend Catalog API is authoritative for commerce fields (name, price, stock,
 * publish status, category). It has no concept of the frontend's presentational
 * fields (spice level, veg/signature/bestseller badges, combo contents, time-of-day
 * sections), so those are overlaid from the static seed content in menuData.ts,
 * joined by id — backend product slugs were seeded to exactly match these ids.
 */
const staticMetaById = new Map(staticMenuItems.map((item) => [item.id, item]))

async function loadMenuItems(): Promise<MenuItem[]> {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  const categorySlugById = new Map(categories.map((category) => [category.id, category.slug]))

  const items: MenuItem[] = []
  for (const product of products) {
    const meta = staticMetaById.get(product.slug)
    const category = categorySlugById.get(product.categoryId)
    if (!meta || !category) continue

    items.push({
      id: product.slug,
      name: product.name,
      description: meta.description,
      price: product.price,
      originalPrice: product.comparePrice ?? undefined,
      category: category as MenuItem['category'],
      spiceLevel: meta.spiceLevel,
      isVeg: meta.isVeg,
      isSignature: meta.isSignature,
      isBestSeller: meta.isBestSeller,
      isAvailable: product.isPublished && product.stockQuantity > 0,
      imageUrl: product.thumbnailUrl ?? undefined,
      sections: meta.sections,
      comboSlots: meta.comboSlots,
    })
  }
  return items
}

/**
 * Fetches the live product/category catalog on mount and whenever refresh() is
 * called, falling back to the static seed data (same shape) until the first fetch
 * resolves, or permanently if the API is unreachable.
 */
export function useMenuData() {
  const [items, setItems] = useState<MenuItem[]>(staticMenuItems)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadMenuItems()
      .then((loaded) => {
        if (!cancelled) setItems(loaded)
      })
      .catch((error) => {
        console.error('Failed to load menu items from the API; showing static fallback data.', error)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  return { items, sections: staticMenuSections, refresh }
}
