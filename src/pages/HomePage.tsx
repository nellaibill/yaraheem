import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChefHat, Clock, ImageIcon, Sparkles, Tag, Users2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DishVisual } from '@/components/common/DishVisual'
import { MenuSectionStrip } from '@/features/menu/components/MenuSectionStrip'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { TestimonialCard } from '@/features/testimonials/components/TestimonialCard'
import { CateringPackageCard } from '@/features/catering/components/CateringPackageCard'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { testimonials } from '@/features/testimonials/data/testimonialsData'
import { offers } from '@/features/offers/data/offersData'
import { cateringPackages } from '@/features/catering/data/cateringData'
import { galleryImages } from '@/features/gallery/data/galleryData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { HERO_BANNER_IMAGE } from '@/lib/foodImages'
import { DEFAULT_RESTAURANT_SETTINGS, SITE, STORAGE_KEYS } from '@/lib/constants'
import type { MenuCategory, MenuSectionKey, RestaurantSettings } from '@/types'

const categoryList = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]
const featuredOffer = offers[0]
const galleryPreview = galleryImages.slice(0, 6)

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
    description: 'Traditional South Tamil Nadu recipes passed down through generations of master chefs.',
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
    description: 'Seeraga samba rice, hand-ground spices, and fresh chicken sourced daily, every order.',
  },
]

export default function HomePage() {
  useDocumentTitle('Premium Biryani & Catering')
  const navigate = useNavigate()
  const { items, sections } = useMenuData()
  const [settings] = useLocalStorage<RestaurantSettings>(STORAGE_KEYS.restaurantSettings, DEFAULT_RESTAURANT_SETTINGS)

  const availableItems = items.filter((item) => item.isAvailable !== false)
  const bySection = (key: MenuSectionKey) => availableItems.filter((item) => item.sections?.includes(key))
  const sectionByKey = (key: MenuSectionKey) => sections.find((s) => s.key === key)
  const todaysSpecialKey = settings.todaysSpecialKey
  const bestSellers = availableItems.filter((item) => item.isBestSeller)
  const combos = availableItems.filter((item) => item.category === 'combos')

  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src={HERO_BANNER_IMAGE}
          alt="A South Tamil Nadu biryani feast"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="from-primary/95 via-primary/90 to-[#26060f]/95 absolute inset-0 bg-gradient-to-br" />
        <div className="bg-noise absolute inset-0 text-white/[0.04]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gold/15 text-gold w-fit rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase"
          >
            South Tamil Nadu&rsquo;s Signature Biryani House
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-balance font-display text-4xl font-bold text-white sm:text-6xl"
          >
            Authentic Biryani, Crafted for Every Celebration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-balance text-white/75 sm:text-lg"
          >
            {SITE.tagline} From Daily Specials to Midnight Fuel, Yaraheem brings restaurant-grade
            South Tamil Nadu biryani and chicken specials to your table.
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

        <div className="relative border-t border-white/10 bg-black/20">
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

      {settings.offersEnabled && featuredOffer && (
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
      )}

      {sectionByKey(todaysSpecialKey) && (
        <MenuSectionStrip section={sectionByKey(todaysSpecialKey)!} items={bySection(todaysSpecialKey)} />
      )}

      {bestSellers.length > 0 && (
        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Fan Favorites"
              title="Best Sellers"
              description="The dishes our guests reorder every single week."
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.slice(0, 4).map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {todaysSpecialKey !== 'friday' && sectionByKey('friday') && (
        <MenuSectionStrip section={sectionByKey('friday')!} items={bySection('friday')} />
      )}
      {todaysSpecialKey !== 'sunday' && sectionByKey('sunday') && (
        <MenuSectionStrip section={sectionByKey('sunday')!} items={bySection('sunday')} />
      )}
      {todaysSpecialKey !== 'midnight' && sectionByKey('midnight') && (
        <MenuSectionStrip section={sectionByKey('midnight')!} items={bySection('midnight')} dark />
      )}

      {combos.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Feed the Whole Table"
              title="Combos & Family Packs"
              description="Pre-built spreads for every group size — from a family dinner to a full-blown celebration."
            />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {combos.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-2xl border p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                    <span className="font-display text-lg font-bold">₹{item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  {item.comboSlots && (
                    <ul className="text-muted-foreground mt-1 flex flex-col gap-1 text-xs">
                      {item.comboSlots.map((slot) => (
                        <li key={slot} className="flex items-start gap-1.5">
                          <span className="bg-gold mt-1.5 size-1 shrink-0 rounded-full" />
                          {slot}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button asChild variant="outline" className="mt-2">
                    <Link to={`/food/${item.id}`}>View Combo</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Catering"
            title="Packages for Every Occasion"
            description="From 20-guest gatherings to 500-guest weddings — fully staffed, fully catered."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cateringPackages.slice(0, 4).map((pkg) => (
              <CateringPackageCard key={pkg.id} pkg={pkg} onEnquire={() => navigate('/catering')} />
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

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved by Hosts Across South Tamil Nadu"
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

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <SectionHeading eyebrow="Gallery" title="Moments We've Catered" align="left" className="mb-0" />
            <Link to="/gallery" className="text-primary hidden shrink-0 items-center gap-1 text-sm font-medium hover:underline sm:flex">
              View gallery <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {galleryPreview.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: (index % 6) * 0.04 }}
              >
                <Link to="/gallery" className="group block overflow-hidden rounded-xl">
                  <DishVisual
                    seed={image.id}
                    category="biryani"
                    className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
                    iconClassName="size-8"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex justify-center sm:hidden">
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/gallery">
                <ImageIcon className="size-4" /> View Gallery
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
      </section>
    </div>
  )
}
