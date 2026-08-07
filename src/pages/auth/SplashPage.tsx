import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { readStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { SITE } from '@/lib/constants'

export default function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/', { replace: true })
        return
      }
      const seenWelcome = readStorage(STORAGE_KEYS.authSeenWelcome, false)
      navigate(seenWelcome ? '/login' : '/welcome', { replace: true })
    }, 1600)
    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate])

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-gold text-gold-foreground flex size-24 items-center justify-center rounded-full shadow-xl"
      >
        <UtensilsCrossed className="size-11" strokeWidth={1.75} />
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="font-display text-3xl font-bold text-white">{SITE.shortName}</h1>
        <p className="mt-1 text-sm tracking-[0.3em] text-white/60 uppercase">Catering</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-6 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="bg-gold size-2 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  )
}
