import { DEMO_PASSWORD, demoUsers, findDemoUser } from '@/mocks/fixtures/users'
import type { AuthResponse, UserDto } from '@/lib/api/types'

// No real security in a client-side demo — tokens just encode which demo user they belong to,
// so requests can be attributed to a caller without a session store.
const TOKEN_PREFIX = 'demo-token:'

export function issueAuth(user: UserDto): AuthResponse {
  const token = `${TOKEN_PREFIX}${user.email}`
  return {
    accessToken: token,
    refreshToken: token,
    accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    user,
  }
}

export function tryLogin(email: string, password: string): UserDto | null {
  if (password !== DEMO_PASSWORD) return null
  return findDemoUser(email) ?? null
}

export function callerFromRequest(request: Request): UserDto | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length)
  if (!token.startsWith(TOKEN_PREFIX)) return null
  const email = token.slice(TOKEN_PREFIX.length)
  return demoUsers.find((u) => u.email === email) ?? null
}
