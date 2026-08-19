import { apiGet } from '@/lib/api/client'
import { adminApiPut } from '@/lib/api/adminClient'
import type { RestaurantSettingsDto } from '@/lib/api/types'

export function fetchRestaurantSettings(): Promise<RestaurantSettingsDto> {
  return apiGet<RestaurantSettingsDto>('/api/settings/restaurant')
}

export function updateRestaurantSettings(payload: RestaurantSettingsDto): Promise<RestaurantSettingsDto> {
  return adminApiPut<RestaurantSettingsDto>('/api/admin/settings/restaurant', payload)
}
