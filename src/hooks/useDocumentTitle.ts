import { useEffect } from 'react'
import { SITE } from '@/lib/constants'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | ${SITE.shortName}`
    return () => {
      document.title = previous
    }
  }, [title])
}
