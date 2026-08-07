import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}
    >
      {eyebrow && (
        <span className="text-gold-foreground bg-gold/15 w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {description && (
        <p className={cn('text-muted-foreground max-w-2xl text-sm sm:text-base', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
