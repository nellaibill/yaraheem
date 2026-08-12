import { apiPostAnonymous } from '@/lib/api/client'
import { adminApiGet, adminApiPut } from '@/lib/api/adminClient'
import type {
  CateringInquiryDto,
  CateringInquiryStatus,
  ContactMessageDto,
  SubmitCateringInquiryRequest,
  SubmitContactMessageRequest,
} from '@/lib/api/types'

export function submitContactMessage(request: SubmitContactMessageRequest): Promise<ContactMessageDto> {
  return apiPostAnonymous<ContactMessageDto>('/api/contact', request)
}

export function submitCateringInquiry(request: SubmitCateringInquiryRequest): Promise<CateringInquiryDto> {
  return apiPostAnonymous<CateringInquiryDto>('/api/catering/inquiries', request)
}

export function fetchContactMessages(): Promise<ContactMessageDto[]> {
  return adminApiGet<ContactMessageDto[]>('/api/admin/contact-messages')
}

export function resolveContactMessage(id: string): Promise<ContactMessageDto> {
  return adminApiPut<ContactMessageDto>(`/api/admin/contact-messages/${id}/resolve`)
}

export function fetchCateringInquiries(): Promise<CateringInquiryDto[]> {
  return adminApiGet<CateringInquiryDto[]>('/api/admin/catering-inquiries')
}

export function updateCateringInquiryStatus(id: string, status: CateringInquiryStatus): Promise<CateringInquiryDto> {
  return adminApiPut<CateringInquiryDto>(`/api/admin/catering-inquiries/${id}/status`, { status })
}
