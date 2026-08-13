import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Banknote, CreditCard, Plus, ShoppingBag, Smartphone, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SectionHeading } from '@/components/common/SectionHeading'
import { EmptyState } from '@/components/common/EmptyState'
import { useCart } from '@/features/cart/hooks/useCart'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAddresses } from '@/features/checkout/hooks/useAddresses'
import { useOrders } from '@/features/checkout/hooks/useOrders'
import { AddressCard } from '@/features/checkout/components/AddressCard'
import { AddressFormDialog } from '@/features/checkout/components/AddressFormDialog'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { formatCurrency } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { checkout } from '@/lib/api/ordersApi'
import { previewCoupon } from '@/lib/api/couponApi'
import { DEFAULT_RESTAURANT_SETTINGS, PAYMENT_METHOD_LABELS, STORAGE_KEYS } from '@/lib/constants'
import type { Address, Order, PaymentMethod, RestaurantSettings } from '@/types'

/** Backend DummyPaymentService: "ONLINE" settles immediately, anything else is treated as COD. */
const BACKEND_PAYMENT_METHOD: Record<PaymentMethod, string> = {
  cash: 'COD',
  upi: 'ONLINE',
  card: 'ONLINE',
}

const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { lines, totalPrice, deliveryFee, grandTotal, clear } = useCart()
  const { user } = useAuth()
  const { addresses, addAddress } = useAddresses()
  const { placeOrder } = useOrders()
  const [settings] = useLocalStorage<RestaurantSettings>(STORAGE_KEYS.restaurantSettings, DEFAULT_RESTAURANT_SETTINGS)
  useDocumentTitle('Checkout')

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  )
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [placing, setPlacing] = useState(false)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const discount = appliedCoupon?.discountAmount ?? 0
  const finalTotal = Math.max(grandTotal - discount, 0)

  // Generated once per checkout session (not per click) so repeated clicks of "Place Order"
  // — a double-click or a retried request after a dropped response — replay the same
  // idempotency key and the backend returns the original order instead of a duplicate.
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  async function handleApplyCoupon() {
    const code = couponInput.trim()
    if (!code) return

    setApplyingCoupon(true)
    setCouponError(null)
    try {
      const result = await previewCoupon(code, totalPrice)
      if (!result.isValid) {
        setCouponError(result.errorMessage ?? 'This coupon could not be applied.')
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon({ code: code.toUpperCase(), discountAmount: result.discountAmount })
      toast.success(`Coupon "${code.toUpperCase()}" applied — -${formatCurrency(result.discountAmount)}`)
    } catch (error) {
      setCouponError(error instanceof ApiError ? error.message : 'Could not check that coupon — please try again.')
      setAppliedCoupon(null)
    } finally {
      setApplyingCoupon(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError(null)
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        fullPage
        icon={ShoppingBag}
        title="Nothing to check out"
        description="Your cart is empty right now."
        actionLabel="Browse Menu"
        actionTo="/menu"
      />
    )
  }

  function handleSaveAddress(address: Omit<Address, 'id'>) {
    const created = addAddress(address)
    setSelectedAddressId(created.id)
  }

  async function handlePlaceOrder() {
    const address = addresses.find((a) => a.id === selectedAddressId)
    if (!address) {
      toast.error('Please select a delivery address')
      return
    }
    if (!user) return

    setPlacing(true)
    try {
      const result = await checkout(
        {
          paymentMethod: BACKEND_PAYMENT_METHOD[paymentMethod],
          shippingAddress: {
            fullName: user.name,
            phoneNumber: user.mobile,
            addressLine1: address.line1,
            addressLine2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.pincode,
            country: 'India',
          },
          couponCode: appliedCoupon?.code,
        },
        idempotencyKey,
      )

      // The backend order/cart are now authoritative; this mirror keeps the existing
      // local order-tracking/profile pages (out of scope for this change) working
      // against the real order id, since they still read from local storage.
      const order: Order = {
        id: result.orderId,
        mobile: user.mobile,
        lines: lines.map((line) => ({
          itemId: line.itemId,
          name: line.item.name,
          price: line.item.price,
          quantity: line.quantity,
        })),
        itemsTotal: totalPrice,
        discount,
        deliveryFee,
        total: finalTotal,
        address,
        paymentMethod,
        status: 'placed',
        statusUpdatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        estimatedDeliveryMinutes: 35,
      }
      placeOrder(order)
      await clear()
      toast.success(`Order ${result.orderNumber} placed successfully!`)
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      toast.error('Could not place order', {
        description: error instanceof ApiError ? error.message : 'Something went wrong — please try again.',
      })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      <SectionHeading eyebrow="Almost There" title="Checkout" align="left" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Delivery Address</h2>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddressDialogOpen(true)}>
                <Plus className="size-3.5" />
                Add New
              </Button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                No saved addresses yet — add one to continue.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    selected={selectedAddressId === address.id}
                    onSelect={() => setSelectedAddressId(address.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display mb-3 text-lg font-semibold">Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="gap-3">
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => {
                const Icon = PAYMENT_ICONS[method]
                return (
                  <Label
                    key={method}
                    htmlFor={`pay-${method}`}
                    className="hover:bg-secondary/30 flex cursor-pointer items-center gap-3 rounded-xl border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/50"
                  >
                    <RadioGroupItem value={method} id={`pay-${method}`} />
                    <Icon className="text-muted-foreground size-4.5" />
                    <span className="text-sm font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
                  </Label>
                )
              })}
            </RadioGroup>
          </div>
        </div>

        <Card className="h-fit">
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-display text-lg font-semibold">Order Summary</h2>

            <div className="flex flex-col gap-1.5">
              {lines.map((line) => (
                <div key={line.itemId} className="text-muted-foreground flex justify-between text-xs">
                  <span className="truncate pr-2">
                    {line.quantity} × {line.item.name}
                  </span>
                  <span className="shrink-0">{formatCurrency(line.lineTotal)}</span>
                </div>
              ))}
            </div>

            <Separator />

            {settings.offersEnabled &&
              (appliedCoupon ? (
                <div className="bg-secondary/30 flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Tag className="size-3.5" />
                    {appliedCoupon.code} applied
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-destructive" aria-label="Remove coupon">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput.trim()}
                    >
                      {applyingCoupon ? 'Checking...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && <p className="text-destructive text-xs">{couponError}</p>}
                </div>
              ))}

            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            <Button variant="gold" size="lg" className="mt-2 w-full" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — ${formatCurrency(finalTotal)}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddressFormDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} onSave={handleSaveAddress} />

      <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur-md lg:hidden">
        <Button variant="gold" size="lg" className="w-full" onClick={handlePlaceOrder} disabled={placing}>
          {placing ? 'Placing Order...' : `Place Order — ${formatCurrency(finalTotal)}`}
        </Button>
      </div>
    </div>
  )
}
