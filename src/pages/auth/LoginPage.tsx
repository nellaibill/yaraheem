import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { requestOtp } = useAuth()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const digits = mobile.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    requestOtp(digits)
    navigate('/otp', { state: { mobile: digits } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl p-8 shadow-xl"
    >
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
          <UtensilsCrossed className="size-5.5" />
        </span>
        <h1 className="font-display text-2xl font-bold">Welcome to Ya Raheem</h1>
        <p className="text-muted-foreground text-sm">Enter your mobile number to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="mobile">Mobile number</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
              +91
            </span>
            <Input
              id="mobile"
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="98765 43210"
              value={mobile}
              maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              className="pl-11"
            />
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <Button type="submit" variant="gold" size="lg" className="mt-2 gap-2">
          <Phone className="size-4" />
          Send OTP
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        By continuing, you agree this is a demo — no real SMS is sent.
      </p>
    </motion.div>
  )
}
