import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bike,
  ChevronLeft,
  ClipboardCheck,
  LayoutDashboard,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

const PORTALS = [
  {
    key: 'admin',
    icon: LayoutDashboard,
    title: 'Admin Portal',
    subtitle: 'Restaurant Management',
    description: 'The command center for the restaurant — orders, menu, customers, and performance, all in one place.',
    features: [
      { label: 'Manage Orders', icon: Receipt },
      { label: 'Manage Daily Menu', icon: UtensilsCrossed },
      { label: 'Manage Combos', icon: ClipboardCheck },
      { label: 'Manage Customers', icon: Users },
      { label: 'Manage Delivery Partners', icon: Bike },
      { label: 'View Reports', icon: BarChart3 },
    ],
    to: '/admin/login',
    gradient: 'from-primary via-primary to-[#26060f]',
  },
  {
    key: 'delivery',
    icon: Bike,
    title: 'Delivery Partner Portal',
    subtitle: 'On-the-Road Delivery Management',
    description: 'Everything a delivery partner needs on shift — assigned orders, live status updates, and navigation.',
    features: [
      { label: 'Assigned Orders', icon: ClipboardCheck },
      { label: 'Update Delivery Status', icon: Bike },
      { label: 'Customer Contact', icon: Phone },
      { label: 'View Delivery Location', icon: MapPin },
      { label: 'Delivery History', icon: Receipt },
    ],
    to: '/delivery/login',
    gradient: 'from-gold via-[#b8842a] to-[#8a5a1e]',
  },
]

export default function PortalSelectionPage() {
  useDocumentTitle('Portal Login')

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <Link to="/" className="text-muted-foreground hover:text-foreground mb-8 flex items-center gap-1 text-sm">
          <ChevronLeft className="size-4" />
          Back to website
        </Link>

        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="size-5.5" />
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Staff Portal</h1>
          <p className="text-muted-foreground max-w-lg text-sm sm:text-base">
            Choose the portal you need to sign in to. Both portals use their own dedicated login.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {PORTALS.map((portal, index) => (
            <motion.div
              key={portal.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group bg-card relative overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className={cn('bg-noise relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br text-white/90', portal.gradient)}>
                <div className="bg-noise absolute inset-0 text-white/[0.06]" />
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/10 relative flex size-20 items-center justify-center rounded-2xl backdrop-blur-sm"
                >
                  <portal.icon className="size-10" strokeWidth={1.5} />
                </motion.span>
              </div>

              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <div>
                  <p className="text-gold-foreground bg-gold/15 mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase">
                    {portal.subtitle}
                  </p>
                  <h2 className="font-display text-2xl font-bold">{portal.title}</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{portal.description}</p>
                </div>

                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {portal.features.map((feature) => (
                    <li key={feature.label} className="text-muted-foreground flex items-center gap-2 text-xs">
                      <feature.icon className="text-primary size-3.5 shrink-0" />
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <Link
                  to={portal.to}
                  className="bg-primary text-primary-foreground group-hover:bg-primary/90 mt-2 flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-bold tracking-wide shadow-sm transition-all group-hover:gap-3"
                >
                  Continue
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
