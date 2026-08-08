import { useMemo, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MenuCard } from '@/features/menu/components/MenuCard'
import { MENU_CATEGORY_LABELS } from '@/features/menu/data/menuData'
import { useMenuData } from '@/features/menu/hooks/useMenuData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { items } = useMenuData()
  useDocumentTitle('Search')

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        MENU_CATEGORY_LABELS[item.category].toLowerCase().includes(term),
    )
  }, [query, items])

  const popularSearches = ['Biryani', 'Kebab', 'Haleem', 'Dessert', 'Chai']

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-xl">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for biryani, kebabs, desserts..."
          className="h-12 pl-11 text-base"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {!query && (
        <div className="mx-auto mt-8 max-w-xl">
          <p className="text-muted-foreground mb-3 text-sm font-medium">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="bg-secondary hover:bg-secondary/70 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <div className="mt-10">
          <p className="text-muted-foreground mb-6 text-sm">
            {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          {results.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center">
              No dishes found. Try searching for something else.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
