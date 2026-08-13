import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/lib/api/passwordResetApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminForgotPasswordPage() {
  useDocumentTitle('Forgot Password')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      const result = await forgotPassword(email.trim())
      setSent(true)
      setDevToken(result.devOnlyResetToken)
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
          <h1 className="font-display text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">We'll email you a reset link if that account exists.</p>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm">If <strong>{email}</strong> is a registered account, a reset link is on its way.</p>
            {devToken && (
              <div className="rounded-lg border border-dashed p-3 text-left">
                <p className="text-muted-foreground mb-1.5 text-xs font-medium">Dev only — no SMTP provider configured</p>
                <p className="text-muted-foreground mb-2 text-xs">
                  Email wasn't actually sent. Use this token directly:
                </p>
                <Link to={`/admin/reset-password?token=${encodeURIComponent(devToken)}`} className="text-primary text-xs font-medium break-all underline">
                  {devToken}
                </Link>
              </div>
            )}
            <Button asChild variant="outline">
              <Link to="/admin/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="fp-email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="fp-email"
                  type="email"
                  autoFocus
                  placeholder="admin@ecommerce.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="gold" size="lg" className="mt-2" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
