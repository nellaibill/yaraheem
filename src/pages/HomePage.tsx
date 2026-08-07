import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChefHat, Clock, Sparkles, Tag, Users2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DishVisual } from '@/components/common/DishVisual'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { TestimonialCard } from '@/features/testimonials/components/TestimonialCard'
import { menuItems, MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { testimonials } from '@/features/testimonials/data/testimonialsData'
import { offers } from '@/features/offers/data/offersData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SITE } from '@/lib/constants'
import type { MenuCategory } from '@/types'

const signatureDishes = menuItems.filter((item) => item.isSignature).slice(0, 4)
const categoryList = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]
const featuredOffer = offers[0]

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
  useDocumentTitle('Premium Biryani & Catering')

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

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Shop by Category</h2>
          <Link to="/categories" className="text-primary text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {categoryList.map((category) => (
            <Link
              key={category}
              to={`/menu?category=${category}`}
              className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center"
            >
              <DishVisual category={category} seed={category} className="size-20 rounded-2xl transition-transform group-hover:scale-105" />
              <span className="text-xs font-medium">{MENU_CATEGORY_LABELS[category]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/offers"
          className="from-gold/20 to-gold/5 border-gold/30 flex items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r px-6 py-4 transition-colors hover:bg-gold/10"
        >
          <div className="flex items-center gap-3">
            <span className="bg-gold text-gold-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
              <Tag className="size-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{featuredOffer.title} — Code {featuredOffer.code}</p>
              <p className="text-muted-foreground text-xs">{featuredOffer.description}</p>
            </div>
          </div>
          <ArrowRight className="text-muted-foreground size-4 shrink-0" />
        </Link>
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
            {testimonials.slice(0, 4).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/reviews">
                View All Reviews <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
