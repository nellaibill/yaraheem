import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { writeStorage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'

const SLIDES = [
  {
    icon: ChefHat,
    title: 'Authentic South Tamil Nadu Biryani',
    description: 'Dum-cooked recipes passed down for 15 years, made fresh for every order.',
  },
  {
    icon: Clock,
    title: 'Order in Minutes',
    description: 'Browse the menu, track your order live, and get it delivered right on time.',
  },
  {
    icon: Sparkles,
    title: 'Catering for Every Occasion',
    description: 'From family dinners to 500-guest weddings — we handle it all.',
  },
]

export default function WelcomePage() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 3200)
    return () => clearInterval(timer)
  }, [])

  function handleContinue() {
    writeStorage(STORAGE_KEYS.authSeenWelcome, true)
    navigate('/login')
  }

  const Active = SLIDES[slide]

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="relative flex h-56 w-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <span className="bg-gold/15 text-gold flex size-20 items-center justify-center rounded-full">
              <Active.icon className="size-9" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{Active.title}</h2>
              <p className="mt-2 max-w-xs text-sm text-white/70">{Active.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === slide ? 'bg-gold w-6' : 'w-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>

      <Button variant="gold" size="lg" className="w-full" onClick={handleContinue}>
        Get Started
      </Button>
    </div>
  )
}
