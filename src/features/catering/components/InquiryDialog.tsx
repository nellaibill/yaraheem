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
import { cateringPackages } from '@/features/catering/data/cateringData'
import { submitCateringInquiry } from '@/lib/api/leadsApi'
import { ApiError } from '@/lib/api/client'

export function InquiryDialog({
  open,
  onOpenChange,
  packageId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId?: string
}) {
  const [selectedPackage, setSelectedPackage] = useState(packageId ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const packageName = cateringPackages.find((pkg) => pkg.id === selectedPackage)?.name

    setSubmitting(true)
    try {
      await submitCateringInquiry({
        name: String(formData.get('name') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        email: String(formData.get('email') ?? '') || undefined,
        eventDate: String(formData.get('eventDate') ?? '') || undefined,
        guestCount: Number(formData.get('guestCount') ?? 0) || undefined,
        packageName,
        message: String(formData.get('message') ?? '') || undefined,
      })
      toast.success("Thank you! We've received your inquiry and will reach out shortly.")
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Could not submit your inquiry', {
        description: error instanceof ApiError ? error.message : 'Please try again in a moment.',
      })
    } finally {
      setSubmitting(false)
    }
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
            <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
