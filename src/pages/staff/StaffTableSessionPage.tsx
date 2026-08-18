import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Ban, Check, ChevronLeft, Gift, Minus, Plus, Printer, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  fetchTableSession,
  fireRound,
  requestBill,
  closeTableSession,
  cancelRound,
  markRoundServed,
  createDineInPayment,
  verifyDineInPayment,
  applySessionDiscount,
  removeSessionDiscount,
  compRoundItem,
  uncompRoundItem,
} from '@/lib/api/dineInApi'
import { fetchProducts } from '@/lib/api/catalogApi'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn, formatCurrency } from '@/lib/utils'
import type { DineInRoundDto, DineInRoundItemDto, ProductListResponse, TableSessionDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const SESSION_STATUS_LABEL: Record<number, string> = { 1: 'Open', 2: 'Bill Requested', 3: 'Closed' }
const ROUND_STATUS_LABEL: Record<number, string> = { 1: 'Fired', 2: 'Preparing', 3: 'Ready', 4: 'Served', 5: 'Cancelled' }
const PAYMENT_STATUS_LABEL: Record<number, string> = { 1: 'Pending', 2: 'Paid', 3: 'Failed' }
const PAYMENT_STATUS_BADGE: Record<number, 'secondary' | 'outline'> = { 1: 'outline', 2: 'secondary', 3: 'outline' }
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Razorpay']
const ROUND_STATUS_POLL_MS = 5000
const ALL_CATEGORY_ID = ''

function paidTotal(session: TableSessionDto): number {
  return session.payments.filter((p) => p.status === 2).reduce((sum, p) => sum + p.amount, 0)
}

interface DraftLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
}

