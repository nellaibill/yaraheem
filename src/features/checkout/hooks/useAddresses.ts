import { useCallback } from 'react'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import type { Address } from '@/types'

export function useAddresses() {
  const [addresses, setAddresses] = useScopedStorage<Address[]>(STORAGE_KEYS.addresses, [])

  const addAddress = useCallback(
    (address: Omit<Address, 'id'>) => {
      const newAddress: Address = { ...address, id: crypto.randomUUID() }
      setAddresses((prev) => {
        const next = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev
        return [...next, newAddress]
      })
      return newAddress
    },
    [setAddresses],
  )

  const removeAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    },
    [setAddresses],
  )

  const setDefaultAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
    },
    [setAddresses],
  )

  return { addresses, addAddress, removeAddress, setDefaultAddress }
}
