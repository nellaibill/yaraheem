import { useEffect, useState, type FormEvent } from 'react'
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
import { createAdminDeliveryPartner } from '@/lib/api/adminDeliveryApi'
import { ApiError } from '@/lib/api/client'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export function DeliveryPartnerFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Bike')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setPhoneNumber('')
      setVehicleType('Bike')
      setEmail('')
      setPassword('')
    }
  }, [open])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !phoneNumber.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      await createAdminDeliveryPartner({ name, phoneNumber, vehicleType, email, password })
      toast.success('Delivery partner added')
      onOpenChange(false)
      onCreated()
    } catch (error) {
      toast.error('Could not add delivery partner', { description: errorMessage(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Delivery Partner</DialogTitle>
          <DialogDescription>Creates a login account for this partner (Delivery Portal access).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="dp-name">Name</Label>
            <Input id="dp-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="dp-phone">Phone</Label>
              <Input id="dp-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dp-vehicle">Vehicle Type</Label>
              <Input id="dp-vehicle" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dp-email">Login Email</Label>
            <Input id="dp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dp-password">Login Password</Label>
            <Input
              id="dp-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Partner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
