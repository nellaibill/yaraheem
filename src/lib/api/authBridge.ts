import { ApiError, apiPostAnonymous, getApiSession, storeAuthResponse } from '@/lib/api/client'
import type { AuthResponse } from '@/lib/api/types'

/**
 * The frontend's customer auth is mobile+OTP with no password (a mock flow — see
 * AuthProvider). The backend Catalog/Cart/Orders APIs require a real JWT tied to a
 * registered email+password user. To wire Cart/Checkout to the API without rebuilding
 * the customer-facing auth UI, each mobile number is deterministically mapped to a
 * synthetic backend account (login, or register on first use) behind the scenes.
 */
function credentialsFor(mobile: string) {
  return {
    email: `guest-${mobile}@yaraheem.local`,
    password: `Yaraheem@${mobile}`,
  }
}

// Dedupes concurrent calls for the same mobile (e.g. React StrictMode's double-invoked
// effects) so two simultaneous first-time logins can't both fall through to register
// and race each other on the same email.
const inFlight = new Map<string, Promise<void>>()

export function ensureBackendSession(mobile: string, name: string): Promise<void> {
  if (getApiSession()?.mobile === mobile) return Promise.resolve()

  const existing = inFlight.get(mobile)
  if (existing) return existing

  const promise = bridge(mobile, name).finally(() => inFlight.delete(mobile))
  inFlight.set(mobile, promise)
  return promise
}

async function bridge(mobile: string, name: string): Promise<void> {
  const { email, password } = credentialsFor(mobile)

  if (await tryLogin(mobile, email, password)) return

  const [firstName, ...rest] = name.trim().split(/\s+/)
  try {
    const auth = await apiPostAnonymous<AuthResponse>('/api/auth/register', {
      email,
      password,
      firstName: firstName || 'Guest',
      lastName: rest.join(' ') || mobile.slice(-4),
      phoneNumber: mobile,
    })
    storeAuthResponse(mobile, auth)
  } catch (error) {
    // Another concurrent bridge call (or another tab) may have registered this
    // account a moment ago — one more login attempt covers that race.
    if (await tryLogin(mobile, email, password)) return
    throw error
  }
}

async function tryLogin(mobile: string, email: string, password: string): Promise<boolean> {
  try {
    const auth = await apiPostAnonymous<AuthResponse>('/api/auth/login', { email, password })
    storeAuthResponse(mobile, auth)
    return true
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) return false
    throw error
  }
}
