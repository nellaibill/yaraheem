import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Banknote, CreditCard, Plus, ShoppingBag, Smartphone, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SectionHeading } from '@/components/common/SectionHeading'
import { useCart } from '@/features/cart/hooks/useCart'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAddresses } from '@/features/checkout/hooks/useAddresses'
import { useOrders } from '@/features/checkout/hooks/useOrders'
import { AddressCard } from '@/features/checkout/components/AddressCard'
import { AddressFormDialog } from '@/features/checkout/components/AddressFormDialog'
import { findOffer, calculateDiscount } from '@/features/offers/data/offersData'
import { formatCurrency } from '@/lib/utils'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { Address, Order, PaymentMethod } from '@/types'

const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { lines, totalPrice, clear } = useCart()
  const { user } = useAuth()
  const { addresses, addAddress } = useAddresses()
  const { placeOrder } = useOrders()

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  )
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  const appliedOffer = appliedCode ? findOffer(appliedCode) : undefined
  const discount = appliedOffer ? calculateDiscount(appliedOffer, totalPrice) : 0
  const deliveryFee = totalPrice - discount >= FREE_DELIVERY_THRESHOLD || totalPrice === 0 ? 0 : DELIVERY_FEE
  const grandTotal = Math.max(totalPrice - discount + deliveryFee, 0)

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingBag className="text-muted-foreground size-14" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
        <p className="text-muted-foreground">Your cart is empty right now.</p>
        <Button asChild variant="gold" size="lg">
          <Link to="/menu">Browse Menu</Link>
        </Button>
      </div>
    )
  }

  function handleApplyCoupon() {
    const offer = findOffer(couponInput)
    if (!offer) {
      toast.error('Invalid coupon code')
      return
    }
    if (totalPrice < offer.minOrder) {
      toast.error(`Add ${formatCurrency(offer.minOrder - totalPrice)} more to use ${offer.code}`)
      return
    }
    setAppliedCode(offer.code)
    toast.success(`Coupon ${offer.code} applied!`)
  }

  function handleSaveAddress(address: Omit<Address, 'id'>) {
    const created = addAddress(address)
    setSelectedAddressId(created.id)
  }

  function handlePlaceOrder() {
    const address = addresses.find((a) => a.id === selectedAddressId)
    if (!address) {
      toast.error('Please select a delivery address')
      return
    }
    if (!user) return

    setPlacing(true)
    const order: Order = {
      id: crypto.randomUUID(),
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
      total: grandTotal,
      couponCode: appliedCode ?? undefined,
      address,
      paymentMethod,
      status: 'placed',
      statusUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: 35,
    }

    setTimeout(() => {
      placeOrder(order)
      clear()
      toast.success('Order placed successfully!')
      navigate(`/orders/${order.id}`, { replace: true })
    }, 600)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
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

            {appliedOffer ? (
              <div className="flex items-center justify-between rounded-lg bg-green-600/10 px-3 py-2 text-xs text-green-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="size-3.5" />
                  {appliedOffer.code} applied
                </span>
                <button onClick={() => setAppliedCode(null)} aria-label="Remove coupon">
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="h-9 text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
            )}

            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>

            <Button variant="gold" size="lg" className="mt-2 w-full" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — ${formatCurrency(grandTotal)}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddressFormDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} onSave={handleSaveAddress} />
    </div>
  )
}
