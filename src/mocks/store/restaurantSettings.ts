import type { RestaurantSettingsDto } from '@/lib/api/types'

// Mirrors the real backend's RestaurantSettingsService — a single in-memory row, reset to
// defaults on every page load same as the rest of the demo store.
let settings: RestaurantSettingsDto = {
  acceptingOrders: true,
  offersEnabled: true,
  todaysSpecialKey: 'daily',
  bannerEnabled: true,
  bannerTitle: 'Weekend Treat',
  bannerDescription: '15% off every Saturday and Sunday. Use code WEEKEND15 at checkout.',
  bannerCode: 'WEEKEND15',
  minOrderValue: 199,
  deliveryRadiusKm: 12,
  openTime: '11:00',
  closeTime: '23:00',
}

export function getRestaurantSettings(): RestaurantSettingsDto {
  return settings
}

export function updateRestaurantSettings(next: RestaurantSettingsDto): RestaurantSettingsDto {
  settings = { ...next, bannerCode: next.bannerCode?.trim() || null }
  return settings
}
