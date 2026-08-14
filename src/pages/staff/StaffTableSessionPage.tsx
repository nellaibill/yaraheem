import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, Minus, Plus, Printer, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchTableSession, fireRound, requestBill, closeTableSession } from '@/lib/api/dineInApi'
import { fetchProducts } from '@/lib/api/catalogApi'
import { ApiError } from '@/lib/api/client'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/utils'
import type { ProductListResponse, TableSessionDto } from '@/lib/api/types'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong — please try again.'
}

const SESSION_STATUS_LABEL: Record<number, string> = { 1: 'Open', 2: 'Bill Requested', 3: 'Closed' }
const ROUND_STATUS_LABEL: Record<number, string> = { 1: 'Fired', 2: 'Preparing', 3: 'Ready', 4: 'Served' }
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card']

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
  const [pickedProductId, setPickedProductId] = useState('')
  const [firing, setFiring] = useState(false)
  const [busy, setBusy] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])

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

  function addDraftLine() {
    const product = products.find((p) => p.id === pickedProductId)
    if (!product) return
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
      await closeTableSession(session.id, paymentMethod)
      toast.success('Table closed out')
      navigate('/staff')
    } catch (error) {
      toast.error('Could not close table', { description: errorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  if (loading || !session) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Loading...</p>
  }

  const draftTotal = draft.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/staff" className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-xs">
            <ChevronLeft className="size-3.5" />
            All tables
          </Link>
          <h1 className="font-display text-2xl font-bold">{session.tableLabel}</h1>
          <p className="text-muted-foreground text-sm">
            {session.guestCount} guests · <Badge variant="secondary">{SESSION_STATUS_LABEL[session.status]}</Badge>
          </p>
        </div>
        <p className="font-display text-2xl font-bold">{formatCurrency(session.total)}</p>
      </div>

      {session.status === 1 && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <h2 className="font-display text-lg font-semibold">Fire a new round</h2>
            <div className="flex items-center gap-2">
              <Select value={pickedProductId} onValueChange={setPickedProductId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a dish..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={addDraftLine} disabled={!pickedProductId}>
                Add
              </Button>
            </div>

            {draft.length > 0 && (
              <div className="flex flex-col gap-2">
                {draft.map((line) => (
                  <div key={line.productId} className="flex items-center justify-between gap-3 rounded-lg border p-2.5 text-sm">
                    <span className="flex-1">{line.productName}</span>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => adjustDraftQty(line.productId, -1)}>
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center font-medium">{line.quantity}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => adjustDraftQty(line.productId, 1)}>
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <span className="w-16 text-right font-medium">{formatCurrency(line.unitPrice * line.quantity)}</span>
                    <Button variant="ghost" size="icon" className="text-destructive size-7" onClick={() => adjustDraftQty(line.productId, -line.quantity)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                  <span>Round total</span>
                  <span>{formatCurrency(draftTotal)}</span>
                </div>
              </div>
            )}

            <Button variant="gold" className="w-fit" disabled={draft.length === 0 || firing} onClick={handleFireRound}>
              {firing ? 'Firing...' : 'Fire to Kitchen'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {session.rounds.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rounds fired yet.</p>
        ) : (
          session.rounds.map((round) => (
            <Card key={round.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Round {round.roundNumber}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ROUND_STATUS_LABEL[round.status]}</Badge>
                    <Link to={`/print/dinein-kot/${round.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="size-7">
                        <Printer className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  {round.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.productName} ×{item.quantity}
                      </span>
                      <span>{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {session.status === 1 && session.rounds.length > 0 && (
        <Button variant="outline" className="w-fit" disabled={busy} onClick={handleRequestBill}>
          Request Bill
        </Button>
      )}

      {session.status === 2 && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">Payment method</p>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="gold" disabled={busy} onClick={handleClose}>
              {busy ? 'Closing...' : `Collect ${formatCurrency(session.total)} & Close`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
