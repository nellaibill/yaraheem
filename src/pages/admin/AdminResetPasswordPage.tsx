import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ChevronLeft, KeyRound, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/api/passwordResetApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminResetPasswordPage() {
  useDocumentTitle('Reset Password')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(token.trim(), newPassword)
      toast.success('Password reset — please log in with your new password.')
      navigate('/admin/login', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="from-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-[#3a0d18] to-[#26060f] px-4 py-10">
      <div className="bg-noise absolute inset-0 text-white/[0.04]" />
      <Link to="/admin/login" className="absolute top-6 left-6 z-10 flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white">
        <ChevronLeft className="size-4" />
        Back to Login
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card relative z-10 w-full max-w-sm rounded-2xl p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
            <KeyRound className="size-5.5" />
          </span>
          <h1 className="font-display text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Paste the reset token from your email, then choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="rp-token">Reset Token</Label>
            <Input id="rp-token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the token here" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rp-password">New Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="rp-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rp-confirm">Confirm New Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="rp-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}

          <Button type="submit" variant="gold" size="lg" className="mt-2" disabled={submitting}>
            {submitting ? 'Resetting…' : 'Reset Password'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
