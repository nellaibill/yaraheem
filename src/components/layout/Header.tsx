import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu as MenuIcon, Phone, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/layout/Logo'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { useCart } from '@/features/cart/hooks/useCart'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-colors',
        scrolled ? 'bg-background/90 border-border backdrop-blur-md' : 'bg-background/60 border-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary bg-secondary'
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary/60',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <a href={`tel:${SITE.phone}`} className="hidden md:block">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Phone className="size-4" />
              {SITE.phone}
            </Button>
          </a>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-4.5" />
            {totalItems > 0 && (
              <Badge
                variant="gold"
                className="absolute -top-1 -right-1 size-5 justify-center rounded-full p-0 text-[10px]"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
          <UserMenu />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3.5 py-3 text-base font-medium transition-colors',
                        isActive ? 'text-primary bg-secondary' : 'text-foreground/80 hover:bg-secondary/60',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  )
}
