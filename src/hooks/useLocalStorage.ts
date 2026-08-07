import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '@/lib/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === key && event.newValue) {
        setValue(JSON.parse(event.newValue) as T)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return [value, setValue, reset] as const
}
