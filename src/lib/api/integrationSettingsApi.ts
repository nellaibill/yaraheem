import { adminApiGet, adminApiPut } from '@/lib/api/adminClient'
import type { IntegrationSettingsResponse } from '@/lib/api/types'

export function fetchIntegrationSettings(): Promise<IntegrationSettingsResponse> {
  return adminApiGet<IntegrationSettingsResponse>('/api/admin/settings/integrations')
}

/** Omit a key to leave it unchanged; pass an empty string to clear a stored override. */
export function updateIntegrationSettings(values: Record<string, string>): Promise<void> {
  return adminApiPut<void>('/api/admin/settings/integrations', { values })
}
