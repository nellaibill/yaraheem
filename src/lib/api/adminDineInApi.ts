import { adminApiGet } from '@/lib/api/adminClient'
import type { TableSessionDto } from '@/lib/api/types'

/** Most recent 200 dine-in table sessions, kept deliberately separate from fetchAdminOrders (online/delivery). */
export function fetchAdminDineInSessions(): Promise<TableSessionDto[]> {
  return adminApiGet<TableSessionDto[]>('/api/admin/dinein/sessions')
}
