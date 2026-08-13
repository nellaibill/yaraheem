import { adminApiGet } from '@/lib/api/adminClient'
import type { AuditLogEntryDto, PagedResult } from '@/lib/api/types'

export interface AuditLogQuery {
  action?: string
  entityType?: string
  actorEmail?: string
  page?: number
  pageSize?: number
}

export function fetchAuditLogs(query: AuditLogQuery = {}): Promise<PagedResult<AuditLogEntryDto>> {
  return adminApiGet<PagedResult<AuditLogEntryDto>>('/api/admin/audit-logs', {
    action: query.action,
    entityType: query.entityType,
    actorEmail: query.actorEmail,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 50,
  })
}
