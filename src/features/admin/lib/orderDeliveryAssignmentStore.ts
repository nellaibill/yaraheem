import { readStorage, writeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * Delivery-partner assignment has no backend model (Orders/Cart/Payments never modeled a
 * rider concept), so it stays a local, orderId-keyed map — same frontend-only status as
 * spice level or combo contents elsewhere. Previously this was scoped per-customer mobile
 * number, but real backend orders only carry a userId, so it's now a flat map instead.
 */
export function getAssignedPartnerId(orderId: string): string | undefined {
  const map = readStorage<Record<string, string>>(STORAGE_KEYS.adminOrderDeliveryAssignments, {})
  return map[orderId]
}

export function setAssignedPartnerId(orderId: string, partnerId: string | undefined) {
  const map = readStorage<Record<string, string>>(STORAGE_KEYS.adminOrderDeliveryAssignments, {})
  if (partnerId) map[orderId] = partnerId
  else delete map[orderId]
  writeStorage(STORAGE_KEYS.adminOrderDeliveryAssignments, map)
}
