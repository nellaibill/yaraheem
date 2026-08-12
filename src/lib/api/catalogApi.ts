import { apiGet } from '@/lib/api/client'
import type { CategoryDto, PagedResult, ProductListResponse } from '@/lib/api/types'

export async function fetchProducts(): Promise<ProductListResponse[]> {
  const result = await apiGet<PagedResult<ProductListResponse>>('/api/products', { pageSize: 100 })
  return result.items
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  return apiGet<CategoryDto[]>('/api/categories')
}
