import { readStorage, writeStorage, removeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import type { ApiResponse, AuthResponse, ProblemDetails } from '@/lib/api/types'

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

export interface StoredApiSession {
  mobile: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

export function getApiSession(): StoredApiSession | null {
  return readStorage<StoredApiSession | null>(STORAGE_KEYS.apiSession, null)
}

export function setApiSession(session: StoredApiSession | null) {
  if (session) writeStorage(STORAGE_KEYS.apiSession, session)
  else removeStorage(STORAGE_KEYS.apiSession)
}

function storeAuthResponse(mobile: string, auth: AuthResponse): StoredApiSession {
  const session: StoredApiSession = {
    mobile,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
  }
  setApiSession(session)
  return session
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

// Refresh tokens are single-use and rotate on each call, so concurrent 401s (e.g. every
// request a newly-loaded page fires at once) must share one in-flight refresh rather than
// each consuming the same token — the loser would otherwise get "invalid refresh token".
let refreshInFlight: Promise<StoredApiSession | null> | null = null

function refreshSession(): Promise<StoredApiSession | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function performRefresh(): Promise<StoredApiSession | null> {
  const session = getApiSession()
  if (!session) return null

  const response = await fetch(new URL('/api/auth/refresh', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!response.ok) {
    setApiSession(null)
    return null
  }

  const body = (await response.json()) as ApiResponse<AuthResponse>
  return storeAuthResponse(session.mobile, body.data)
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

  const session = getApiSession()
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (session) headers.Authorization = `Bearer ${session.accessToken}`

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && session && !_isRetry) {
    const refreshed = await refreshSession()
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

export function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  return request<T>('GET', path, undefined, params)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PUT', path, body)
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path)
}

/** Unauthenticated POST, used only by the auth bridge before a session exists. */
export async function apiPostAnonymous<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(new URL(path, API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status)
  }

  const responseBody = (await response.json()) as ApiResponse<T>
  return responseBody.data
}

export { storeAuthResponse }
