import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import { readStorage, writeStorage } from '@/lib/storage'
import { ThemeProviderContext, type Theme } from '@/app/providers/theme-context'

function resolveSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStorage(STORAGE_KEYS.theme, 'light' as Theme))

  const resolvedTheme = theme === 'system' ? resolveSystemTheme() : theme

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      theme: resolvedTheme,
      setTheme: (next: Theme) => {
        writeStorage(STORAGE_KEYS.theme, next)
        setThemeState(next)
      },
    }),
    [resolvedTheme],
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}
