import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useStaffAuth } from '@/features/staff/hooks/useStaffAuth'
import { Layout } from '@/components/layout/Layout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DeliveryLayout } from '@/components/layout/DeliveryLayout'
import { StaffLayout } from '@/components/layout/StaffLayout'
import { PageLoader } from '@/components/common/PageLoader'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { RedirectIfAuthed } from '@/features/auth/components/RedirectIfAuthed'
import { RequireAdminAuth } from '@/features/admin/components/RequireAdminAuth'
import { RequireDeliveryAuth } from '@/features/delivery/components/RequireDeliveryAuth'
import { RequireStaffAuth } from '@/features/staff/components/RequireStaffAuth'

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
const PortalSelectionPage = lazy(() => import('@/pages/PortalSelectionPage'))

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminForgotPasswordPage = lazy(() => import('@/pages/admin/AdminForgotPasswordPage'))
const AdminResetPasswordPage = lazy(() => import('@/pages/admin/AdminResetPasswordPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminMenuPage = lazy(() => import('@/pages/admin/AdminMenuPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminInquiriesPage = lazy(() => import('@/pages/admin/AdminInquiriesPage'))
const AdminDeliveryPartnersPage = lazy(() => import('@/pages/admin/AdminDeliveryPartnersPage'))
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage'))
const AdminAuditLogPage = lazy(() => import('@/pages/admin/AdminAuditLogPage'))
const AdminDineInPage = lazy(() => import('@/pages/admin/AdminDineInPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminIntegrationSettingsPage = lazy(() => import('@/pages/admin/AdminIntegrationSettingsPage'))

const KotPage = lazy(() => import('@/pages/print/KotPage'))
const InvoicePage = lazy(() => import('@/pages/print/InvoicePage'))
const DineInKotPage = lazy(() => import('@/pages/print/DineInKotPage'))
const DineInBillPage = lazy(() => import('@/pages/print/DineInBillPage'))

const DeliveryLoginPage = lazy(() => import('@/pages/delivery/DeliveryLoginPage'))
const DeliveryDashboardPage = lazy(() => import('@/pages/delivery/DeliveryDashboardPage'))

const StaffLoginPage = lazy(() => import('@/pages/staff/StaffLoginPage'))
const StaffTablesPage = lazy(() => import('@/pages/staff/StaffTablesPage'))
const StaffTableSessionPage = lazy(() => import('@/pages/staff/StaffTableSessionPage'))
const StaffKitchenQueuePage = lazy(() => import('@/pages/staff/StaffKitchenQueuePage'))

const ErrorPage = lazy(() => import('@/pages/ErrorPage'))

const SplashPage = lazy(() => import('@/pages/auth/SplashPage'))
const WelcomePage = lazy(() => import('@/pages/auth/WelcomePage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const OtpPage = lazy(() => import('@/pages/auth/OtpPage'))
const AuthSuccessPage = lazy(() => import('@/pages/auth/AuthSuccessPage'))

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

// Waiter and Kitchen share one portal. A Kitchen-only account has no reason to land on the
// table grid (it would 403 — that endpoint requires the Waiter/Admin-only DineInStaff policy),
// so route it straight to the queue it can actually use.
function StaffIndexRoute() {
  const { staff } = useStaffAuth()
  const canRunFloor = staff?.roles.some((r) => r === 'Waiter' || r === 'Admin') ?? false
  if (!canRunFloor) return <Navigate to="/staff/kitchen" replace />
  return withSuspense(<StaffTablesPage />)
}

const router = createBrowserRouter(
  [
    {
      errorElement: withSuspense(<ErrorPage />),
      children: [
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
                ...(import.meta.env.DEV ? [{ path: 'style-guide', element: withSuspense(<StyleGuidePage />) }] : []),
                { path: '*', element: withSuspense(<NotFoundPage />) },
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
        { path: '/portal', element: withSuspense(<PortalSelectionPage />) },
        { path: '/admin/login', element: withSuspense(<AdminLoginPage />) },
        { path: '/admin/forgot-password', element: withSuspense(<AdminForgotPasswordPage />) },
        { path: '/admin/reset-password', element: withSuspense(<AdminResetPasswordPage />) },
        {
          element: <RequireAdminAuth />,
          children: [
            { path: '/print/kot/:id', element: withSuspense(<KotPage />) },
            { path: '/print/invoice/:id', element: withSuspense(<InvoicePage />) },
            {
              path: '/admin',
              element: <AdminLayout />,
              children: [
                { index: true, element: withSuspense(<AdminDashboardPage />) },
                { path: 'menu', element: withSuspense(<AdminMenuPage />) },
                { path: 'orders', element: withSuspense(<AdminOrdersPage />) },
                { path: 'customers', element: withSuspense(<AdminCustomersPage />) },
                { path: 'inquiries', element: withSuspense(<AdminInquiriesPage />) },
                { path: 'delivery-partners', element: withSuspense(<AdminDeliveryPartnersPage />) },
                { path: 'coupons', element: withSuspense(<AdminCouponsPage />) },
                { path: 'dinein', element: withSuspense(<AdminDineInPage />) },
                { path: 'reports', element: withSuspense(<AdminReportsPage />) },
                { path: 'audit-log', element: withSuspense(<AdminAuditLogPage />) },
                { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
                { path: 'settings/integrations', element: withSuspense(<AdminIntegrationSettingsPage />) },
              ],
            },
          ],
        },
        { path: '/delivery/login', element: withSuspense(<DeliveryLoginPage />) },
        {
          element: <RequireDeliveryAuth />,
          children: [
            {
              path: '/delivery',
              element: <DeliveryLayout />,
              children: [{ index: true, element: withSuspense(<DeliveryDashboardPage />) }],
            },
          ],
        },
        { path: '/staff/login', element: withSuspense(<StaffLoginPage />) },
        {
          element: <RequireStaffAuth />,
          children: [
            { path: '/print/dinein-kot/:id', element: withSuspense(<DineInKotPage />) },
            { path: '/print/dinein-bill/:id', element: withSuspense(<DineInBillPage />) },
            {
              path: '/staff',
              element: <StaffLayout />,
              children: [
                { index: true, element: <StaffIndexRoute /> },
                { path: 'kitchen', element: withSuspense(<StaffKitchenQueuePage />) },
                { path: 'sessions/:id', element: withSuspense(<StaffTableSessionPage />) },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
