import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/constants'
import { cateringPackages } from '@/features/catering/data/cateringData'
import type { CateringInquiry } from '@/types'

export function InquiryDialog({
  open,
  onOpenChange,
  packageId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId?: string
}) {
  const [, setInquiries] = useLocalStorage<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries, [])
  const [selectedPackage, setSelectedPackage] = useState(packageId ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const inquiry: CateringInquiry = {
      id: crypto.randomUUID(),
      name: String(formData.get('name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      eventDate: String(formData.get('eventDate') ?? ''),
      guestCount: Number(formData.get('guestCount') ?? 0),
      packageId: selectedPackage || undefined,
      message: String(formData.get('message') ?? ''),
      createdAt: new Date().toISOString(),
    }

    setInquiries((prev) => [...prev, inquiry])
    toast.success("Thank you! We've received your inquiry and will reach out shortly.")
    event.currentTarget.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setSelectedPackage(packageId ?? '')
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a Catering Quote</DialogTitle>
          <DialogDescription>
            Share your event details and our team will get back within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="eventDate">Event date</Label>
              <Input id="eventDate" name="eventDate" type="date" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="guestCount">Guest count</Label>
              <Input id="guestCount" name="guestCount" type="number" min={1} required placeholder="150" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="package">Package</Label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger id="package">
                <SelectValue placeholder="Select a package (optional)" />
              </SelectTrigger>
              <SelectContent>
                {cateringPackages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="message">Tell us about your event</Label>
            <Textarea id="message" name="message" placeholder="Wedding reception, 200 guests, outdoor venue..." />
          </div>
          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full sm:w-auto">
              Submit Inquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
