import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PageLoader } from '@/components/common/PageLoader'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed'

const HomePage = lazy(() => import('@/pages/HomePage'))
const MenuPage = lazy(() => import('@/pages/MenuPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const FoodDetailsPage = lazy(() => import('@/pages/FoodDetailsPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const OffersPage = lazy(() => import('@/pages/OffersPage'))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'))
const RestaurantInfoPage = lazy(() => import('@/pages/RestaurantInfoPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const CateringPage = lazy(() => import('@/pages/CateringPage'))
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const StyleGuidePage = lazy(() => import('@/pages/StyleGuidePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminDeliveryPartnersPage = lazy(() => import('@/pages/admin/AdminDeliveryPartnersPage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))

const SplashPage = lazy(() => import('@/pages/auth/SplashPage'))
const WelcomePage = lazy(() => import('@/pages/auth/WelcomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const OtpPage = lazy(() => import('@/pages/auth/OtpPage'))
const AuthSuccessPage = lazy(() => import('@/pages/auth/AuthSuccessPage'))

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

const router = createBrowserRouter(
  [
    {
      element: <RequireAuth />,
      children: [
        {
          path: '/',
          element: <Layout />,
          children: [
            { index: true, element: withSuspense(<HomePage />) },
            { path: 'menu', element: withSuspense(<MenuPage />) },
            { path: 'categories', element: withSuspense(<CategoriesPage />) },
            { path: 'food/:id', element: withSuspense(<FoodDetailsPage />) },
            { path: 'search', element: withSuspense(<SearchPage />) },
            { path: 'offers', element: withSuspense(<OffersPage />) },
            { path: 'reviews', element: withSuspense(<ReviewsPage />) },
            { path: 'restaurant-info', element: withSuspense(<RestaurantInfoPage />) },
            { path: 'cart', element: withSuspense(<CartPage />) },
            { path: 'checkout', element: withSuspense(<CheckoutPage />) },
            { path: 'orders/:id', element: withSuspense(<OrderTrackingPage />) },
            { path: 'profile', element: withSuspense(<ProfilePage />) },
            { path: 'catering', element: withSuspense(<CateringPage />) },
            { path: 'gallery', element: withSuspense(<GalleryPage />) },
            { path: 'about', element: withSuspense(<AboutPage />) },
            { path: 'contact', element: withSuspense(<ContactPage />) },
            { path: 'style-guide', element: withSuspense(<StyleGuidePage />) },
            { path: '*', element: withSuspense(<NotFoundPage />) },
          ],
        },
        {
          path: '/admin',
          element: <AdminLayout />,
          children: [
            { index: true, element: withSuspense(<AdminDashboardPage />) },
            { path: 'orders', element: withSuspense(<AdminOrdersPage />) },
            { path: 'customers', element: withSuspense(<AdminCustomersPage />) },
            { path: 'delivery-partners', element: withSuspense(<AdminDeliveryPartnersPage />) },
            { path: 'reports', element: withSuspense(<AdminReportsPage />) },
            { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
          ],
        },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        { path: 'splash', element: withSuspense(<SplashPage />) },
        {
          element: <RedirectIfAuthed />,
          children: [
            { path: 'welcome', element: withSuspense(<WelcomePage />) },
            { path: 'login', element: withSuspense(<LoginPage />) },
          ],
        },
        { path: 'otp', element: withSuspense(<OtpPage />) },
        { path: 'auth-success', element: withSuspense(<AuthSuccessPage />) },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
