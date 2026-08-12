# Platform Readiness Review — Ya Raheem Catering

**Scope:** Customer app, Admin Portal, Delivery Portal, backend API
**Prepared:** 12 August 2026
**Method:** Read directly from the current codebase — file paths and behavior cited below reflect the code at time of writing, not inference.

"Live" means a feature reads from and writes to the real Postgres-backed API. "Mock" means it runs entirely on browser `localStorage` left over from the original prototype.

## At a glance

- **≈30% of major feature areas are live** on the real backend (7 of ~23): menu/category browsing, search, cart, checkout, order tracking, profile order history, admin order management.
- **≈70% still run on local mock data**: Delivery Portal, Admin's own menu editor, Admin Customers/Reports/Settings, Offers/Coupons, Reviews, Gallery, Catering inquiries, Contact form, Favorites, saved addresses, and the login mechanism itself.
- **5 regressions** were introduced by the recent wiring work — features that worked (or were at least internally consistent) before and now don't.
- **Not production-ready**: committed secrets (including a still-placeholder JWT signing key), ~0% test coverage, no rate limiting, permissive CORS fallback.

The core loop — **browse → cart → checkout → track → admin-accept** — is genuinely real: live database, live inventory deduction, live order status transitions. That is the hard part, and it works.

---

## Part A — Business Perspective

### A.1 Revenue-critical

| Status | Item | Detail |
|---|---|---|
| 🔴 Broken | Coupon discounts don't reach the bill | Checkout shows a discounted total and stores it locally, but the real order-placement call has no discount field — the backend always charges the full price. |
| ⚪ Missing | No real payment gateway | Every "online" payment is auto-approved by a dummy service. Only cash-on-delivery is meaningfully real today. |
| ⚪ Missing | Delivery fee isn't in the ledger | The fee shown to customers is frontend-only; the recorded order total is just the item subtotal. |
| ⚪ Missing | Catering isn't modeled as catering | A "catering package" is a regular product with marketing copy — no event date, guest count, deposit, or multi-day booking. For a business named *Ya Raheem Catering*, this is the largest gap between the app and the business. |
| ⚪ Missing | Catering & contact leads vanish | "Request a Custom Quote" and the contact form both save to the customer's own browser only. No admin screen reads them — every submission today is a lead the business never sees. |

### A.2 Operational — staff-facing

| Status | Item | Detail |
|---|---|---|
| 🔴 Broken | Admin can't actually update the live menu | Menu edits write to a store the customer-facing menu no longer reads — a regression, not a gap. |
| 🟡 Mock | Delivery operations run on fiction | The Delivery Portal isn't reliably fed by real orders, and Admin's "assign a rider" control and the Delivery Portal's own status track two records that never talk to each other. |
| 🟡 Mock | Dashboard, Customers, Reports show demo data | All three compute from seeded/local orders, not the real order table Admin Orders now reads. |
| 🔴 Broken | Kitchen tickets & invoices don't open cross-device | Print links point at real order IDs, but the print pages still look them up in the current browser's own local storage. |

### A.3 Trust & communication

| Status | Item | Detail |
|---|---|---|
| ⚪ Missing | No order notifications | No email/SMS on placement, confirmation, or status change. |
| 🟡 Mock | Login isn't real security | Any phone number plus the fixed code `1234` logs in — no SMS OTP, no real account ownership. |
| 🟡 Mock | Reviews are permanent marketing copy | Nine static testimonials, no way for a real customer to leave one. |

### A.4 What's genuinely working

Menu browsing, search, cart, checkout, order placement, order tracking, and admin order acceptance are real — live database, real inventory deduction, real order status transitions.

---

## Part B — Technology Perspective

### B.1 Capabilities that don't exist backend-side

