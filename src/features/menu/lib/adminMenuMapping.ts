import { getMenuItems } from '@/features/menu/lib/menuStore'
import type { CategoryDto, ProductDetailsResponse } from '@/lib/api/types'
import type { MenuCategory, MenuItem } from '@/types'

/**
 * Admin-facing menu row: the real backend Product plus the launch-time presentational
 * overlay (spice level, veg flag, badges, sections, combo contents) that stays
 * admin-uneditable this sprint per the Week 3 product decision — shown read-only so staff
 * know it exists, but only the backend-authoritative fields below are ever written back.
 */
export interface AdminMenuItem extends MenuItem {
  productId: string
  categoryId: string
  sku: string
}

export function toAdminMenuItems(products: ProductDetailsResponse[], categories: CategoryDto[]): AdminMenuItem[] {
  const staticMetaBySlug = new Map(getMenuItems().map((item) => [item.id, item]))
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  return products.map((product) => {
    const meta = staticMetaBySlug.get(product.slug)
    const category = categoryById.get(product.categoryId)

    return {
      id: product.slug,
      productId: product.id,
      categoryId: product.categoryId,
      sku: product.sku,
      name: product.name,
      description: meta?.description ?? product.description ?? '',
      price: product.price,
      originalPrice: product.comparePrice ?? undefined,
      category: (category?.slug as MenuCategory | undefined) ?? meta?.category ?? 'biryani',
      spiceLevel: meta?.spiceLevel ?? 'medium',
      isVeg: meta?.isVeg ?? false,
      isSignature: meta?.isSignature,
      isBestSeller: meta?.isBestSeller,
      isAvailable: product.isPublished,
      imageUrl: product.thumbnailUrl ?? undefined,
      sections: meta?.sections,
      comboSlots: meta?.comboSlots,
    }
  })
}
