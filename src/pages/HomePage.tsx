import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChefHat, Clock, Sparkles, Users2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DishVisual } from '@/components/common/DishVisual'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { TestimonialCard } from '@/features/testimonials/components/TestimonialCard'
import { menuItems } from '@/features/menu/data/menuData'
import { testimonials } from '@/features/testimonials/data/testimonialsData'
import { SITE } from '@/lib/constants'

const signatureDishes = menuItems.filter((item) => item.isSignature).slice(0, 4)

const STATS = [
  { label: 'Years of Legacy', value: '15+' },
  { label: 'Events Catered', value: '2,400+' },
  { label: 'Guests Served Yearly', value: '80,000+' },
  { label: 'Recipes Perfected', value: '60+' },
]

const FEATURES = [
  {
    icon: ChefHat,
    title: 'Authentic Dum Recipes',
    description: 'Traditional Hyderabadi Nizami recipes passed down through generations of master chefs.',
  },
  {
    icon: Clock,
    title: 'Always On Time',
    description: 'From intimate dinners to 500-plate weddings — we deliver punctually, every single time.',
  },
  {
    icon: Users2,
    title: 'Full-Service Staffing',
    description: 'Trained service staff, live counters, and complete setup so you can enjoy your own event.',
  },
  {
    icon: Sparkles,
    title: 'Premium Ingredients',
    description: 'Aged basmati, hand-ground spices, and free-range meats sourced fresh, every order.',
  },
]

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="from-primary via-primary to-[#26060f] absolute inset-0 bg-gradient-to-br" />
        <div className="bg-noise absolute inset-0 text-white/[0.04]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gold/15 text-gold w-fit rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Hyderabad&rsquo;s Signature Biryani House
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-balance font-display text-4xl font-bold text-white sm:text-6xl"
          >
            Royal Biryani, Crafted for Every Celebration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-balance text-white/75 sm:text-lg"
          >
            {SITE.tagline} From weddings to corporate lunches, Yaraheem brings restaurant-grade
            Hyderabadi biryani and Nizami cuisine to your table.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg" variant="gold" className="gap-2">
              <Link to="/catering">
                Book Catering <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/menu">Explore Menu</Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative border-t border-white/10 bg-black/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <p className="font-display text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="text-xs text-white/60 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Fan Favorites"
          title="Our Signature Dishes"
          description="The recipes our guests request again and again — dum-cooked to order, every time."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {signatureDishes.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/menu">
              View Full Menu <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Yaraheem"
            title="Catering Built for Peace of Mind"
            description="We handle the kitchen, the counters, and the crew — you host the moment."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
                className="bg-card flex flex-col gap-3 rounded-xl border p-6"
              >
                <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="from-maroon relative overflow-hidden rounded-2xl bg-gradient-to-r to-[#3a0d18] p-10 sm:p-16">
          <div className="bg-noise absolute inset-0 text-white/[0.05]" />
          <div className="relative flex flex-col items-start gap-5 sm:max-w-lg">
            <span className="bg-gold/20 text-gold rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase">
              Catering Services
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Planning a Wedding or Corporate Event?
            </h2>
            <p className="text-white/75">
              Choose from curated packages or build a custom menu. Our team manages everything from
              live counters to full staffing.
            </p>
            <Button asChild variant="gold" size="lg" className="gap-2">
              <Link to="/catering">
                View Catering Packages <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <DishVisual
            seed="catering-cta"
            category="biryani"
            className="absolute top-1/2 right-8 hidden size-40 -translate-y-1/2 rounded-full lg:flex"
          />
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by Hosts Across Hyderabad"
            description="Real feedback from families, planners, and companies we've had the honor of serving."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
