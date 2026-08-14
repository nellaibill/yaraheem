import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { AdminAuthProvider } from '@/features/admin/context/AdminAuthProvider'
import { CartProvider } from '@/features/cart/context/CartProvider'
import { DeliveryAuthProvider } from '@/features/delivery/context/DeliveryAuthProvider'
import { StaffAuthProvider } from '@/features/staff/context/StaffAuthProvider'
import { AppRouter } from '@/app/router/routes'

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <DeliveryAuthProvider>
              <StaffAuthProvider>
                <CartProvider>
                  <AppRouter />
                </CartProvider>
              </StaffAuthProvider>
            </DeliveryAuthProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}