export default function StaffTableSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  useDocumentTitle('Table Session')

  const [session, setSession] = useState<TableSessionDto | null>(null)
  const [products, setProducts] = useState<ProductListResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<DraftLine[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY_ID)
  const [firing, setFiring] = useState(false)
  const [busy, setBusy] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [collectingPayment, setCollectingPayment] = useState(false)
  const [splitCount, setSplitCount] = useState(1)
  const [splitMethods, setSplitMethods] = useState<Record<number, string>>({})
  const [collectingSplitIndex, setCollectingSplitIndex] = useState<number | null>(null)
  const [roundToCancel, setRoundToCancel] = useState<DineInRoundDto | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [servingRoundId, setServingRoundId] = useState<string | null>(null)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [discountAmount, setDiscountAmount] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [removingDiscount, setRemovingDiscount] = useState(false)
  const [compTarget, setCompTarget] = useState<{ roundId: string; item: DineInRoundItemDto } | null>(null)
  const [compReason, setCompReason] = useState('')
  const [comping, setComping] = useState(false)
  const [uncompingItemId, setUncompingItemId] = useState<string | null>(null)

  function load() {
    if (!id) return
    setLoading(true)
    Promise.all([fetchTableSession(id), fetchProducts()])
      .then(([sessionResult, productsResult]) => {
        setSession(sessionResult)
        setProducts(productsResult)
      })
      .catch((error) => toast.error('Could not load table', { description: errorMessage(error) }))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [id])

  // Quietly refreshes round statuses (Fired/Preparing/Ready/Served) as the kitchen advances
  // them, without touching the loading spinner or re-fetching the product list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!id || !session || session.status === 3) return
    const interval = setInterval(() => {
      fetchTableSession(id)
        .then(setSession)
        .catch(() => {
          // silent — a missed poll tick isn't worth interrupting the waiter with a toast
        })
    }, ROUND_STATUS_POLL_MS)
    return () => clearInterval(interval)
  }, [id, session?.status])

  function addProductToDraft(product: ProductListResponse) {
    setDraft((prev) => {
      const existing = prev.find((l) => l.productId === product.id)
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { productId: product.id, productName: product.name, unitPrice: product.price, quantity: 1 }]
    })
  }

  function adjustDraftQty(productId: string, delta: number) {
    setDraft((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    )
  }

  async function handleFireRound() {
    if (!session || draft.length === 0) return
    setFiring(true)
    try {
      const items = draft.map((l) => ({ productId: l.productId, quantity: l.quantity }))
      const updated = await fireRound(session.id, items)
      setSession(updated)
      setDraft([])
      toast.success('Round fired to the kitchen')
    } catch (error) {
      toast.error('Could not fire round', { description: errorMessage(error) })
    } finally {
      setFiring(false)
    }
  }

  async function handleRequestBill() {
    if (!session) return
    setBusy(true)
    try {
      setSession(await requestBill(session.id))
      toast.success('Bill requested')
    } catch (error) {
      toast.error('Could not request bill', { description: errorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  async function handleClose() {
    if (!session) return
    setBusy(true)
    try {
      await closeTableSession(session.id)
      toast.success('Table closed out')
      navigate('/staff')
    } catch (error) {
      toast.error('Could not close table', { description: errorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  async function handleCollect(label: string, amount: number, method: string, setBusyFlag: (value: boolean) => void) {
    if (!session) return
    setBusyFlag(true)
    try {
      const { payment, razorpayKeyId, razorpayAmountInPaise } = await createDineInPayment(session.id, amount, method, label)

      if (method !== 'Razorpay') {
        setSession(await fetchTableSession(session.id))
        toast.success(`${label} recorded (${method})`)
        return
      }

      if (!razorpayKeyId || !payment.razorpayOrderId || razorpayAmountInPaise === null) {
        toast.error('Razorpay is not configured on this server', { description: 'Use Cash, UPI, or Card instead.' })
        return
      }

      try {
        const result = await openRazorpayCheckout({
          keyId: razorpayKeyId,
          razorpayOrderId: payment.razorpayOrderId,
          amountInPaise: razorpayAmountInPaise,
          customerName: label === 'Full bill' ? session.tableLabel : `${session.tableLabel} — ${label}`,
          customerPhone: '',
        })
        setSession(await verifyDineInPayment(session.id, payment.id, result.razorpay_payment_id, result.razorpay_signature))
        toast.success(`${label} verified`)
      } catch (razorpayError) {
        toast.error('Payment not completed', {
          description: razorpayError instanceof Error ? razorpayError.message : 'You can retry from here.',
        })
      }
    } catch (error) {
      toast.error(`Could not record ${label}`, { description: errorMessage(error) })
    } finally {
      setBusyFlag(false)
    }
  }

  function splitShareAmount(session: TableSessionDto, splitCount: number, index: number): number {
    const base = Math.floor((session.total / splitCount) * 100) / 100
    if (index < splitCount - 1) return base
    return Math.round((session.total - base * (splitCount - 1)) * 100) / 100
  }

  async function handleMarkServed(round: DineInRoundDto) {
    if (!session) return
    setServingRoundId(round.id)
    try {
      const updated = await markRoundServed(session.id, round.id)
      setSession(updated)
      toast.success(`Round ${round.roundNumber} served`)
    } catch (error) {
      toast.error('Could not mark round served', { description: errorMessage(error) })
    } finally {
      setServingRoundId(null)
    }
  }

  async function handleConfirmCancel() {
    if (!session || !roundToCancel) return
    setCancelling(true)
    try {
      const updated = await cancelRound(session.id, roundToCancel.id)
      setSession(updated)
      toast.success(`Round ${roundToCancel.roundNumber} cancelled`, { description: 'Stock has been restored.' })
      setRoundToCancel(null)
    } catch (error) {
      toast.error('Could not cancel round', { description: errorMessage(error) })
    } finally {
      setCancelling(false)
    }
  }

  async function handleApplyDiscount() {
    if (!session) return
    const amount = Number(discountAmount)
    if (!amount || amount <= 0 || !discountReason.trim()) return
    setApplyingDiscount(true)
    try {
      setSession(await applySessionDiscount(session.id, amount, discountReason.trim()))
      toast.success('Discount applied')
      setDiscountDialogOpen(false)
      setDiscountAmount('')
      setDiscountReason('')
    } catch (error) {
      toast.error('Could not apply discount', { description: errorMessage(error) })
    } finally {
      setApplyingDiscount(false)
    }
  }

  async function handleRemoveDiscount() {
    if (!session) return
    setRemovingDiscount(true)
    try {
      setSession(await removeSessionDiscount(session.id))
      toast.success('Discount removed')
    } catch (error) {
      toast.error('Could not remove discount', { description: errorMessage(error) })
    } finally {
      setRemovingDiscount(false)
    }
  }

  async function handleConfirmComp() {
    if (!session || !compTarget || !compReason.trim()) return
    setComping(true)
    try {
      const updated = await compRoundItem(session.id, compTarget.roundId, compTarget.item.id, compReason.trim())
      setSession(updated)
      toast.success(`${compTarget.item.productName} comped`)
      setCompTarget(null)
      setCompReason('')
    } catch (error) {
      toast.error('Could not comp item', { description: errorMessage(error) })
    } finally {
      setComping(false)
    }
  }

  async function handleUncomp(roundId: string, itemId: string) {
    if (!session) return
    setUncompingItemId(itemId)
    try {
      setSession(await uncompRoundItem(session.id, roundId, itemId))
      toast.success('Comp removed')
    } catch (error) {
      toast.error('Could not remove comp', { description: errorMessage(error) })
    } finally {
      setUncompingItemId(null)
    }
  }

  if (loading || !session) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
  }

  const draftTotal = draft.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  const remaining = session.total - paidTotal(session)
  const categories = Array.from(new Map(products.map((p) => [p.categoryId, p.categoryName])).entries())
  const visibleProducts = selectedCategoryId === ALL_CATEGORY_ID ? products : products.filter((p) => p.categoryId === selectedCategoryId)

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/staff" className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-sm">
            <ChevronLeft className="size-4" />
            All tables
          </Link>
          <h1 className="font-display text-3xl font-bold">{session.tableLabel}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-base">
            {session.guestCount} guests <Badge variant="secondary">{SESSION_STATUS_LABEL[session.status]}</Badge>
          </p>
        </div>
        <p className="font-display text-3xl font-bold">{formatCurrency(session.total)}</p>
      </div>

      {session.status === 1 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <h2 className="font-display text-xl font-semibold">Fire a new round</h2>
            <p className="text-muted-foreground -mt-2 text-sm">Tap a dish to add it, then send the round to the kitchen.</p>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryId(ALL_CATEGORY_ID)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  selectedCategoryId === ALL_CATEGORY_ID
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground hover:bg-secondary',
                )}
              >
                All
              </button>
              {categories.map(([categoryId, categoryName]) => (
                <button
                  key={categoryId}
                  type="button"
                  onClick={() => setSelectedCategoryId(categoryId)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    selectedCategoryId === categoryId
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'text-muted-foreground hover:bg-secondary',
                  )}
                >
                  {categoryName}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProductToDraft(product)}
                  className="hover:border-primary active:bg-secondary/50 flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors active:scale-[0.98]"
                >
                  <span className="text-sm leading-snug font-medium">{product.name}</span>
                  <span className="text-muted-foreground text-sm">{formatCurrency(product.price)}</span>
                </button>
              ))}
            </div>

            {draft.length > 0 && (
              <div className="flex flex-col gap-2">
                {draft.map((line) => (
                  <div key={line.productId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-base">
                    <span className="flex-1 font-medium">{line.productName}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-11" onClick={() => adjustDraftQty(line.productId, -1)}>
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-7 text-center text-lg font-semibold">{line.quantity}</span>
                      <Button variant="outline" size="icon" className="size-11" onClick={() => adjustDraftQty(line.productId, 1)}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <span className="w-20 text-right font-semibold">{formatCurrency(line.unitPrice * line.quantity)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-11"
                      onClick={() => adjustDraftQty(line.productId, -line.quantity)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                  <span>Round total</span>
                  <span>{formatCurrency(draftTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {session.rounds.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rounds fired yet.</p>
        ) : (
          session.rounds.map((round) => {
            const isCancelled = round.status === 5
            return (
              <Card key={round.id} className={cn(isCancelled && 'opacity-60')}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-base font-semibold">Round {round.roundNumber}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isCancelled ? 'outline' : 'secondary'}>{ROUND_STATUS_LABEL[round.status]}</Badge>
                      {round.status === 1 && session.status === 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 h-10 gap-1.5"
                          onClick={() => setRoundToCancel(round)}
                        >
                          <Ban className="size-4" />
                          Cancel
                        </Button>
                      )}
                      {round.status === 3 && (
                        <Button
                          variant="gold"
                          size="sm"
                          className="h-10 gap-1.5"
                          disabled={servingRoundId === round.id}
                          onClick={() => handleMarkServed(round)}
                        >
                          <Check className="size-4" />
                          {servingRoundId === round.id ? 'Serving...' : 'Mark Served'}
                        </Button>
                      )}
                      <Link to={`/print/dinein-kot/${round.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-10 gap-1.5">
                          <Printer className="size-4" />
                          Print
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-base">
                    {round.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <span className={cn((isCancelled || item.isComped) && 'text-muted-foreground line-through')}>
                          {item.productName} ×{item.quantity}
                          {item.isComped && <span className="ml-1.5 text-xs no-underline">(Comped{item.compReason ? `: ${item.compReason}` : ''})</span>}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={cn((isCancelled || item.isComped) && 'text-muted-foreground line-through')}>
                            {formatCurrency(item.lineTotal)}
                          </span>
                          {!isCancelled && session.status !== 3 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              disabled={uncompingItemId === item.id}
                              title={item.isComped ? 'Remove comp' : 'Comp this item'}
                              onClick={() => {
                                if (item.isComped) {
                                  handleUncomp(round.id, item.id)
                                } else {
                                  setCompTarget({ roundId: round.id, item })
                                  setCompReason('')
                                }
                              }}
                            >
                              <Gift className={cn('size-4', item.isComped && 'text-primary')} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {session.status === 2 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Payment</h2>
              <Link to={`/print/dinein-bill/${session.id}`} target="_blank">
                <Button variant="outline" size="sm" className="h-10 gap-1.5">
                  <Printer className="size-4" />
                  Print Bill
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(session.subtotal)}</span>
              </div>
              {session.discountAmount > 0 ? (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-muted-foreground">Discount</span>
                    {session.discountReason && <p className="text-muted-foreground text-xs">{session.discountReason}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>-{formatCurrency(session.discountAmount)}</span>
                    <Button variant="ghost" size="icon" className="size-7" disabled={removingDiscount} title="Remove discount" onClick={handleRemoveDiscount}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-primary self-start text-xs font-medium underline underline-offset-2"
                  onClick={() => setDiscountDialogOpen(true)}
                >
                  + Apply discount
                </button>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({session.taxRatePercent}%)</span>
                <span>{formatCurrency(session.taxAmount)}</span>
              </div>
              {session.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Charge ({session.serviceChargePercent}%)</span>
                  <span>{formatCurrency(session.serviceChargeAmount)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t pt-1.5 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(session.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Split evenly</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  disabled={splitCount <= 1 || session.payments.length > 0}
                  onClick={() => setSplitCount((n) => Math.max(1, n - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-6 text-center text-base font-semibold">{splitCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  disabled={splitCount >= 8 || session.payments.length > 0}
                  onClick={() => setSplitCount((n) => Math.min(8, n + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {session.payments.length > 0 && (
              <div className="flex flex-col gap-2">
                {session.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-base">
                    <div>
                      <p className="font-medium">{payment.label}</p>
                      <p className="text-muted-foreground text-sm">{payment.method}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PAYMENT_STATUS_BADGE[payment.status]}>{PAYMENT_STATUS_LABEL[payment.status]}</Badge>
                      <span className="w-24 text-right font-semibold">{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
              <span>Remaining</span>
              <span>{formatCurrency(remaining)}</span>
            </div>

            {splitCount === 1 ? (
              remaining > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-12 w-40 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method} className="text-base">
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="lg"
                    variant="gold"
                    className="flex-1"
                    disabled={collectingPayment}
                    onClick={() => handleCollect('Full bill', remaining, paymentMethod, setCollectingPayment)}
                  >
                    {collectingPayment ? 'Processing...' : `Collect ${formatCurrency(remaining)}`}
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: splitCount }).map((_, index) => {
                  const label = `Split ${index + 1}`
                  const alreadyPaid = session.payments.some((p) => p.label === label && p.status === 2)
                  const amount = splitShareAmount(session, splitCount, index)
                  if (alreadyPaid) return null
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-20 text-sm font-medium">{label}</span>
                      <Select
                        value={splitMethods[index] ?? PAYMENT_METHODS[0]}
                        onValueChange={(value) => setSplitMethods((prev) => ({ ...prev, [index]: value }))}
                      >
                        <SelectTrigger className="h-12 w-36 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method} className="text-base">
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="lg"
                        variant="gold"
                        className="flex-1"
                        disabled={collectingSplitIndex === index}
                        onClick={() =>
                          handleCollect(label, amount, splitMethods[index] ?? PAYMENT_METHODS[0], (busyValue) =>
                            setCollectingSplitIndex(busyValue ? index : null),
                          )
                        }
                      >
                        {collectingSplitIndex === index ? 'Processing...' : `Collect ${formatCurrency(amount)}`}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {session.status !== 3 && (
        <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{session.tableLabel}</p>
              <p className="text-muted-foreground text-xs">{formatCurrency(session.total)} total</p>
            </div>
            {session.status === 1 && draft.length > 0 && (
              <Button size="lg" variant="gold" disabled={firing} onClick={handleFireRound}>
                {firing ? 'Firing...' : `Fire to Kitchen · ${formatCurrency(draftTotal)}`}
              </Button>
            )}
            {session.status === 1 && draft.length === 0 && session.rounds.length > 0 && (
              <Button size="lg" variant="outline" disabled={busy} onClick={handleRequestBill}>
                Request Bill
              </Button>
            )}
            {session.status === 1 && draft.length === 0 && session.rounds.length === 0 && (
              <span className="text-muted-foreground text-sm">Add items to fire a round</span>
            )}
            {session.status === 2 && remaining > 0 && (
              <Badge variant="outline" className="text-sm">
                Remaining {formatCurrency(remaining)}
              </Badge>
            )}
            {session.status === 2 && remaining <= 0 && (
              <Button size="lg" variant="gold" disabled={busy} onClick={handleClose}>
                {busy ? 'Closing...' : 'Close Table'}
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={roundToCancel !== null} onOpenChange={(open) => !open && setRoundToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Round {roundToCancel?.roundNumber}?</DialogTitle>
            <DialogDescription>
              This removes it from the bill and restores the stock it used. Only possible because the kitchen hasn't
              started on it yet — once you mark it as being prepared, this action won't be available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoundToCancel(null)}>
              Keep Round
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Round'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={discountDialogOpen}
        onOpenChange={(open) => {
          setDiscountDialogOpen(open)
          if (!open) {
            setDiscountAmount('')
            setDiscountReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Knocks a flat amount off this bill's subtotal, before tax. A reason is required and kept on record.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discount-amount">Amount (Rs.)</Label>
              <Input
                id="discount-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discount-reason">Reason</Label>
              <Input
                id="discount-reason"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="e.g. Regular customer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleApplyDiscount}
              disabled={applyingDiscount || !discountAmount || !discountReason.trim()}
            >
              {applyingDiscount ? 'Applying...' : 'Apply Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={compTarget !== null} onOpenChange={(open) => !open && setCompTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comp {compTarget?.item.productName}?</DialogTitle>
            <DialogDescription>
              Removes this item's charge from the bill — it still shows on the ticket and stays on record. A reason
              is required.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comp-reason">Reason</Label>
            <Input
              id="comp-reason"
              value={compReason}
              onChange={(e) => setCompReason(e.target.value)}
              placeholder="e.g. Wrong order"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompTarget(null)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleConfirmComp} disabled={comping || !compReason.trim()}>
              {comping ? 'Comping...' : 'Comp Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
