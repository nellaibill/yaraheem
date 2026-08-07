import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { CartProvider } from '@/features/cart/context/CartProvider'
import { DeliveryAuthProvider } from '@/features/delivery/context/DeliveryAuthProvider'
import { AppRouter } from '@/app/router/routes'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DeliveryAuthProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </DeliveryAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
