import { readStorage, writeStorage, removeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { API_BASE_URL, ApiError } from '@/lib/api/client'
import type { ApiResponse, AuthResponse, ProblemDetails, UserDto } from '@/lib/api/types'

/**
 * A separate JWT session from the customer one (src/lib/api/client.ts) — an admin can be
 * signed into /admin in the same browser as a customer session on the storefront, and the
 * two must not clobber each other's tokens. Backed by the single seeded Admin account
 * (see backend AdminSeedOptions); there's no self-registration path for Admin.
 */
export interface StoredAdminSession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: UserDto
}

export function getAdminSession(): StoredAdminSession | null {
  return readStorage<StoredAdminSession | null>(STORAGE_KEYS.adminApiSession, null)
}

export function setAdminSession(session: StoredAdminSession | null) {
  if (session) writeStorage(STORAGE_KEYS.adminApiSession, session)
  else removeStorage(STORAGE_KEYS.adminApiSession)
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

export async function adminLogin(email: string, password: string): Promise<boolean> {
  const response = await fetch(new URL('/api/auth/login', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) return false

  const body = (await response.json()) as ApiResponse<AuthResponse>
  if (!body.data.user.roles.includes('Admin')) return false

  setAdminSession({
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    accessTokenExpiresAt: body.data.accessTokenExpiresAt,
    user: body.data.user,
  })
  return true
}

export function adminLogout() {
  setAdminSession(null)
}

// Refresh tokens are single-use and rotate on each call — see client.ts for why concurrent
// 401s must share one in-flight refresh instead of each consuming the same token.
let refreshInFlight: Promise<StoredAdminSession | null> | null = null

function refreshAdminSession(): Promise<StoredAdminSession | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function performRefresh(): Promise<StoredAdminSession | null> {
  const session = getAdminSession()
  if (!session) return null

  const response = await fetch(new URL('/api/auth/refresh', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!response.ok) {
    setAdminSession(null)
    return null
  }

  const body = (await response.json()) as ApiResponse<AuthResponse>
  const next: StoredAdminSession = {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    accessTokenExpiresAt: body.data.accessTokenExpiresAt,
    user: body.data.user,
  }
  setAdminSession(next)
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

  const session = getAdminSession()
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (session) headers.Authorization = `Bearer ${session.accessToken}`

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && session && !_isRetry) {
    const refreshed = await refreshAdminSession()
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

export function adminApiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  return request<T>('GET', path, undefined, params)
}

export function adminApiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

export function adminApiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PUT', path, body)
}
