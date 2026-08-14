import { Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useStaffAuth } from '@/features/staff/hooks/useStaffAuth'

export function StaffLayout() {
  const { staff, logout } = useStaffAuth()
  const navigate = useNavigate()

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
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </div>
  )
}
