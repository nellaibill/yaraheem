import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Bike, History, Inbox, LayoutDashboard, LogOut, Receipt, Settings, UtensilsCrossed, Users } from 'lucide-react'
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth'
import { cn } from '@/lib/utils'

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
  { label: 'Menu', to: '/admin/menu', icon: UtensilsCrossed },
  { label: 'Orders', to: '/admin/orders', icon: Receipt },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Inquiries', to: '/admin/inquiries', icon: Inbox },
  { label: 'Delivery Partners', to: '/admin/delivery-partners', icon: Bike },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Audit Log', to: '/admin/audit-log', icon: History },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    onNavigate?.()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-5 py-5">
        <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full">
          <UtensilsCrossed className="size-4.5" />
        </span>
        <div className="leading-none">
          <p className="font-display text-sm font-bold">Ya Raheem</p>
          <p className="text-muted-foreground text-[10px] tracking-widest uppercase">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <item.icon className="size-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        {admin && <p className="text-muted-foreground mb-2 truncate text-xs">Signed in as {admin.name}</p>}
        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive mb-3 flex items-center gap-1.5 text-xs font-medium"
        >
          <LogOut className="size-3.5" />
          Log out
        </button>
        <NavLink to="/" className="text-muted-foreground hover:text-foreground text-xs font-medium">
          ← Back to customer site
        </NavLink>
      </div>
    </div>
  )
}
