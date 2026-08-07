import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import type { DayRevenue } from '@/features/admin/lib/analytics'

export function RevenueChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="flex h-48 items-end gap-3 sm:gap-4">
      {data.map((day, index) => {
        const heightPercent = (day.revenue / max) * 100
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-medium">
              {day.revenue > 0 ? formatCurrency(day.revenue) : ''}
            </span>
            <div className="bg-muted relative flex h-32 w-full items-end overflow-hidden rounded-md">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="bg-primary w-full rounded-md"
              />
            </div>
            <span className="text-muted-foreground text-xs font-medium">{day.label}</span>
          </div>
        )
      })}
    </div>
  )
}
