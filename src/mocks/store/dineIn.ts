import { findDemoProduct } from '@/mocks/fixtures/catalog'
import { DemoError } from '@/mocks/errors'
import type {
  DineInPaymentDto,
  DineInPaymentStatus,
  DineInRoundDto,
  DineInRoundItemDto,
  DineInRoundStatus,
  DiningTableDto,
  DiningTableStatus,
  KitchenRoundDto,
  TableSessionDto,
  TableSessionStatus,
} from '@/lib/api/types'

interface RoundItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface Round {
  id: string
  roundNumber: number
  status: DineInRoundStatus
  firedAt: string
  items: RoundItem[]
}

interface Payment {
  id: string
  tableSessionId: string
  label: string
  amount: number
  method: string
  status: DineInPaymentStatus
  razorpayOrderId: string | null
  paidAt: string | null
}

interface Session {
  id: string
  tableId: string
  openedByUserId: string
  guestCount: number
  status: TableSessionStatus
  openedAt: string
  closedAt: string | null
  paymentMethod: string | null
  totalAmount: number | null
  rounds: Round[]
  payments: Payment[]
}

interface Table {
  id: string
  label: string
  capacity: number
  status: DiningTableStatus
}

let idCounter = 1
function genId(prefix: string): string {
  return `${prefix}-${idCounter++}`
}

const TABLE_STATUS_LABEL: Record<DiningTableStatus, string> = {
  1: 'Available',
  2: 'Occupied',
  3: 'Needs Cleaning',
}
const ROUND_STATUS_LABEL: Record<DineInRoundStatus, string> = {
  1: 'Fired',
  2: 'Preparing',
  3: 'Ready',
  4: 'Served',
  5: 'Cancelled',
}
const SESSION_STATUS_LABEL: Record<TableSessionStatus, string> = {
  1: 'Open',
  2: 'BillRequested',
  3: 'Closed',
}
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Razorpay']

const tables: Table[] = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1
  return {
    id: `table-${n}`,
    label: `Table ${n}`,
    capacity: n % 3 === 0 ? 6 : 4,
    status: 1 as DiningTableStatus,
  }
})

const sessions: Session[] = []

function roundItem(productId: string, quantity: number): RoundItem {
  const product = findDemoProduct(productId)
  if (!product) throw new Error(`Demo seed referenced unknown product "${productId}"`)
  return {
    id: genId('item'),
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
  }
}

function computeRoundTotal(items: RoundItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}

function computeSessionTotal(session: Session): number {
  return session.rounds
    .filter((r) => r.status !== 5)
    .reduce((sum, r) => sum + computeRoundTotal(r.items), 0)
}

// Mirrors the real backend's DineInBillingOptions defaults (TaxRatePercent 5, ServiceChargePercent 0).
const TAX_RATE_PERCENT = 5
const SERVICE_CHARGE_PERCENT = 0

interface BillBreakdown {
  subtotal: number
  taxAmount: number
  serviceChargeAmount: number
  total: number
}

function computeBillBreakdown(session: Session): BillBreakdown {
  const subtotal = session.totalAmount ?? computeSessionTotal(session)
  const taxAmount = Math.round(((subtotal * TAX_RATE_PERCENT) / 100) * 100) / 100
  const serviceChargeAmount = Math.round(((subtotal * SERVICE_CHARGE_PERCENT) / 100) * 100) / 100
  return { subtotal, taxAmount, serviceChargeAmount, total: subtotal + taxAmount + serviceChargeAmount }
}

function toRoundItemDto(item: RoundItem): DineInRoundItemDto {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
  }
}

function toRoundDto(round: Round): DineInRoundDto {
  const items = round.items.map(toRoundItemDto)
  return {
    id: round.id,
    roundNumber: round.roundNumber,
    status: round.status,
    firedAt: round.firedAt,
    items,
    roundTotal: items.reduce((s, i) => s + i.lineTotal, 0),
  }
}

function toPaymentDto(p: Payment): DineInPaymentDto {
  return {
    id: p.id,
    tableSessionId: p.tableSessionId,
    label: p.label,
    amount: p.amount,
    method: p.method,
    status: p.status,
    razorpayOrderId: p.razorpayOrderId,
    paidAt: p.paidAt,
  }
}

