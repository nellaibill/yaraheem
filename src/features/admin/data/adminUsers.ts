import type { AdminUser } from '@/types'

/** Default admin account seeded into localStorage on first load — mock only, no real backend. */
export const defaultAdminUsers: AdminUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Restaurant Admin',
  },
]
