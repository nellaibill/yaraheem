import { Star } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TestimonialCard } from '@/features/testimonials/components/TestimonialCard'
import { testimonials } from '@/features/testimonials/data/testimonialsData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

export default function ReviewsPage() {
  useDocumentTitle('Reviews')
  const total = testimonials.length
  const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / total

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = testimonials.filter((t) => t.rating === stars).length
    return { stars, count, percent: total ? Math.round((count / total) * 100) : 0 }
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Reviews"
        title="What Our Guests Say"
        description="Honest feedback from customers and event hosts across South Tamil Nadu."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[280px_1fr]">
        <div className="bg-card h-fit rounded-2xl border p-6">
          <div className="text-center">
            <p className="font-display text-5xl font-bold">{average.toFixed(1)}</p>
            <div className="mt-2 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('size-4', i < Math.round(average) ? 'fill-gold text-gold' : 'text-muted-foreground/30')}
                />
              ))}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{total} reviews</p>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-3">{row.stars}</span>
                <Star className="fill-gold text-gold size-3" />
                <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                  <div className="bg-gold h-full rounded-full" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="text-muted-foreground w-6 text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  )
}
