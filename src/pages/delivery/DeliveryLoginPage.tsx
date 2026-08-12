import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, ChevronLeft, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'

export default function DeliveryLoginPage() {
  const { login, isAuthenticated } = useDeliveryAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/delivery" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password')
      return
    }
    setSubmitting(true)
    setError('')
    const success = await login(email.trim(), password)
    setSubmitting(false)
    if (!success) {
      setError('Email or password is incorrect')
      return
    }
    navigate('/delivery', { replace: true })
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
            <Bike className="size-5.5" />
          </span>
          <h1 className="font-display text-2xl font-bold">Delivery Partner Login</h1>
          <p className="text-muted-foreground text-sm">Enter your registered email</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="dp-email">Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="dp-email"
                type="email"
                autoFocus
                placeholder="partner1@ecommerce.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dp-password">Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="dp-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" className="mt-2 gap-2" disabled={submitting}>
            <Bike className="size-4" />
            {submitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-6 rounded-lg border border-dashed p-3">
            <p className="text-muted-foreground text-xs">
              Dev seed accounts live in backend/SECRETS.md — not shown in production builds.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
