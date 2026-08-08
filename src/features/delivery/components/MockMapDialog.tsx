import { Navigation } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MockMapPicker } from '@/features/checkout/components/MockMapPicker'
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
  const hasCoords = address.lat !== undefined && address.lng !== undefined
  const fullAddress = `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.state} - ${address.pincode}`

  function handleNavigate() {
    const url = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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

        <MockMapPicker lat={hasCoords ? address.lat! : null} lng={hasCoords ? address.lng! : null} editable={false} />

        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">{address.label}</p>
          <p className="text-muted-foreground mt-0.5">{fullAddress}</p>
        </div>

        <Button variant="gold" className="gap-2" onClick={handleNavigate}>
          <Navigation className="size-4" />
          Navigate
        </Button>
      </DialogContent>
    </Dialog>
  )
}
