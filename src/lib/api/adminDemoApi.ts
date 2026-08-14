import { adminApiPost } from '@/lib/api/adminClient'

export function resetDemoData(): Promise<void> {
  return adminApiPost<void>('/api/admin/demo/reset')
}
