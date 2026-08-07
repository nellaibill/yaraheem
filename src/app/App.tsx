import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { CartProvider } from '@/features/cart/context/CartProvider'
import { AppRouter } from '@/app/router/routes'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
