import { readStorage, writeStorage, removeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { API_BASE_URL, ApiError } from '@/lib/api/client'
import type { ApiResponse, AuthResponse, ProblemDetails, UserDto } from '@/lib/api/types'

/**
 * A third, isolated JWT session — separate storage key from both the customer session
 * (client.ts) and the admin session (adminClient.ts) — mirroring the same pattern so a
 * delivery partner, admin, and customer can all be signed in on the same device/browser
 * without clobbering each other's tokens.
 */
export interface StoredDeliverySession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: UserDto
}

export function getDeliverySession(): StoredDeliverySession | null {
  return readStorage<StoredDeliverySession | null>(STORAGE_KEYS.deliveryApiSession, null)
}

export function setDeliverySession(session: StoredDeliverySession | null) {
  if (session) writeStorage(STORAGE_KEYS.deliveryApiSession, session)
  else removeStorage(STORAGE_KEYS.deliveryApiSession)
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.clone().json()) as ProblemDetails
    if (body.errors) {
      const first = Object.values(body.errors)[0]?.[0]
      if (first) return first
    }
    if (body.detail) return body.detail
    if (body.title) return body.title
  } catch {
    // response body wasn't JSON (e.g. a bare 401 from the auth middleware) — fall through
  }
  return `Request failed with status ${response.status}`
}

export async function deliveryLogin(email: string, password: string): Promise<boolean> {
  const response = await fetch(new URL('/api/auth/login', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) return false

  const body = (await response.json()) as ApiResponse<AuthResponse>
  if (!body.data.user.roles.includes('DeliveryPartner')) return false

  setDeliverySession({
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    accessTokenExpiresAt: body.data.accessTokenExpiresAt,
    user: body.data.user,
  })
  return true
}

export function deliveryLogout() {
  setDeliverySession(null)
}

let refreshInFlight: Promise<StoredDeliverySession | null> | null = null

function refreshDeliverySession(): Promise<StoredDeliverySession | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function performRefresh(): Promise<StoredDeliverySession | null> {
  const session = getDeliverySession()
  if (!session) return null

  const response = await fetch(new URL('/api/auth/refresh', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!response.ok) {
    setDeliverySession(null)
    return null
  }

  const body = (await response.json()) as ApiResponse<AuthResponse>
  const next: StoredDeliverySession = {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    accessTokenExpiresAt: body.data.accessTokenExpiresAt,
    user: body.data.user,
  }
  setDeliverySession(next)
  return next
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
  _isRetry = false,
): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const session = getDeliverySession()
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (session) headers.Authorization = `Bearer ${session.accessToken}`

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && session && !_isRetry) {
    const refreshed = await refreshDeliverySession()
    if (refreshed) return request<T>(method, path, body, params, true)
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T

  const responseBody = (await response.json()) as ApiResponse<T>
  if (!responseBody.success) {
    throw new ApiError(responseBody.message || `Request to ${path} was not successful`, response.status)
  }

  return responseBody.data
}

export function deliveryApiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  return request<T>('GET', path, undefined, params)
}

export function deliveryApiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PUT', path, body)
}
