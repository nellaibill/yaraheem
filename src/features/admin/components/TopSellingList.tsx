import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import type { TopSellingItem } from '@/features/admin/lib/analytics'

export function TopSellingList({ items }: { items: TopSellingItem[] }) {
  const max = Math.max(...items.map((i) => i.quantitySold), 1)

  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No sales data yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={item.itemId} className="flex items-center gap-3">
          <span className="text-muted-foreground w-5 text-sm font-semibold">{index + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">{item.name}</span>
              <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                {item.quantitySold} sold · {formatCurrency(item.revenue)}
              </span>
            </div>
            <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.quantitySold / max) * 100}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-gold h-full rounded-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
