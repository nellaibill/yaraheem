import { motion } from 'framer-motion'
import { DishVisual } from '@/components/common/DishVisual'
import { galleryImages } from '@/features/gallery/data/galleryData'
import type { GalleryImage } from '@/types'

const CATEGORY_TO_MENU_MAP: Record<GalleryImage['category'], 'biryani' | 'combos' | 'chicken-specials'> = {
  dishes: 'biryani',
  events: 'combos',
  kitchen: 'chicken-specials',
}

export function GalleryGrid({ filter }: { filter: GalleryImage['category'] | 'all' }) {
  const images = galleryImages.filter((image) => filter === 'all' || image.category === filter)

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <motion.figure
          key={image.id}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
          className="group relative overflow-hidden rounded-xl"
        >
          <DishVisual
            category={CATEGORY_TO_MENU_MAP[image.category]}
            seed={image.id}
            className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            {image.caption}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  )
}
