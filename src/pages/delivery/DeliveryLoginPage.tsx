import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bike, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeliveryAuth } from '@/features/delivery/hooks/useDeliveryAuth'
import { defaultDeliveryPartners } from '@/features/delivery/data/deliveryPartners'

export default function DeliveryLoginPage() {
  const { login, isAuthenticated } = useDeliveryAuth()
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/delivery" replace />
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!login(mobile)) {
      setError('Mobile number not found in the delivery partner roster')
      return
    }
    setError('')
    navigate('/delivery', { replace: true })
  }

  return (
    <div className="from-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-[#3a0d18] to-[#26060f] px-4 py-10">
      <div className="bg-noise absolute inset-0 text-white/[0.04]" />
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
          <p className="text-muted-foreground text-sm">Enter your registered mobile number</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="dp-mobile">Mobile number</Label>
            <div className="relative">
              <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
                +91
              </span>
              <Input
                id="dp-mobile"
                type="tel"
                inputMode="numeric"
                autoFocus
                placeholder="9123456701"
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
            Login
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-dashed p-3">
          <p className="text-muted-foreground mb-1.5 text-xs font-medium">Demo accounts</p>
          <ul className="text-muted-foreground space-y-0.5 text-xs">
            {defaultDeliveryPartners.slice(0, 3).map((p) => (
              <li key={p.id}>
                {p.name} — {p.mobile}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
