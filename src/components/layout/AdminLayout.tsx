import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu as MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { seedDemoDataIfNeeded } from '@/features/admin/lib/adminStore'

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    seedDemoDataIfNeeded()
  }, [])

  return (
    <div className="bg-secondary/30 flex min-h-screen">
      <a
        href="#admin-main-content"
        className="bg-primary text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 sr-only"
      >
        Skip to content
      </a>
      <aside className="bg-card hidden w-64 shrink-0 border-r lg:block">
        <AdminSidebar />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card flex h-16 items-center gap-3 border-b px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
            <MenuIcon className="size-5" />
          </Button>
          <p className="font-display text-sm font-bold">Ya Raheem Admin</p>
        </header>
        <main id="admin-main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" />
    </div>
  )
}
