import { apiGet } from '@/lib/api/client'
import type { CategoryDto, PagedResult, ProductDetailsResponse, ProductListResponse } from '@/lib/api/types'

export async function fetchProducts(): Promise<ProductListResponse[]> {
  const result = await apiGet<PagedResult<ProductListResponse>>('/api/products', { pageSize: 100 })
  return result.items
}

export async function fetchProductById(id: string): Promise<ProductDetailsResponse> {
  return apiGet<ProductDetailsResponse>(`/api/products/${id}`)
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  return apiGet<CategoryDto[]>('/api/categories')
}
