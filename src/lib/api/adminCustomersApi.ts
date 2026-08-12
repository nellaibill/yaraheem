import { adminApiGet } from '@/lib/api/adminClient'
import type { CustomerSummaryDto } from '@/lib/api/types'

export function fetchAdminCustomers(): Promise<CustomerSummaryDto[]> {
  return adminApiGet<CustomerSummaryDto[]>('/api/admin/customers')
}
