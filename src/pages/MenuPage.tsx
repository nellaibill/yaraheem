import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SectionHeading } from '@/components/common/SectionHeading'
import { MenuFilters } from '@/features/menu/components/MenuFilters'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { MENU_SECTION_LABELS } from '@/lib/constants'
import type { MenuCategory, MenuSectionKey } from '@/types'

const VALID_CATEGORIES = new Set(Object.keys(MENU_CATEGORY_LABELS))
const VALID_SECTIONS = new Set(Object.keys(MENU_SECTION_LABELS))

function isMenuCategory(value: string | null): value is MenuCategory {
  return !!value && VALID_CATEGORIES.has(value)
}

function isMenuSectionKey(value: string | null): value is MenuSectionKey {
  return !!value && VALID_SECTIONS.has(value)
}

export default function MenuPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category')
  const sectionParam = searchParams.get('section')
  const [category, setCategory] = useState<MenuCategory | 'all'>(
    isMenuCategory(initialCategory) ? initialCategory : 'all',
  )
  const [vegOnly, setVegOnly] = useState(false)
  const { items } = useMenuData()
  const activeSection = isMenuSectionKey(sectionParam) ? sectionParam : null
  useDocumentTitle(activeSection ? MENU_SECTION_LABELS[activeSection] : 'Menu')

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.isAvailable === false) return false
      if (activeSection && !item.sections?.includes(activeSection)) return false
      if (category !== 'all' && item.category !== category) return false
      if (vegOnly && !item.isVeg) return false
      return true
    })
  }, [items, category, vegOnly, activeSection])

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Our Menu"
        title={activeSection ? MENU_SECTION_LABELS[activeSection] : 'A Feast of South Tamil Nadu Flavors'}
        description="From dum biryani to Midnight Fuel — every dish is prepared fresh to order. Add items to build your own order."
      />

      <div className="mt-10">
        <MenuFilters active={category} onChange={setCategory} vegOnly={vegOnly} onVegOnlyChange={setVegOnly} />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-muted-foreground py-20 text-center">No dishes match your filters.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
