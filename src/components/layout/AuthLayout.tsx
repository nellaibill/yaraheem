import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="from-primary relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-[#3a0d18] to-[#26060f] px-4 py-10">
      <div className="bg-noise absolute inset-0 text-white/[0.04]" />
      <div className="bg-gold/10 absolute -top-24 -right-24 size-72 rounded-full blur-3xl" />
      <div className="bg-gold/10 absolute -bottom-24 -left-24 size-72 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <Toaster position="top-center" />
    </div>
  )
}
