import { CheckCircle2, ChefHat, ClipboardCheck, Truck, UtensilsCrossed, XCircle, type LucideIcon } from 'lucide-react'
import type { BackendOrderStatus } from '@/lib/api/types'

export const ORDER_STATUS_SEQUENCE: readonly BackendOrderStatus[] = [1, 2, 3, 4, 5]

export const ORDER_STATUS_META: Record<BackendOrderStatus, { label: string; icon: LucideIcon }> = {
  1: { label: 'Order Placed', icon: ClipboardCheck },
  2: { label: 'Confirmed', icon: ChefHat },
  3: { label: 'Preparing', icon: UtensilsCrossed },
  4: { label: 'Out for Delivery', icon: Truck },
  5: { label: 'Delivered', icon: CheckCircle2 },
  6: { label: 'Cancelled', icon: XCircle },
}
