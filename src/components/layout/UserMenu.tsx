import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/hooks/useAuth'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (!user) return null

  function handleLogout() {
    logout()
    setOpen(false)
    toast.success('Logged out successfully')
    navigate('/splash', { replace: true })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Account"
        className="ring-offset-background focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-4.5" />
              Account
            </DialogTitle>
            <DialogDescription>Signed in with a mock, per-number session.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">+91 {user.mobile}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
