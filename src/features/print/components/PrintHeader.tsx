import { UtensilsCrossed } from 'lucide-react'
import { SITE } from '@/lib/constants'

export function PrintHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-start justify-between border-b-2 border-black pb-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-black text-white">
          <UtensilsCrossed className="size-5" />
        </span>
        <div>
          <p className="font-display text-xl font-bold">{SITE.name}</p>
          <p className="text-xs text-gray-600">{SITE.address}</p>
          <p className="text-xs text-gray-600">
            {SITE.phone} · {SITE.email}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-display text-lg font-bold tracking-wide uppercase">{subtitle}</p>
      </div>
    </div>
  )
}