function tableOf(session: Session): Table {
  const table = tables.find((t) => t.id === session.tableId)
  if (!table) throw new Error(`Demo session references unknown table "${session.tableId}"`)
  return table
}

function toSessionDto(session: Session): TableSessionDto {
  const breakdown = computeBillBreakdown(session)
  return {
    id: session.id,
    tableId: session.tableId,
    tableLabel: tableOf(session).label,
    openedByUserId: session.openedByUserId,
    guestCount: session.guestCount,
    status: session.status,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
    paymentMethod: session.paymentMethod,
    rounds: session.rounds
      .slice()
      .sort((a, b) => a.roundNumber - b.roundNumber)
      .map(toRoundDto),
    payments: session.payments.map(toPaymentDto),
    subtotal: breakdown.subtotal,
    taxRatePercent: TAX_RATE_PERCENT,
    taxAmount: breakdown.taxAmount,
    serviceChargePercent: SERVICE_CHARGE_PERCENT,
    serviceChargeAmount: breakdown.serviceChargeAmount,
    total: breakdown.total,
  }
}

function toTableDto(table: Table): DiningTableDto {
  const activeSession = sessions.find((s) => s.tableId === table.id && s.status !== 3)
  return {
    id: table.id,
    label: table.label,
    capacity: table.capacity,
    status: table.status,
    activeSessionId: activeSession?.id ?? null,
    runningTotal: activeSession ? computeBillBreakdown(activeSession).total : null,
  }
}

function toKitchenDto(session: Session, round: Round): KitchenRoundDto {
  return {
    id: round.id,
    sessionId: session.id,
    tableLabel: tableOf(session).label,
    roundNumber: round.roundNumber,
    status: round.status,
    firedAt: round.firedAt,
    items: round.items.map(toRoundItemDto),
  }
}

function findSession(sessionId: string): Session {
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) throw new DemoError(404, 'Table session not found.')
  return session
}

// --- Seed: same curated story as the real DemoDataSeeder — one closed Cash tab, one open table
// with a round at every kitchen stage, one closed Cash+UPI split tab. ---
function seedDemoDineIn() {
  const now = Date.now()
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString()

  const t1 = tables[0]
  const s1: Session = {
    id: genId('session'),
    tableId: t1.id,
    openedByUserId: 'user-waiter1',
    guestCount: 2,
    status: 3,
    openedAt: iso(90),
    closedAt: iso(45),
    paymentMethod: 'Cash',
    totalAmount: null,
    rounds: [
      {
        id: genId('round'),
        roundNumber: 1,
        status: 4,
        firedAt: iso(85),
        items: [roundItem('bbq-chicken', 2)],
      },
    ],
    payments: [],
  }
  const total1 = computeRoundTotal(s1.rounds[0].items)
  s1.payments.push({
    id: genId('payment'),
    tableSessionId: s1.id,
    label: 'Full bill',
    amount: total1,
    method: 'Cash',
    status: 2,
    razorpayOrderId: null,
    paidAt: iso(46),
  })
  s1.totalAmount = total1
  sessions.push(s1)

  const t2 = tables[1]
  const s2: Session = {
    id: genId('session'),
    tableId: t2.id,
    openedByUserId: 'user-waiter1',
    guestCount: 3,
    status: 1,
    openedAt: iso(15),
    closedAt: null,
    paymentMethod: null,
    totalAmount: null,
    rounds: [
      {
        id: genId('round'),
        roundNumber: 1,
        status: 3,
        firedAt: iso(12),
        items: [roundItem('butter-chicken', 1)],
      },
      {
        id: genId('round'),
        roundNumber: 2,
        status: 2,
        firedAt: iso(7),
        items: [roundItem('chicken-65', 1), roundItem('chicken-burger', 1)],
      },
      {
        id: genId('round'),
        roundNumber: 3,
        status: 1,
        firedAt: iso(2),
        items: [roundItem('chicken-fried-rice', 1)],
      },
    ],
    payments: [],
  }
  t2.status = 2
  sessions.push(s2)

  const t3 = tables[2]
  const round3Items = [roundItem('butter-chicken', 1), roundItem('shawarma', 1)]
  const total3 = computeRoundTotal(round3Items)
  const half = Math.round((total3 / 2) * 100) / 100
  const s3: Session = {
    id: genId('session'),
    tableId: t3.id,
    openedByUserId: 'user-waiter1',
    guestCount: 4,
    status: 3,
    openedAt: iso(60),
    closedAt: iso(20),
    paymentMethod: 'Cash + UPI',
    totalAmount: total3,
    rounds: [
      { id: genId('round'), roundNumber: 1, status: 4, firedAt: iso(55), items: round3Items },
    ],
    payments: [
      {
        id: genId('payment'),
        tableSessionId: '',
        label: 'Split 1',
        amount: half,
        method: 'Cash',
        status: 2,
        razorpayOrderId: null,
        paidAt: iso(21),
      },
      {
        id: genId('payment'),
        tableSessionId: '',
        label: 'Split 2',
        amount: total3 - half,
        method: 'UPI',
        status: 2,
        razorpayOrderId: null,
        paidAt: iso(20),
      },
    ],
  }
  s3.payments.forEach((p) => (p.tableSessionId = s3.id))
  sessions.push(s3)
}

