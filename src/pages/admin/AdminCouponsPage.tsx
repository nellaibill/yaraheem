import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { CouponFormDialog } from '@/features/admin/components/CouponFormDialog'
import { deleteAdminCoupon, fetchAdminCoupons, updateAdminCoupon } from '@/lib/api/couponApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { CouponDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

export default function AdminCouponsPage() {
  useDocumentTitle('Coupons')
  const [coupons, setCoupons] = useState<CouponDto[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<CouponDto | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAdminCoupons()
      .then((result) => {
        if (!cancelled) setCoupons(result)
      })
      .catch((error) => {
        if (!cancelled) toast.error('Could not load coupons', { description: errorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [version])

  function refresh() {
    setVersion((v) => v + 1)
  }

  function openCreate() {
    setEditingCoupon(null)
    setFormOpen(true)
  }

  function openEdit(coupon: CouponDto) {
    setEditingCoupon(coupon)
    setFormOpen(true)
  }

  async function handleToggleActive(coupon: CouponDto, isActive: boolean) {
    try {
      await updateAdminCoupon(coupon.id, {
        title: coupon.title,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderSubtotal: coupon.minOrderSubtotal,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
        validUntil: coupon.validUntil,
        isActive,
      })
      toast.success(isActive ? 'Coupon activated' : 'Coupon deactivated')
      refresh()
    } catch (error) {
      toast.error('Could not update coupon', { description: errorMessage(error) })
    }
  }

  async function confirmDelete() {
    if (!deletingCoupon) return
    try {
      await deleteAdminCoupon(deletingCoupon.id)
      toast.success('Coupon deleted')
      setDeletingCoupon(null)
      refresh()
    } catch (error) {
      toast.error('Could not delete coupon', { description: errorMessage(error) })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground text-sm">{coupons.length} coupon codes</p>
        </div>
        <Button variant="gold" className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" />
          New Coupon
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">No coupons yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider">
                      <Tag className="size-3.5" />
                      {coupon.code}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{coupon.title}</p>
                  </div>
                  <Badge variant={coupon.isActive ? 'gold' : 'secondary'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>

                {coupon.description && <p className="text-muted-foreground text-xs">{coupon.description}</p>}

                <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>{coupon.discountPercent}% off</span>
                  {coupon.maxDiscountAmount != null && <span>Max {formatCurrency(coupon.maxDiscountAmount)}</span>}
                  <span>Min order {formatCurrency(coupon.minOrderSubtotal)}</span>
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>
                    Used {coupon.usageCount}
                    {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ''}
                  </span>
                  {coupon.perUserLimit != null && <span>{coupon.perUserLimit} per customer</span>}
                </div>

                <div className="mt-1 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={coupon.isActive} onCheckedChange={(checked) => handleToggleActive(coupon, checked)} />
                    <span className="text-muted-foreground text-xs">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => openEdit(coupon)} aria-label="Edit coupon">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive size-8"
                      onClick={() => setDeletingCoupon(coupon)}
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CouponFormDialog open={formOpen} onOpenChange={setFormOpen} coupon={editingCoupon} onSaved={refresh} />

      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              <div>
                <p className="font-display text-lg font-semibold">Delete coupon "{deletingCoupon.code}"?</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  This can&rsquo;t be undone. Past orders that used this coupon keep their recorded discount.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeletingCoupon(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
