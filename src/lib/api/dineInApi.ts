import { staffApiGet, staffApiPost } from '@/lib/api/staffClient'
import type { CreateDineInPaymentResponse, DineInRoundPrintDto, DiningTableDto, KitchenRoundDto, TableSessionDto } from '@/lib/api/types'

export function fetchTables(): Promise<DiningTableDto[]> {
  return staffApiGet<DiningTableDto[]>('/api/staff/dinein/tables')
}

export function markTableCleaned(tableId: string): Promise<DiningTableDto> {
  return staffApiPost<DiningTableDto>(`/api/staff/dinein/tables/${tableId}/mark-clean`)
}

export function openTableSession(tableId: string, guestCount: number): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/tables/${tableId}/sessions`, { guestCount })
}

export function fetchTableSession(sessionId: string): Promise<TableSessionDto> {
  return staffApiGet<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}`)
}

export function fireRound(sessionId: string, items: { productId: string; quantity: number }[]): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/rounds`, { items })
}

export function cancelRound(sessionId: string, roundId: string): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/rounds/${roundId}/cancel`)
}

export function requestBill(sessionId: string): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/request-bill`)
}

export function closeTableSession(sessionId: string): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/close`)
}

export function createDineInPayment(sessionId: string, amount: number, method: string, label?: string): Promise<CreateDineInPaymentResponse> {
  return staffApiPost<CreateDineInPaymentResponse>(`/api/staff/dinein/sessions/${sessionId}/payments`, { amount, method, label })
}

export function verifyDineInPayment(
  sessionId: string,
  paymentId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/payments/${paymentId}/verify`, {
    razorpayPaymentId,
    razorpaySignature,
  })
}

export function fetchDineInRoundForPrint(roundId: string): Promise<DineInRoundPrintDto> {
  return staffApiGet<DineInRoundPrintDto>(`/api/staff/dinein/rounds/${roundId}`)
}

export function fetchKitchenQueue(): Promise<KitchenRoundDto[]> {
  return staffApiGet<KitchenRoundDto[]>('/api/staff/dinein/kitchen/rounds')
}

export function advanceRoundStatus(roundId: string): Promise<KitchenRoundDto> {
  return staffApiPost<KitchenRoundDto>(`/api/staff/dinein/kitchen/rounds/${roundId}/advance`)
}