seedDemoDineIn()

// --- Public API, mirroring TableSessionService's rules exactly ---

export function getTables(): DiningTableDto[] {
  return tables
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
    .map(toTableDto)
}

export function openSession(
  tableId: string,
  waiterUserId: string,
  guestCount: number,
): TableSessionDto {
  const table = tables.find((t) => t.id === tableId)
  if (!table) throw new DemoError(404, 'Table not found.')
  if (table.status !== 1)
    throw new DemoError(
      409,
      `Table '${table.label}' is not available (currently ${TABLE_STATUS_LABEL[table.status]}).`,
    )

  const session: Session = {
    id: genId('session'),
    tableId,
    openedByUserId: waiterUserId,
    guestCount,
    status: 1,
    openedAt: new Date().toISOString(),
    closedAt: null,
    paymentMethod: null,
    totalAmount: null,
    rounds: [],
    payments: [],
  }
  sessions.push(session)
  table.status = 2
  return toSessionDto(session)
}

export function getSession(sessionId: string): TableSessionDto {
  return toSessionDto(findSession(sessionId))
}

export function fireRound(
  sessionId: string,
  items: { productId: string; quantity: number }[],
): TableSessionDto {
  if (items.length === 0) throw new DemoError(409, 'A round needs at least one item.')
  const session = findSession(sessionId)
  if (session.status !== 1)
    throw new DemoError(
      409,
      "This table's bill has already been requested — cannot fire another round.",
    )

  const roundItems = items.map((i) => {
    const product = findDemoProduct(i.productId)
    if (!product) throw new DemoError(404, 'Product not found.')
    return {
      id: genId('item'),
      productId: product.id,
      productName: product.name,
      quantity: i.quantity,
      unitPrice: product.price,
    }
  })

  session.rounds.push({
    id: genId('round'),
    roundNumber: session.rounds.length + 1,
    status: 1,
    firedAt: new Date().toISOString(),
    items: roundItems,
  })
  return toSessionDto(session)
}

export function cancelRound(sessionId: string, roundId: string): TableSessionDto {
  const session = findSession(sessionId)
  if (session.status !== 1)
    throw new DemoError(
      409,
      "This table's bill has already been requested — cannot cancel a round now.",
    )
  const round = session.rounds.find((r) => r.id === roundId)
  if (!round) throw new DemoError(404, 'Round not found.')
  if (round.status !== 1) {
    throw new DemoError(
      409,
      `Round ${round.roundNumber} is already ${ROUND_STATUS_LABEL[round.status]} — the kitchen has already started on it, it can't be cancelled from here.`,
    )
  }
  round.status = 5
  return toSessionDto(session)
}

export function markRoundServed(sessionId: string, roundId: string): TableSessionDto {
  const session = findSession(sessionId)
  const round = session.rounds.find((r) => r.id === roundId)
  if (!round) throw new DemoError(404, 'Round not found.')
  if (round.status !== 3) {
    throw new DemoError(
      409,
      `Round ${round.roundNumber} is ${ROUND_STATUS_LABEL[round.status]} — it can only be marked served once the kitchen has it ready.`,
    )
  }
  round.status = 4
  return toSessionDto(session)
}

