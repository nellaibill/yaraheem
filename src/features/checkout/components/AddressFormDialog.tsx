import { useState, type FormEvent } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { detectCurrentLocation } from '@/features/checkout/data/mockLocation'
import type { Address, AddressLabel } from '@/types'

export function AddressFormDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (address: Omit<Address, 'id'>) => void
}) {
  const [label, setLabel] = useState<AddressLabel>('Home')
  const [locating, setLocating] = useState(false)
  const [fields, setFields] = useState({ line1: '', line2: '', city: '', state: '', pincode: '' })

  async function handleUseCurrentLocation() {
    setLocating(true)
    const detected = await detectCurrentLocation()
    setFields(detected)
    setLocating(false)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSave({ label, ...fields })
    onOpenChange(false)
    setFields({ line1: '', line2: '', city: '', state: '', pincode: '' })
    setLabel('Home')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Delivery Address</DialogTitle>
          <DialogDescription>Used only within this demo — stored in your browser.</DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={handleUseCurrentLocation}
          disabled={locating}
        >
          {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
          {locating ? 'Detecting location...' : 'Use Current Location'}
        </Button>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="addr-label">Label</Label>
            <Select value={label} onValueChange={(v) => setLabel(v as AddressLabel)}>
              <SelectTrigger id="addr-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="addr-line1">Address Line 1</Label>
            <Input
              id="addr-line1"
              required
              value={fields.line1}
              onChange={(e) => setFields((f) => ({ ...f, line1: e.target.value }))}
              placeholder="Flat / House no, Street"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="addr-line2">Address Line 2 (optional)</Label>
            <Input
              id="addr-line2"
              value={fields.line2}
              onChange={(e) => setFields((f) => ({ ...f, line2: e.target.value }))}
              placeholder="Landmark, area"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                required
                value={fields.city}
                onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addr-state">State</Label>
              <Input
                id="addr-state"
                required
                value={fields.state}
                onChange={(e) => setFields((f) => ({ ...f, state: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="addr-pincode">Pincode</Label>
            <Input
              id="addr-pincode"
              required
              value={fields.pincode}
              onChange={(e) => setFields((f) => ({ ...f, pincode: e.target.value }))}
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
