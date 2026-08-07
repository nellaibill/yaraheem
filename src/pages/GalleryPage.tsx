import { useState } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { GalleryGrid } from '@/features/gallery/components/GalleryGrid'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GalleryImage } from '@/types'

const FILTERS: { label: string; value: GalleryImage['category'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Dishes', value: 'dishes' },
  { label: 'Events', value: 'events' },
  { label: 'Kitchen', value: 'kitchen' },
]

export default function GalleryPage() {
  const [filter, setFilter] = useState<GalleryImage['category'] | 'all'>('all')

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Gallery"
        title="Moments We've Catered"
        description="A glimpse into our kitchens, our dishes, and the celebrations we've had the honor of serving."
      />

      <div className="mt-10 flex justify-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as GalleryImage['category'] | 'all')}>
          <TabsList>
            {FILTERS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-10">
        <GalleryGrid filter={filter} />
      </div>
    </div>
  )
}
