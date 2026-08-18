import { http, HttpResponse } from 'msw'
import { demoCategories, demoProducts, findDemoProduct } from '@/mocks/fixtures/catalog'
import { demoUsers, findDemoUser } from '@/mocks/fixtures/users'
import { DemoError } from '@/mocks/errors'
import { callerFromRequest, issueAuth, tryLogin } from '@/mocks/store/auth'
import * as cart from '@/mocks/store/cart'
import * as orders from '@/mocks/store/orders'
import * as delivery from '@/mocks/store/delivery'
import * as dineIn from '@/mocks/store/dineIn'
import type {
  BackendOrderStatus,
  CheckoutRequest,
  CreateDeliveryPartnerRequest,
  DeliveryAssignmentStatus,
  ProductDetailsResponse,
  UpdateDeliveryPartnerRequest,
  UserDto,
} from '@/lib/api/types'

// Every path is prefixed with "*" so it matches regardless of origin — the app's API_BASE_URL
// falls back to http://localhost:5247 when VITE_API_BASE_URL isn't set (never set for this demo
// build), and MSW's service worker intercepts that cross-origin request just fine either way.
const path = (p: string) => `*${p}`

function ok(data: unknown, message = '') {
  return HttpResponse.json({ success: true, message, data })
}

function created(data: unknown, message = '') {
  return HttpResponse.json({ success: true, message, data }, { status: 201 })
}

function fail(error: unknown) {
  if (error instanceof DemoError) {
    return HttpResponse.json({ title: 'Error', detail: error.message }, { status: error.status })
  }
  console.error('[demo mode]', error)
  return HttpResponse.json(
    { title: 'Error', detail: 'Something went wrong in the demo.' },
    { status: 500 },
  )
}

function requireCaller(request: Request): UserDto {
  const caller = callerFromRequest(request)
  if (!caller) throw new DemoError(401, 'Not signed in.')
  return caller
}

function paginationFrom(request: Request) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1') || 1
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20') || 20
  return { page, pageSize }
}

