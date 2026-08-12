import { CheckCircle2, ChefHat, ClipboardCheck, Truck, UtensilsCrossed, XCircle, type LucideIcon } from 'lucide-react'
import type { BackendOrderStatus } from '@/lib/api/types'

export const ORDER_STATUS_SEQUENCE: readonly BackendOrderStatus[] = [1, 2, 3, 4, 5]

export const ORDER_STATUS_META: Record<BackendOrderStatus, { label: string; icon: LucideIcon; badgeClassName: string }> = {
  1: { label: 'Order Placed', icon: ClipboardCheck, badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: 'Confirmed', icon: ChefHat, badgeClassName: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  3: { label: 'Preparing', icon: UtensilsCrossed, badgeClassName: 'bg-amber-100 text-amber-700 border-amber-200' },
  4: { label: 'Out for Delivery', icon: Truck, badgeClassName: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  5: { label: 'Delivered', icon: CheckCircle2, badgeClassName: 'bg-green-100 text-green-700 border-green-200' },
  6: { label: 'Cancelled', icon: XCircle, badgeClassName: 'bg-red-100 text-red-700 border-red-200' },
}

/** Mirrors the backend's OrderStatusTransitionService — for UI filtering only; the backend still enforces this. */
export const ORDER_STATUS_ALLOWED_TRANSITIONS: Record<BackendOrderStatus, BackendOrderStatus[]> = {
  1: [2, 6],
  2: [3, 6],
  3: [4, 6],
  4: [5],
  5: [],
  6: [],
}
