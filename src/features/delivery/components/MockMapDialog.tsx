import { MapPin, Navigation } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Address } from '@/types'

export function MockMapDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="size-4.5" />
            Delivery Location
          </DialogTitle>
          <DialogDescription>Mock map preview — no live map integration in this POC.</DialogDescription>
        </DialogHeader>
        <div className="from-primary relative flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br to-[#3a0d18]">
          <div className="bg-noise absolute inset-0 text-white/[0.06]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <span className="bg-gold text-gold-foreground relative flex size-12 items-center justify-center rounded-full shadow-xl">
            <MapPin className="size-6" />
          </span>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">{address.label}</p>
          <p className="text-muted-foreground mt-0.5">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
