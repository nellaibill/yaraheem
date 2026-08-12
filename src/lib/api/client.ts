import type { ApiResponse } from '@/lib/api/types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5247'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }

  const body = (await response.json()) as ApiResponse<T>
  if (!body.success) {
    throw new ApiError(body.message || `Request to ${path} was not successful`, response.status)
  }

  return body.data
}
