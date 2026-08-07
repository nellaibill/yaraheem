import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { MOCK_OTP } from '@/lib/constants'

const OTP_LENGTH = MOCK_OTP.length

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, requestOtp } = useAuth()
  const mobile = (location.state as { mobile?: string } | null)?.mobile

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!mobile) {
      navigate('/login', { replace: true })
      return
    }
    inputsRef.current[0]?.focus()
  }, [mobile, navigate])

  if (!mobile) return null
  const mobileNumber: string = mobile

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handleVerify() {
    const code = digits.join('')
    if (code.length !== OTP_LENGTH) {
      setError('Enter the complete OTP')
      return
    }
    if (!verifyOtp(mobileNumber, code)) {
      setError(`Incorrect OTP — try ${MOCK_OTP} for this demo`)
      return
    }
    setError('')
    navigate('/auth-success', { replace: true })
  }

  function handleResend() {
    requestOtp(mobileNumber)
    setDigits(Array(OTP_LENGTH).fill(''))
    inputsRef.current[0]?.focus()
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
          <ShieldCheck className="size-5.5" />
        </span>
        <h1 className="font-display text-2xl font-bold">Verify OTP</h1>
        <p className="text-muted-foreground text-sm">
          Sent to <span className="font-medium">+91 {mobile}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/30 size-12 rounded-md border text-center text-lg font-semibold shadow-sm outline-none focus-visible:ring-2"
          />
        ))}
      </div>
      {error && <p className="text-destructive mt-3 text-center text-xs">{error}</p>}

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Demo mode — use <span className="font-semibold">{MOCK_OTP}</span> to continue
      </p>

      <Button variant="gold" size="lg" className="mt-6 w-full" onClick={handleVerify}>
        Verify &amp; Continue
      </Button>

      <div className="mt-4 flex items-center justify-between text-xs">
        <button onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">
          Change number
        </button>
        <button onClick={handleResend} className="text-primary font-medium hover:underline">
          Resend OTP
        </button>
      </div>
    </motion.div>
  )
}
