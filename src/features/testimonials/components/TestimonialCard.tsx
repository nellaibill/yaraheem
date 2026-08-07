import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types'

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="h-full p-2">
        <CardContent className="flex h-full flex-col gap-4 p-4">
          <Quote className="text-gold size-7" />
          <p className="text-sm leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold">{testimonial.name}</p>
              <p className="text-muted-foreground text-xs">{testimonial.role}</p>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3.5',
                    i < testimonial.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30',
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
