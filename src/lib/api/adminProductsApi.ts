import { adminApiDelete, adminApiPost, adminApiPut } from '@/lib/api/adminClient'
import { fetchCategories, fetchProductById, fetchProducts } from '@/lib/api/catalogApi'
import type { CategoryDto, CreateProductRequest, ProductDetailsResponse, UpdateProductRequest } from '@/lib/api/types'

/**
 * The admin menu screen needs description/isFeatured/isActive to safely round-trip a PUT
 * (UpdateProductRequest overwrites every field, so partial data would silently blank the
 * rest) — ProductListResponse doesn't carry those, so this fetches full details per product.
 * Fine at this catalog's pilot scale (~20 items); not meant to scale past that.
 */
export async function fetchAdminMenuData(): Promise<{ products: ProductDetailsResponse[]; categories: CategoryDto[] }> {
  const [list, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  const products = await Promise.all(list.map((p) => fetchProductById(p.id)))
  return { products, categories }
}

export function createAdminProduct(request: CreateProductRequest): Promise<ProductDetailsResponse> {
  return adminApiPost<ProductDetailsResponse>('/api/products', request)
}

export function updateAdminProduct(id: string, request: UpdateProductRequest): Promise<ProductDetailsResponse> {
  return adminApiPut<ProductDetailsResponse>(`/api/products/${id}`, request)
}

export function deleteAdminProduct(id: string): Promise<void> {
  return adminApiDelete<void>(`/api/products/${id}`)
}
