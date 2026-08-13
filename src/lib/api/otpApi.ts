import { apiPostAnonymous } from '@/lib/api/client'

export interface RequestOtpResponse {
  devOnlyCode: string | null
}

export interface VerifyOtpResponse {
  verified: boolean
}

export function requestOtpCode(phoneNumber: string): Promise<RequestOtpResponse> {
  return apiPostAnonymous<RequestOtpResponse>('/api/auth/otp/request', { phoneNumber })
}

export function verifyOtpCode(phoneNumber: string, code: string): Promise<VerifyOtpResponse> {
  return apiPostAnonymous<VerifyOtpResponse>('/api/auth/otp/verify', { phoneNumber, code })
}
