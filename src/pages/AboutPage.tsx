import { motion } from 'framer-motion'
import { Award, Heart, Leaf, Users } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DishVisual } from '@/components/common/DishVisual'
import { Card, CardContent } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const VALUES = [
  {
    icon: Heart,
    title: 'Made with Heart',
    description: 'Every biryani is dum-cooked the traditional way — no shortcuts, no compromises.',
  },
  {
    icon: Leaf,
    title: 'Fresh, Always',
    description: 'Spices ground daily, meats sourced fresh, and rice aged for the perfect grain.',
  },
  {
    icon: Users,
    title: 'Family at Heart',
    description: 'Started as a family kitchen, we still cook every order like it\'s for our own family.',
  },
  {
    icon: Award,
    title: 'Award-Winning Taste',
    description: 'Recognized among South Tamil Nadu\'s top catering services for consistency and flavor.',
  },
]

const TIMELINE = [
  { year: '2010', text: 'Ya Raheem began as a small family kitchen serving biryani to neighbors.' },
  { year: '2014', text: 'Opened our first dine-in restaurant on Trivandrum Road, Tirunelveli.' },
  { year: '2018', text: 'Launched full-scale catering services for weddings and corporate events.' },
  { year: '2024', text: 'Crossed 2,400 events catered with a team of 40+ culinary professionals.' },
]

export default function AboutPage() {
  useDocumentTitle('About Us')

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center gap-5"
        >
          <span className="text-gold-foreground bg-gold/15 w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase">
            Our Story
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Fifteen Years of Authentic Tamil Flavor
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Ya Raheem Catering Services began in a modest Tirunelveli kitchen with one goal: to bring the
            authentic taste of South Tamil Nadu — seeraga samba biryani, fiery chicken 65, and midnight
            snack combos — to every table. What started with a single pot of biryani has grown into a
            full-service catering house trusted for weddings, corporate events, and everyday
            celebrations across Tirunelveli, Madurai, and the districts around them.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, our kitchen is led by chefs trained in traditional dum techniques, using recipes
            refined over generations. Whether it's an intimate family dinner or a 500-guest wedding,
            we bring the same care, spice, and soul to every plate.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <DishVisual seed="about-hero" category="biryani" className="aspect-4/3 w-full rounded-2xl" />
        </motion.div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="flex flex-col items-center gap-3 p-6">
                  <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full">
                    <value.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-base font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Our Journey" title="Milestones Along the Way" />
        <div className="mt-12 space-y-8 border-l pl-8">
          {TIMELINE.map((entry) => (
            <motion.div
              key={entry.year}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <span className="bg-gold border-background absolute top-1 -left-[2.55rem] size-4 rounded-full border-4" />
              <p className="text-gold font-display text-lg font-bold">{entry.year}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{entry.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
