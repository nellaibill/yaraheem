import { apiPostAnonymous } from '@/lib/api/client'

export interface ForgotPasswordResponse {
  devOnlyResetToken: string | null
}

export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiPostAnonymous<ForgotPasswordResponse>('/api/auth/forgot-password', { email })
}

export function resetPassword(token: string, newPassword: string): Promise<void> {
  return apiPostAnonymous<void>('/api/auth/reset-password', { token, newPassword })
}
