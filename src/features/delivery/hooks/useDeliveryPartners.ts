import { useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import { defaultDeliveryPartners } from '@/features/delivery/data/deliveryPartners'
import type { DeliveryPartner, DeliveryPartnerStatus } from '@/types'

export function useDeliveryPartners() {
  const [partners, setPartners] = useLocalStorage<DeliveryPartner[]>(
    STORAGE_KEYS.deliveryPartners,
    defaultDeliveryPartners,
  )

  const updateStatus = useCallback(
    (id: string, status: DeliveryPartnerStatus) => {
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    },
    [setPartners],
  )

  const assignOrder = useCallback(
    (id: string, orderId: string | undefined) => {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, activeOrderId: orderId, status: orderId ? 'busy' : 'available' }
            : p,
        ),
      )
    },
    [setPartners],
  )

  const getPartner = useCallback((id: string) => partners.find((p) => p.id === id), [partners])

  return { partners, updateStatus, assignOrder, getPartner }
}
