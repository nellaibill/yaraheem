import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, LayoutDashboard, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminLoginPage() {
  useDocumentTitle('Admin Login')
  const { login, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    if (!(await login(username, password))) {
      setError('Invalid email or password')
      return
    }
    setError('')
    navigate('/admin', { replace: true })
  }

  return (
    <div className="from-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-[#3a0d18] to-[#26060f] px-4 py-10">
      <div className="bg-noise absolute inset-0 text-white/[0.04]" />
      <Link
        to="/portal"
        className="absolute top-6 left-6 z-10 flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white"
      >
        <ChevronLeft className="size-4" />
        Back to Portal Selection
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card relative z-10 w-full max-w-sm rounded-2xl p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
            <LayoutDashboard className="size-5.5" />
          </span>
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground text-sm">Sign in to manage the restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-username">Email</Label>
            <div className="relative">
              <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="admin-username"
                autoFocus
                placeholder="admin@ecommerce.local"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" className="mt-2 gap-2">
            <LayoutDashboard className="size-4" />
            Login to Dashboard
          </Button>
          <Link to="/admin/forgot-password" className="text-muted-foreground hover:text-foreground text-center text-xs font-medium">
            Forgot password?
          </Link>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-6 rounded-lg border border-dashed p-3">
            <p className="text-muted-foreground mb-1.5 text-xs font-medium">Dev only — seeded admin account</p>
            <p className="text-muted-foreground text-xs">
              Whatever email/password you configured via <code>AdminSeed</code> — see backend/SECRETS.md.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
