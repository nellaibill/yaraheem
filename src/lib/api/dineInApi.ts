import { staffApiGet, staffApiPost } from '@/lib/api/staffClient'
import type { DineInRoundPrintDto, DiningTableDto, TableSessionDto } from '@/lib/api/types'

export function fetchTables(): Promise<DiningTableDto[]> {
  return staffApiGet<DiningTableDto[]>('/api/staff/dinein/tables')
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

export function requestBill(sessionId: string): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/request-bill`)
}

export function closeTableSession(sessionId: string, paymentMethod: string): Promise<TableSessionDto> {
  return staffApiPost<TableSessionDto>(`/api/staff/dinein/sessions/${sessionId}/close`, { paymentMethod })
}

export function fetchDineInRoundForPrint(roundId: string): Promise<DineInRoundPrintDto> {
  return staffApiGet<DineInRoundPrintDto>(`/api/staff/dinein/rounds/${roundId}`)
}
