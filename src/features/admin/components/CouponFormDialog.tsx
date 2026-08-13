import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAdminCoupon, updateAdminCoupon } from '@/lib/api/couponApi'
import { ApiError } from '@/lib/api/client'
import type { CouponDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: CouponDto | null
  onSaved: () => void
}) {
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discountPercent, setDiscountPercent] = useState('10')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
  const [minOrderSubtotal, setMinOrderSubtotal] = useState('0')
  const [usageLimit, setUsageLimit] = useState('')
  const [perUserLimit, setPerUserLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(coupon?.code ?? '')
    setTitle(coupon?.title ?? '')
    setDescription(coupon?.description ?? '')
    setDiscountPercent(String(coupon?.discountPercent ?? 10))
    setMaxDiscountAmount(coupon?.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '')
    setMinOrderSubtotal(String(coupon?.minOrderSubtotal ?? 0))
    setUsageLimit(coupon?.usageLimit != null ? String(coupon.usageLimit) : '')
    setPerUserLimit(coupon?.perUserLimit != null ? String(coupon.perUserLimit) : '')
  }, [open, coupon])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || (!coupon && !code.trim())) {
      toast.error('Code and title are required')
      return
    }

    setSubmitting(true)
    try {
      const shared = {
        title: title.trim(),
        description: description.trim() || null,
        discountPercent: Number(discountPercent),
        maxDiscountAmount: maxDiscountAmount.trim() ? Number(maxDiscountAmount) : null,
        minOrderSubtotal: Number(minOrderSubtotal),
        usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
        perUserLimit: perUserLimit.trim() ? Number(perUserLimit) : null,
        validUntil: null,
      }

      if (coupon) {
        await updateAdminCoupon(coupon.id, { ...shared, isActive: coupon.isActive })
        toast.success('Coupon updated')
      } else {
        await createAdminCoupon({ ...shared, code: code.trim() })
        toast.success('Coupon created')
      }
      onOpenChange(false)
      onSaved()
    } catch (error) {
      toast.error(coupon ? 'Could not update coupon' : 'Could not create coupon', { description: errorMessage(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update this coupon’s terms.' : 'Codes are stored uppercase and applied at checkout.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cp-code">Code</Label>
              <Input
                id="cp-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={!!coupon}
                placeholder="WELCOME50"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cp-title">Title</Label>
              <Input id="cp-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cp-description">Description</Label>
            <Input id="cp-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cp-percent">Discount %</Label>
              <Input id="cp-percent" type="number" min={1} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cp-max">Max ₹ off</Label>
              <Input id="cp-max" type="number" min={0} value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} placeholder="No cap" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cp-min">Min order ₹</Label>
              <Input id="cp-min" type="number" min={0} value={minOrderSubtotal} onChange={(e) => setMinOrderSubtotal(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cp-usage-limit">Total use limit</Label>
              <Input id="cp-usage-limit" type="number" min={1} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cp-per-user">Per-customer limit</Label>
              <Input id="cp-per-user" type="number" min={1} value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} placeholder="Unlimited" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? 'Saving…' : coupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
