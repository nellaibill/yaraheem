import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import { StickyCartBar } from '@/features/cart/components/StickyCartBar'
import { Toaster } from '@/components/ui/sonner'

const HIDE_STICKY_CART_ON = new Set(['/cart', '/checkout'])

export function Layout() {
  const { pathname } = useLocation()
  const hideStickyCart = HIDE_STICKY_CART_ON.has(pathname)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 sr-only"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className={hideStickyCart ? 'flex-1' : 'flex-1 pb-20 lg:pb-0'}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyCartBar hidden={hideStickyCart} />
      <Toaster position="top-center" />
    </div>
  )
}
