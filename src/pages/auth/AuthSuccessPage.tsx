import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function AuthSuccessPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    const timer = setTimeout(() => navigate('/', { replace: true }), 1600)
    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate])

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-gold text-gold-foreground flex size-24 items-center justify-center rounded-full shadow-xl"
      >
        <CheckCircle2 className="size-12" strokeWidth={1.5} />
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-white">Welcome, {user?.name}!</h1>
        <p className="mt-1 text-sm text-white/70">You're all set. Taking you home...</p>
      </motion.div>
    </div>
  )
}
