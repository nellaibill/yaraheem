import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/common/SectionHeading'
import { DishVisual } from '@/components/common/DishVisual'
import { menuItems, MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { MenuCategory } from '@/types'

const CATEGORIES = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]

export default function CategoriesPage() {
  useDocumentTitle('Categories')

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Browse"
        title="Shop by Category"
        description="Jump straight to the dishes you're craving."
      />

      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((category, index) => {
          const count = menuItems.filter((item) => item.category === category).length
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
            >
              <Link
                to={`/menu?category=${category}`}
                className="group relative block overflow-hidden rounded-xl"
              >
                <DishVisual
                  category={category}
                  seed={category}
                  className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
                  iconClassName="size-12"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-lg font-semibold">{MENU_CATEGORY_LABELS[category]}</p>
                  <p className="text-xs text-white/70">{count} dishes</p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