export const handlers = [
  // ---------- Auth (shared login/refresh path across all four portals) ----------
  http.post(path('/api/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const user = tryLogin(body.email, body.password)
    if (!user)
      return HttpResponse.json(
        { title: 'Unauthorized', detail: 'Invalid email or password.' },
        { status: 401 },
      )
    return ok(issueAuth(user), 'Logged in.')
  }),

  http.post(path('/api/auth/refresh'), async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string }
    const email = body.refreshToken?.split(':')[1]
    const user = demoUsers.find((u) => u.email === email)
    if (!user)
      return HttpResponse.json(
        { title: 'Unauthorized', detail: 'Session expired.' },
        { status: 401 },
      )
    return ok(issueAuth(user))
  }),

  http.post(path('/api/auth/register'), async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      firstName: string
      lastName: string
      phoneNumber?: string
    }
    if (findDemoUser(body.email)) {
      return HttpResponse.json(
        { title: 'Conflict', detail: 'An account with that email already exists.' },
        { status: 409 },
      )
    }
    const user: UserDto = {
      id: `user-${demoUsers.length + 1}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber ?? null,
      roles: ['Customer'],
    }
    demoUsers.push(user)
    return created(issueAuth(user), 'Account created.')
  }),

  // ---------- Catalog ----------
  http.get(path('/api/products'), () =>
    ok({
      items: demoProducts,
      page: 1,
      pageSize: demoProducts.length,
      totalCount: demoProducts.length,
      totalPages: 1,
    }),
  ),

  http.get(path('/api/products/:id'), ({ params }) => {
    const product = findDemoProduct(String(params.id))
    if (!product) return fail(new DemoError(404, 'Product not found.'))
    const detail: ProductDetailsResponse = { ...product, description: null, isActive: true }
    return ok(detail)
  }),

  http.get(path('/api/categories'), () => ok(demoCategories)),

  // ---------- Cart ----------
  http.get(path('/api/cart'), ({ request }) => {
    try {
      return ok(cart.getCart(requireCaller(request).id))
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/cart/items'), async ({ request }) => {
    try {
      const caller = requireCaller(request)
      const body = (await request.json()) as { productId: string; quantity: number }
      return ok(cart.addItem(caller.id, body.productId, body.quantity))
    } catch (e) {
      return fail(e)
    }
  }),

  http.put(path('/api/cart/items/:id'), async ({ request, params }) => {
    try {
      const caller = requireCaller(request)
      const body = (await request.json()) as { quantity: number }
      return ok(cart.updateItem(caller.id, String(params.id), body.quantity))
    } catch (e) {
      return fail(e)
    }
  }),

  http.delete(path('/api/cart/items/:id'), ({ request, params }) => {
    try {
      const caller = requireCaller(request)
      return ok(cart.removeItem(caller.id, String(params.id)))
    } catch (e) {
      return fail(e)
    }
  }),

  http.delete(path('/api/cart/clear'), ({ request }) => {
    try {
      return ok(cart.clearCart(requireCaller(request).id))
    } catch (e) {
      return fail(e)
    }
  }),

  // ---------- Customer orders ----------
  http.post(path('/api/orders/checkout'), async ({ request }) => {
    try {
      const caller = requireCaller(request)
      const body = (await request.json()) as CheckoutRequest
      return created(orders.checkout(caller.id, body), 'Order placed.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/orders/my-orders'), ({ request }) => {
    try {
      const caller = requireCaller(request)
      const { page, pageSize } = paginationFrom(request)
      return ok(orders.getMyOrders(caller.id, page, pageSize))
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/orders/:id/tracking'), ({ params }) => {
    try {
      return ok(orders.getOrderTracking(String(params.id)))
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/orders/:id'), ({ params }) => {
    try {
      return ok(orders.getOrderById(String(params.id)))
    } catch (e) {
      return fail(e)
    }
  }),

  // ---------- Admin: orders, customers, delivery partners ----------
  http.get(path('/api/admin/orders'), ({ request }) => {
    const { page, pageSize } = paginationFrom(request)
    return ok(orders.getAdminOrders(page, pageSize))
  }),

  http.put(path('/api/admin/orders/:id/status'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { status: BackendOrderStatus; notes?: string }
      return ok(
        orders.updateOrderStatus(String(params.id), body.status, body.notes ?? null),
        'Order updated.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/admin/orders/:id/delivery-assignment'), ({ params }) =>
    ok(delivery.getAssignmentForOrder(String(params.id))),
  ),

  http.put(path('/api/admin/orders/:id/assign-delivery'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { deliveryPartnerId: string }
      return ok(
        delivery.assignDelivery(String(params.id), body.deliveryPartnerId),
        'Delivery assigned.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/admin/customers'), () => {
    const customers = demoUsers
      .filter((u) => u.roles.includes('Customer'))
      .map((u) => {
        const myOrders = orders.getMyOrders(u.id, 1, 1000).items
        return {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phoneNumber,
          createdAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
          orderCount: myOrders.length,
          totalSpent: myOrders.reduce((sum, o) => sum + o.total, 0),
          lastOrderAt: myOrders[0]?.createdAt ?? null,
        }
      })
    return ok(customers)
  }),

  http.get(path('/api/admin/delivery-partners'), () => ok(delivery.getPartners())),

  http.post(path('/api/admin/delivery-partners'), async ({ request }) => {
    const body = (await request.json()) as CreateDeliveryPartnerRequest
    return created(
      delivery.createPartner(body.name, body.phoneNumber, body.vehicleType, body.email),
      'Delivery partner added.',
    )
  }),

  http.put(path('/api/admin/delivery-partners/:id'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as UpdateDeliveryPartnerRequest
      return ok(
        delivery.updatePartner(
          String(params.id),
          body.name,
          body.phoneNumber,
          body.vehicleType,
          body.status,
        ),
        'Delivery partner updated.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/admin/dinein/sessions'), () => ok(dineIn.getSessionsForAdmin())),

  http.post(path('/api/admin/demo/reset'), () =>
    ok(null, 'Demo data is already fresh on this build — refresh the page for a clean slate.'),
  ),

  // ---------- Delivery portal ----------
  http.get(path('/api/delivery/my-orders'), ({ request }) => {
    try {
      return ok(delivery.getMyOrders(requireCaller(request).id))
    } catch (e) {
      return fail(e)
    }
  }),

  http.put(path('/api/delivery/orders/:id/status'), async ({ request, params }) => {
    try {
      const caller = requireCaller(request)
      const body = (await request.json()) as { status: DeliveryAssignmentStatus }
      return ok(
        delivery.updateMyOrderStatus(caller.id, String(params.id), body.status),
        'Status updated.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  // ---------- Dine-in: waiter ----------
  http.get(path('/api/staff/dinein/tables'), () => ok(dineIn.getTables())),

  http.post(path('/api/staff/dinein/tables/:id/mark-clean'), ({ params }) => {
    try {
      return ok(dineIn.markTableCleaned(String(params.id)), 'Table is available again.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/tables/:id/sessions'), async ({ request, params }) => {
    try {
      const caller = requireCaller(request)
      const body = (await request.json()) as { guestCount: number }
      return created(
        dineIn.openSession(String(params.id), caller.id, body.guestCount),
        'Table opened.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/staff/dinein/sessions/:id'), ({ params }) => {
    try {
      return ok(dineIn.getSession(String(params.id)))
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/rounds'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { items: { productId: string; quantity: number }[] }
      return ok(dineIn.fireRound(String(params.id), body.items), 'Round fired to the kitchen.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/request-bill'), ({ params }) => {
    try {
      return ok(dineIn.requestBill(String(params.id)), 'Bill requested.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/discount'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { amount: number; reason: string }
      return ok(dineIn.applySessionDiscount(String(params.id), body.amount, body.reason), 'Discount applied.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/discount/remove'), ({ params }) => {
    try {
      return ok(dineIn.removeSessionDiscount(String(params.id)), 'Discount removed.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:sessionId/rounds/:roundId/items/:itemId/comp'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { reason: string }
      return ok(
        dineIn.compRoundItem(String(params.sessionId), String(params.roundId), String(params.itemId), body.reason),
        'Item comped.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:sessionId/rounds/:roundId/items/:itemId/uncomp'), ({ params }) => {
    try {
      return ok(
        dineIn.uncompRoundItem(String(params.sessionId), String(params.roundId), String(params.itemId)),
        'Comp removed.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:sessionId/rounds/:roundId/cancel'), ({ params }) => {
    try {
      return ok(
        dineIn.cancelRound(String(params.sessionId), String(params.roundId)),
        'Round cancelled — stock restored.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:sessionId/rounds/:roundId/serve'), ({ params }) => {
    try {
      return ok(
        dineIn.markRoundServed(String(params.sessionId), String(params.roundId)),
        'Round marked as served.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.get(path('/api/staff/dinein/rounds/:id'), ({ params }) => {
    try {
      return ok(dineIn.getRoundForPrint(String(params.id)))
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/close'), ({ params }) => {
    try {
      return ok(dineIn.closeSession(String(params.id)), 'Table closed out.')
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:id/payments'), async ({ request, params }) => {
    try {
      const body = (await request.json()) as { amount: number; method: string; label?: string }
      return ok(
        dineIn.createPayment(String(params.id), body.amount, body.method, body.label),
        'Payment recorded.',
      )
    } catch (e) {
      return fail(e)
    }
  }),

  http.post(path('/api/staff/dinein/sessions/:sessionId/payments/:paymentId/verify'), () =>
    fail(new DemoError(409, 'Razorpay is not available in this demo.')),
  ),

  // ---------- Dine-in: kitchen ----------
  http.get(path('/api/staff/dinein/kitchen/rounds'), () => ok(dineIn.getKitchenQueue())),

  http.post(path('/api/staff/dinein/kitchen/rounds/:id/advance'), ({ params }) => {
    try {
      return ok(dineIn.advanceRoundStatus(String(params.id)), 'Round status updated.')
    } catch (e) {
      return fail(e)
    }
  }),
]