| Status | Capability | Evidence |
|---|---|---|
| ⚪ Missing | Coupons / promotions | Zero matches for coupon/promo/discount anywhere in the backend. `Order.Total` is a straight copy of `cart.Subtotal`. |
| ⚪ Missing | Delivery fee logic | No fee/threshold concept in Cart or Orders pricing. |
| ⚪ Missing | Reviews / ratings | No entity, no rating field on `Product`. |
| ⚪ Missing | Notifications | No email/SMS service anywhere; status changes write history rows only. |
| 🟡 Stub | Payments | `IPaymentService` is a real extensibility seam, but the only implementation is `DummyPaymentService` — no gateway, no webhook signature verification. |
| ⚪ Missing | Delivery / logistics domain | No rider, geofence, or service-area concept anywhere in Inventory or Orders. |
| ⚪ Missing | Catering scheduling | No event date, deposit, or bundle/package model on `Product` or `Order`. |
| 🟡 Stub | Product image upload | Admin image endpoint accepts a URL string only — no file/blob upload path. |
| 🟡 Stub | Search | Name-only `ILIKE` match; no full-text search, no description/tag matching. |

### B.2 Regressions introduced by the recent wiring work

1. **Checkout total can disagree with what the customer was shown** — the discount computed in `CheckoutPage` never reaches `CheckoutRequest`.
2. **KOT/Invoice unreachable across devices** — real order IDs, local-only lookup.
3. **Two disconnected pictures of "all orders" on the admin side** — `AdminOrdersPage` reads the real API; Dashboard/Customers/Reports still read the local demo-seeded mirror.
4. **Delivery-partner assignment split across two stores** — Admin's assignment map (keyed by order ID) vs. the Delivery Portal's field on the old per-customer mirror.
5. **Admin menu edits are invisible to customers** — the public catalog reads the live API; Admin Menu Management still writes to an orphaned local override.

> Also found and fixed this session: the admin order-status endpoint had never been exercised end-to-end and always threw on save — a genuine EF Core tracking bug (a new status-history row queued as an `UPDATE` instead of an `INSERT`). The kind of defect near-zero test coverage lets through silently.

### B.3 Production-readiness

| Severity | Item | Detail |
|---|---|---|
| 🔴 Critical | Secrets committed in plaintext | DB password, admin seed password, and the JWT signing key — still literally the placeholder `CHANGE_ME_super_secret_signing_key...` — all sit in `appsettings.json`. |
| 🔴 Critical | CORS falls open if unconfigured | An empty allow-list silently falls back to reflect-any-origin with credentials enabled. |
| 🔴 Critical | No rate limiting anywhere | Login, register, refresh, and the payment webhook are all unthrottled. |
| 🟠 High | Payment webhook has no signature check | Any caller can mark a transaction "paid" by guessing/replaying a reference. |
| 🟠 High | Server errors leak internals | The global exception handler returns raw `exception.Message` in every environment, including 500s. |
| 🟠 High | Test coverage is effectively zero | 7 tests total, covering one validator and a string-casing helper. Auth, checkout, payments, and inventory deduction have no coverage. |
| 🟡 Medium | CI/CD covers the frontend only | The only pipeline builds/deploys the React app; nothing builds, tests, or deploys the backend. |
| 🟡 Medium | One migration silently drops data | A column rename in Catalog drops the old URL column with no backfill. |
| ⚪ Low | No account recovery | No email verification, password reset, or lockout on the real backend accounts the app quietly creates. |

---

## Recommended sequencing

1. **Stop the bleeding** — fix/hide the coupon UI, rotate secrets, add rate limiting, verify the webhook, stop leaking exception detail.
2. **Repair the regressions** — fix KOT/Invoice, unify admin's order data sources, surface catering/contact leads.
3. **Close the operational loop** — build a minimal delivery domain, wire Admin Menu Management to the Catalog CRUD that already exists.
4. **Build what the business is named after** — real payment gateway, delivery fee/discount modeled server-side, order notifications, a real catering data model.
5. **Harden, once traffic is real** — test coverage, backend CI/CD, centralized logging/metrics, real OTP + account recovery.

See [`STABILIZATION_ROADMAP.md`](./STABILIZATION_ROADMAP.md) for the detailed 4-week execution plan covering steps 1–3 above.
