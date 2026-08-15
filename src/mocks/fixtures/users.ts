import type { UserDto } from '@/lib/api/types'

// Mirrors the real seeded demo accounts (IdentitySeeder/DineInSeeder/DeliverySeeder) — same
// emails, names, and roles, so the credentials sheet works unchanged against the demo build.
export const DEMO_PASSWORD = 'Admin@123'

export const demoUsers: UserDto[] = [
  {
    id: 'user-admin',
    email: 'admin@ecommerce.local',
    firstName: 'System',
    lastName: 'Admin',
    phoneNumber: null,
    roles: ['Admin'],
  },
  {
    id: 'user-waiter1',
    email: 'waiter1@ecommerce.local',
    firstName: 'Demo',
    lastName: 'Waiter',
    phoneNumber: null,
    roles: ['Waiter'],
  },
  {
    id: 'user-kitchen1',
    email: 'kitchen1@ecommerce.local',
    firstName: 'Demo',
    lastName: 'Kitchen',
    phoneNumber: null,
    roles: ['Kitchen'],
  },
  {
    id: 'user-supervisor1',
    email: 'supervisor1@ecommerce.local',
    firstName: 'Demo',
    lastName: 'Supervisor',
    phoneNumber: null,
    roles: ['Waiter', 'Kitchen'],
  },
  {
    id: 'user-partner1',
    email: 'partner1@ecommerce.local',
    firstName: 'Ravi',
    lastName: 'Kumar',
    phoneNumber: '9840012345',
    roles: ['DeliveryPartner'],
  },
  {
    id: 'user-partner2',
    email: 'partner2@ecommerce.local',
    firstName: 'Suresh',
    lastName: 'Babu',
    phoneNumber: '9840012346',
    roles: ['DeliveryPartner'],
  },
  {
    id: 'user-customer1',
    email: 'customer1@ecommerce.local',
    firstName: 'Demo',
    lastName: 'Customer1',
    phoneNumber: '9999999991',
    roles: ['Customer'],
  },
  {
    id: 'user-customer2',
    email: 'customer2@ecommerce.local',
    firstName: 'Demo',
    lastName: 'Customer2',
    phoneNumber: '9999999992',
    roles: ['Customer'],
  },
]

export function findDemoUser(email: string): UserDto | undefined {
  return demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
}
