import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChefHat, LogOut, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useStaffAuth } from '@/features/staff/hooks/useStaffAuth'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-primary-foreground text-primary' : 'text-primary-foreground/80 hover:bg-primary-foreground/10',
  )

export function StaffLayout() {
  const { staff, logout } = useStaffAuth()
  const navigate = useNavigate()

  const canRunFloor = staff?.roles.some((r) => r === 'Waiter' || r === 'Admin') ?? false
  const canRunKitchen = staff?.roles.some((r) => r === 'Kitchen' || r === 'Admin') ?? false
  const showNav = canRunFloor && canRunKitchen

  function handleLogout() {
    logout()
    toast.success('Logged out')
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <header className="bg-primary text-primary-foreground sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary-foreground text-primary flex size-9 items-center justify-center rounded-full">
              <UtensilsCrossed className="size-4.5" />
            </span>
            <div className="leading-none">
              <p className="text-sm font-semibold">{staff?.name}</p>
              {staff && <p className="text-primary-foreground/70 mt-1 text-[11px]">{staff.email}</p>}
            </div>
          </div>
          <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
        {showNav && (
          <nav className="mx-auto flex max-w-5xl gap-2 px-4 pb-3">
            <NavLink to="/staff" end className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="size-4" />
                Tables
              </span>
            </NavLink>
            <NavLink to="/staff/kitchen" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <ChefHat className="size-4" />
                Kitchen
              </span>
            </NavLink>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </div>
  )
}