export function requestBill(sessionId: string): TableSessionDto {
  const session = findSession(sessionId)
  if (session.status !== 1)
    throw new DemoError(409, `Session is already ${SESSION_STATUS_LABEL[session.status]}.`)
  session.status = 2
  return toSessionDto(session)
}

export function closeSession(sessionId: string): TableSessionDto {
  const session = findSession(sessionId)
  if (session.status === 3) throw new DemoError(409, 'This session is already closed.')

  const breakdown = computeBillBreakdown(session)
  const paid = session.payments.filter((p) => p.status === 2).reduce((sum, p) => sum + p.amount, 0)
  if (paid < breakdown.total) {
    throw new DemoError(
      409,
      `Only Rs. ${paid.toFixed(2)} of Rs. ${breakdown.total.toFixed(2)} has been collected — record the remaining payment before closing.`,
    )
  }

  const table = tableOf(session)
  session.status = 3
  session.paymentMethod = Array.from(
    new Set(session.payments.filter((p) => p.status === 2).map((p) => p.method)),
  ).join(' + ')
  session.totalAmount = breakdown.subtotal
  session.closedAt = new Date().toISOString()
  table.status = 3
  return toSessionDto(session)
}

export function markTableCleaned(tableId: string): DiningTableDto {
  const table = tables.find((t) => t.id === tableId)
  if (!table) throw new DemoError(404, 'Table not found.')
  if (table.status !== 3)
    throw new DemoError(
      409,
      `Table '${table.label}' is not awaiting cleaning (currently ${TABLE_STATUS_LABEL[table.status]}).`,
    )
  table.status = 1
  return toTableDto(table)
}

export function createPayment(
  sessionId: string,
  amount: number,
  method: string,
  label: string | undefined,
): {
  payment: DineInPaymentDto
  razorpayKeyId: string | null
  razorpayAmountInPaise: number | null
} {
  const session = findSession(sessionId)
  if (session.status !== 2)
    throw new DemoError(409, 'Payments can only be recorded once the bill has been requested.')
  if (!PAYMENT_METHODS.includes(method))
    throw new DemoError(400, 'Method must be one of Cash, UPI, Card, Razorpay.')
  if (amount <= 0) throw new DemoError(400, 'Amount must be greater than zero.')

  if (method === 'Razorpay') {
    throw new DemoError(
      409,
      "Razorpay isn't configured on this server yet — use Cash, UPI, or Card instead.",
    )
  }

  const payment: Payment = {
    id: genId('payment'),
    tableSessionId: sessionId,
    label: label && label.trim().length > 0 ? label : 'Full bill',
    amount,
    method,
    status: 2,
    razorpayOrderId: null,
    paidAt: new Date().toISOString(),
  }
  session.payments.push(payment)
  return { payment: toPaymentDto(payment), razorpayKeyId: null, razorpayAmountInPaise: null }
}

export function getKitchenQueue(): KitchenRoundDto[] {
  const entries: { session: Session; round: Round }[] = []
  for (const session of sessions) {
    if (session.status === 3) continue
    for (const round of session.rounds) {
      if (round.status === 1 || round.status === 2 || round.status === 3) {
        entries.push({ session, round })
      }
    }
  }
  entries.sort((a, b) => a.round.firedAt.localeCompare(b.round.firedAt))
  return entries.map(({ session, round }) => toKitchenDto(session, round))
}

export function advanceRoundStatus(roundId: string): KitchenRoundDto {
  for (const session of sessions) {
    const round = session.rounds.find((r) => r.id === roundId)
    if (!round) continue
    if (round.status === 1) round.status = 2
    else if (round.status === 2) round.status = 3
    else
      throw new DemoError(
        409,
        `Round ${round.roundNumber} is ${ROUND_STATUS_LABEL[round.status]} and can't be advanced further from the kitchen.`,
      )
    return toKitchenDto(session, round)
  }
  throw new DemoError(404, 'Round not found.')
}

export function getRoundForPrint(roundId: string): { tableLabel: string; round: DineInRoundDto } {
  for (const session of sessions) {
    const round = session.rounds.find((r) => r.id === roundId)
    if (round) return { tableLabel: tableOf(session).label, round: toRoundDto(round) }
  }
  throw new DemoError(404, 'Round not found.')
}

export function getSessionsForAdmin(): TableSessionDto[] {
  return sessions
    .slice()
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
    .map(toSessionDto)
}
