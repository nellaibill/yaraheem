import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  const { user } = useAuth()

  if (!user) return null

  return (
    <Link
      to="/profile"
      aria-label="Your profile"
      className="ring-offset-background focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
    </Link>
  )
}
