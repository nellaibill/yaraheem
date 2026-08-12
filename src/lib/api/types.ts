export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface ProductListResponse {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  comparePrice: number | null
  thumbnailUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  stockQuantity: number
  categoryId: string
  categoryName: string
}

export interface CategoryDto {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentCategoryId: string | null
  displayOrder: number
  isActive: boolean
}
