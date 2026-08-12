# Ya Raheem Platform — 4-Week Stabilization Roadmap

**Prepared for:** Engineering team
**Basis:** [Platform Readiness Review](./PLATFORM_READINESS_REVIEW.md) — business & technology audit, 12 Aug 2026
**Team:** 2 full-stack developers, 1 QA engineer
**Stack constraints:** Existing React + ASP.NET Core 10 + PostgreSQL codebase only. No Docker, no cloud migration, no microservices — everything below assumes the current deployment model (backend + frontend + Postgres on existing infrastructure).

## How to read this plan

Each week has a fixed goal that the next week depends on — do not resequence:

1. **Week 1** closes the items that are actively unsafe to leave open (money, secrets, exposed credentials). Nothing else matters if these aren't fixed first.
2. **Week 2** repairs the admin/staff-facing tooling that the previous wiring work left disconnected from reality.
3. **Week 3** builds the two genuinely new pieces of backend domain (delivery, live menu CRUD) — the largest week, split one developer per domain.
4. **Week 4** is deliberately kept light on new feature work — it exists to prove the previous three weeks hold together under real end-to-end use before anyone outside the team touches it.

Suggested pairing: Dev A and Dev B rotate between backend/frontend halves of the same feature within a week rather than splitting "backend dev" / "frontend dev" — every feature this month touches both sides of the stack, and context lost at that handoff is expensive on a 4-week clock. Week 3 is the exception: split by domain (one dev owns Delivery end-to-end, the other owns Menu CRUD end-to-end) since those two workstreams don't share code.

---

## Week 1 — Pricing Integrity, Security Fixes, Remove Dangerous UI Paths

### Objectives

- The amount a customer is shown at checkout is always the amount actually charged and recorded — no exceptions.
- Close every credential/secret exposure that would be unacceptable the moment a real person outside the team opens the app.
- Remove or gate every UI surface that leaks a password, a debug shortcut, or unauthenticated sensitive data.

### Backend tasks

| # | Task | Notes |
|---|---|---|
| 1.1 | Disable coupon acceptance at the API boundary | `CheckoutRequest` has no discount field today — keep it that way. Add a validator rule / explicit comment that checkout is subtotal-only until a real coupon domain exists (Week 3+ backlog, not this sprint). |
| 1.2 | Move all secrets out of `appsettings.json` | DB password, JWT `SigningKey` (currently the literal placeholder `CHANGE_ME_super_secret_signing_key_min_32_chars`), and `AdminSeed:Password` must come from environment variables or `dotnet user-secrets` in dev, and real environment variables wherever the app is actually deployed. Generate a new signing key — do not reuse the placeholder. |
| 1.3 | Fail closed on missing CORS config | `AddSharedCors` currently falls back to reflect-any-origin + credentials when `Cors:AllowedOrigins` is empty. Change the fallback to deny-all with a startup log warning instead. |
| 1.4 | Add rate limiting | ASP.NET Core's built-in `Microsoft.AspNetCore.RateLimiting` on `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, and `/api/payments/webhook`. Fixed-window or sliding-window, per-IP, generous enough not to lock out normal retry behavior (tune with QA in this week, not guessed). |
| 1.5 | Verify payment webhook signatures | `DummyPaymentService`'s webhook currently trusts any caller. Add an HMAC shared-secret check (config-driven secret) even though there's no real gateway yet — this is the seam a real gateway plugs into later, and it should not ship open. |
| 1.6 | Environment-gate exception detail | `GlobalExceptionHandler` currently returns `exception.Message` in every environment, including unhandled 500s. Gate `problemDetails.Detail` behind `env.IsDevelopment()`; return a generic message otherwise. |
| 1.7 | Rotate JWT signing key rollout plan | Document (README or ops note) that rotating the key invalidates all existing access/refresh tokens — every logged-in session (customer, admin, delivery once it exists) is forced to re-authenticate. Coordinate timing with QA/demo users. |

### Frontend tasks

| # | Task | Notes |
|---|---|---|
| 1.8 | Remove/gate coupon input at checkout | Hide the "Coupon code" field and Apply button on `CheckoutPage.tsx` behind a "Coming soon" disabled state rather than deleting the UI outright — keeps the layout ready for when 1.1's backend counterpart exists. |
| 1.9 | Remove admin credential hint | Delete the "Seeded admin account: Email … Password …" block from `AdminLoginPage.tsx`. |
| 1.10 | Remove OTP value disclosure | `AuthProvider.requestOtp`'s toast ("Demo OTP for X: 1234") and the on-screen "Demo mode — use 1234" hint on `OtpPage.tsx` must not display the code in a build anyone outside the dev team will see. Gate behind `import.meta.env.DEV` at minimum. |
| 1.11 | Require auth on print routes | `/print/kot/:id` and `/print/invoice/:id` are currently top-level routes outside `RequireAuth`/`RequireAdminAuth` in `routes.tsx`. Wrap them in `RequireAdminAuth` — only staff should ever reach these. |
| 1.12 | Exclude dev-only routes from the production build | `/style-guide` and any other internal-only route should not ship in a production build reachable by the public. |
| 1.13 | Sweep for other unauthenticated sensitive routes | Full pass over `routes.tsx` against the auth-wrapper tree — confirm nothing else slipped outside `RequireAuth`/`RequireAdminAuth`/`RequireDeliveryAuth`. |

### Database migrations

None required this week if 1.1 stays a validation-only guardrail (no new `discount` column). If product wants forward-compatibility groundwork, an additive, non-breaking migration is acceptable:

```
AddDiscountAmountToOrders — orders.discount_amount numeric(12,2) NOT NULL DEFAULT 0
```

Do not wire it to anything yet — it exists only so a later coupon feature isn't a breaking schema change. Treat as optional; skip if it adds risk without near-term payoff.

### Testing tasks

- Checkout total parity: place orders via every payment method with the coupon UI hidden; confirm displayed total always equals `OrderDto.total` from the API.
- Rate limiting: scripted burst of login attempts confirms throttling triggers at the configured threshold and recovers correctly after the window.
- CORS: request from an unlisted origin is rejected; request from a listed origin still succeeds.
- Webhook: request without a valid signature is rejected (401/403); a validly-signed request is accepted.
- Production-mode 500: force an unhandled exception in a non-Development environment, confirm the response body contains no exception text/stack trace.
- UI sweep: confirm no OTP value, admin password, or other credential appears anywhere in the rendered DOM or network responses in a production-mode build.
- Auth sweep: attempt to reach `/print/kot/:id`, `/print/invoice/:id`, and `/style-guide` while logged out — confirm redirect/block.

### Risks

- **Session invalidation from the key rotation** will force every current tester/demo user to log in again — schedule for a low-traffic moment and communicate ahead of time.
- **Rate-limit thresholds guessed wrong** can lock out legitimate users during testing itself — budget time to tune, don't ship the first number tried.
- **Hiding the coupon UI** may raise questions from stakeholders expecting that feature to work — have the "why" (price-integrity bug, real fix scheduled post-pilot) ready to explain.
- Secrets migration touches every environment the app runs in — coordinate with whoever owns deployment access outside the dev team if that's not the 2 developers themselves.

### Definition of Done

- [ ] No secret (DB password, JWT key, admin password) exists in any committed file; all environments read them from environment variables.
- [ ] Checkout total shown to the customer matches the amount recorded server-side in 100% of QA test runs.
- [ ] Rate limiting is active and verified on all four listed endpoints.
- [ ] Payment webhook rejects unsigned/invalid requests.
- [ ] No exception detail is returned to clients outside Development.
- [ ] No credential, password, or OTP code is visible anywhere in a production-mode build.
- [ ] Print pages require authentication.
- [ ] PR reviewed by both developers, QA sign-off recorded, merged to `main`.

---

## Week 2 — Real Dashboard & Reports, Invoice/KOT Fixes, Contact & Catering Inquiries

### Objectives

- Admin Dashboard, Reports, and Customers reflect real orders, not seeded/local demo data.
- Kitchen tickets and invoices open correctly regardless of which device/browser the staff member is using.
- Every catering inquiry and contact-form submission is visible to staff — none are silently lost.

### Backend tasks

| # | Task | Notes |
|---|---|---|
| 2.1 | Admin reporting endpoints | `GET /api/admin/reports/summary` (today's revenue/orders, pending count, completed count), `GET /api/admin/reports/revenue-by-day`, `GET /api/admin/reports/top-selling`. Build on existing `Order`/`OrderItem` tables — group-by queries, no new schema needed. |
| 2.2 | Admin customers endpoint | `GET /api/admin/customers` — list registered users with order count + total spend, joined from Identity `Users` and Orders. |
| 2.3 | Expose payment method on `OrderDto` | Invoices need a payment-method label. Join `PaymentTransaction.Method` into the order read path (either add a field to `OrderDto` or a small `GET /api/admin/orders/{id}/payment-summary`). |
| 2.4 | New Contact module | `ContactMessage` entity (name, email, phone, subject, message, created_at, is_resolved). `POST /api/contact` (public, rate-limited), `GET /api/admin/contact-messages`, `PUT /api/admin/contact-messages/{id}/resolve`. |
| 2.5 | New Catering Inquiry module | `CateringInquiry` entity (name, phone, email, event_date, guest_count, package_reference, message, created_at, status). `POST /api/catering/inquiries` (public, rate-limited), `GET /api/admin/catering-inquiries`, `PUT /api/admin/catering-inquiries/{id}/status`. |

### Frontend tasks

| # | Task | Notes |
|---|---|---|
| 2.6 | Rewire `AdminDashboardPage` | Replace `useAdminData()` (local mirror) with a real-data hook calling 2.1/2.2, same pattern already used in `AdminOrdersPage.tsx`. |
| 2.7 | Rewire `AdminReportsPage` | Port `src/features/admin/lib/analytics.ts` to consume `OrderDto[]`/report endpoint responses instead of the local `Order[]` shape. |
| 2.8 | Rewire `AdminCustomersPage` | Wire to 2.2. |
| 2.9 | Fix `KotPage.tsx` / `InvoicePage.tsx` | Replace `getOrderById()` (local mirror lookup) with a real fetch by id (reuse `fetchOrder`/an admin equivalent), including the new payment-method field from 2.3. |
| 2.10 | Wire `ContactForm.tsx` | POST to 2.4 instead of `useLocalStorage`. |
| 2.11 | Wire catering `InquiryDialog.tsx` | POST to 2.5 instead of `useLocalStorage`. |
| 2.12 | New admin views for inbound leads | A "Messages" and/or "Catering Inquiries" tab/page listing submissions from 2.4/2.5 with a mark-resolved action — this view doesn't exist locally today either, it's genuinely new. |

### Database migrations

```
AddContactMessages         — new table: contact_messages
AddCateringInquiries       — new table: catering_inquiries
```

Both additive, no impact on existing tables. No migration needed for 2.1–2.3 (query-only against existing schema).

### Testing tasks

- Cross-check dashboard/report numbers against a manually-tallied sample order set — numbers must match exactly, not "approximately."
- Open KOT and Invoice for the same order from two different browsers/devices — both must render identical, correct content.
- Submit a contact message and a catering inquiry from the customer app; confirm both appear in the new admin views within a normal page load, and that "mark resolved" persists.
- Regression pass: confirm the Delivery Portal (still on the local mirror until Week 3) still functions unchanged — this week must not break it further.

### Risks

- Payment-method exposure (2.3) is a cross-module join (Orders ↔ Payments) — the first genuinely cross-module read in this sprint; timebox investigation, fall back to a second lightweight endpoint call from the frontend if a clean join proves awkward.
- Temptation to redesign the reports UI while touching it — resist; the goal is a data-source swap behind the existing charts, not a redesign.
- Public-facing `POST /api/contact` and `POST /api/catering/inquiries` are unauthenticated by nature (a lead shouldn't require login) — make sure Week 1's rate limiting pattern is applied here too, or these become a new abuse vector the moment they ship.

### Definition of Done

- [ ] Dashboard, Reports, and Customers pages show figures traceable to real orders, verified against a manual tally.
- [ ] KOT and Invoice open correctly from any authenticated device for any order.
- [ ] Contact and catering submissions are persisted server-side and actionable from an admin view.
- [ ] New public endpoints are rate-limited.
- [ ] Delivery Portal still functions as it did at the end of Week 1 (no incidental regression).
- [ ] PR reviewed, QA sign-off recorded, merged to `main`.

---

## Week 3 — Delivery Assignment Module, Admin Menu Live CRUD Integration

### Objectives

- A real order can be assigned to a real delivery partner, who sees it in their own dashboard and advances it through delivery states, all reflected on the customer's live tracking page.
- Admin menu edits (add/edit/delete item, toggle availability) are immediately visible to customers — no local-only override left in the loop.

This is the heaviest week in the plan. **Split by domain, not by layer**: Dev A owns Delivery end-to-end (backend + frontend), Dev B owns Menu CRUD end-to-end. They don't share code this week, so parallelizing this way avoids handoff overhead.

### Backend tasks — Delivery (Dev A)

| # | Task | Notes |
|---|---|---|
| 3.1 | `DeliveryPartner` entity + admin CRUD | name, phone, vehicle type, status (Available/Busy/Offline). `GET/POST/PUT /api/admin/delivery-partners`. |
| 3.2 | `DeliveryPartner` role | Extend Identity's role seeding (same pattern as `Role.WellKnown.Admin`/`Customer`) with a `DeliveryPartner` role. Decide auth approach: reuse the existing JWT login flow with a partner-specific login endpoint, mirroring how Admin auth works today — not a new auth system. |
| 3.3 | Order↔partner assignment | `OrderDeliveryAssignment` entity (order_id, delivery_partner_id, status: Unassigned/Assigned/PickedUp/OutForDelivery/Delivered, assigned_at, updated_at). `PUT /api/admin/orders/{id}/assign-delivery`. |
| 3.4 | Delivery-partner-facing endpoints | `GET /api/delivery/my-orders` (assigned to the authenticated partner), `PUT /api/delivery/orders/{id}/status` (partner advances their own assignment's status; validate against an explicit allowed-transitions map, same pattern as `OrderStatusTransitionService`). |
| 3.5 | Apply the Week-earlier EF Core lesson proactively | When adding new status-history-style rows on an already-tracked parent (mirrors the `OrderStatusHistory` bug fixed in the previous sprint), add the child via its `DbSet` directly, not only via the parent's navigation collection. Write a regression test for this specific pattern — see Testing tasks. |

### Backend tasks — Menu CRUD (Dev B)

| # | Task | Notes |
|---|---|---|
| 3.6 | Confirm existing Catalog admin endpoints are sufficient | `POST/PUT/DELETE /api/products`, category endpoints, `AdminProductImageEndpoints`, `AdminProductVariantEndpoints` already exist from earlier phases. Verify they cover every action `AdminMenuPage.tsx` needs (add, edit, delete, toggle availability); add a lightweight `PATCH /api/products/{id}/availability` if the full `PUT` is too heavy for a simple toggle. |
| 3.7 | Decide the fate of presentational-only fields | Spice level, veg flag, signature/bestseller badges, combo contents, and section membership exist only in the frontend's static seed data (`menuData.ts`) — the backend `Product` schema doesn't model them. **This needs an explicit product decision before 3.8**, not a silent default: either (a) extend `Product` with these fields now, or (b) keep them admin-uneditable this sprint and flag it in the UI. Flagged as a risk below — do not let this stall the week. |

### Frontend tasks

| # | Task | Notes | Owner |
|---|---|---|---|
| 3.8 | Real Delivery login | `DeliveryLoginPage.tsx` calls the real partner login endpoint (3.2), same JWT-session pattern as `adminClient.ts` — its own storage key, isolated from customer/admin sessions. | Dev A |
| 3.9 | Real Delivery dashboard | `DeliveryDashboardPage.tsx` fetches assigned orders from 3.4, status-advance buttons call the real endpoint. | Dev A |
| 3.10 | Rewire `AdminDeliveryPartnersPage` | CRUD against 3.1 instead of `useDeliveryPartners()` localStorage hook. | Dev A |
| 3.11 | Rewire `AdminOrdersPage`'s delivery-partner selector | Call 3.3 instead of `orderDeliveryAssignmentStore.ts` — this retires the local store entirely, closing the "two disconnected assignment mechanisms" issue from the readiness review. | Dev A |
| 3.12 | Rewire `AdminMenuPage` | Replace `menuStore.ts` reads/writes with real Catalog API calls, following the same hybrid-merge shape `useMenuData()` already established for the customer-facing menu, resolved per the 3.7 decision. | Dev B |
| 3.13 | Confirm customer-facing menu reflects admin edits immediately | End-to-end check that `useMenuData()`'s existing live-fetch behavior picks up admin changes with no local-storage dependency left anywhere in the path. | Dev B |

### Database migrations

```
AddDeliveryPartners             — new table: delivery_partners
AddOrderDeliveryAssignments     — new table: order_delivery_assignments (FK: orders, delivery_partners)
AddDeliveryPartnerRole          — seed row: roles ('DeliveryPartner')
```

Plus, only if 3.7 resolves to option (a):
```
AddPresentationalFieldsToProducts — spice_level, is_veg, is_signature, is_best_seller, combo_slots, sections
```

### Testing tasks

- Full delivery lifecycle: admin assigns partner → partner sees it in their dashboard → partner advances Assigned → PickedUp → OutForDelivery → Delivered → customer's `OrderTrackingPage` reflects each transition in real time.
- Regression test specifically targeting the EF Core "new child on tracked parent" pattern (3.5) — write it as an automated test this time, not something QA discovers by hand.
- Menu CRUD: create, edit, delete, and toggle-availability a product from Admin; confirm the change appears on the customer-facing menu without a hard refresh workaround.
- Confirm a deleted/unpublished product disappears from cart/checkout flows cleanly (no orphaned cart lines referencing a product that no longer exists).
- Concurrent-assignment check: two admins attempting to assign the same order to different partners at once — confirm a sane, non-corrupting outcome (last-write-wins is acceptable at this scale; a silent data-integrity break is not).

### Risks

- **This is the most ambitious week in the plan for a 2-developer team** — if either domain slips, prefer to ship Delivery and Menu CRUD in whatever state they're in and carry the remainder into Week 4's buffer rather than compressing testing time.
- **3.7 (presentational field ownership) is a product decision, not an engineering one** — surface it to whoever owns product decisions on day 1 of this week, not day 4.
- Delivery partner auth reusing the JWT pattern is the third parallel session type in the app (customer, admin, delivery) — confirm the three storage keys/session scopes stay isolated, exactly as customer and admin sessions were kept isolated previously.
- New tables + new role seeding means new migrations touching Identity and a new schema — coordinate migration ordering with Week 1's rollback rehearsal plan (see Week 4).

### Definition of Done

- [ ] An admin can assign a real order to a real delivery partner; the partner sees and can advance it; the customer sees each status change live.
- [ ] The two previously-disconnected delivery-assignment mechanisms are reduced to one.
- [ ] Admin can create/edit/delete/toggle menu items and see the change reflected on the customer-facing menu with no local-storage involvement.
- [ ] The 3.7 decision is made, documented, and reflected consistently in both backend schema and frontend behavior (not half-implemented).
- [ ] EF Core child-entity-tracking regression test passes.
- [ ] Both workstreams' PRs reviewed, QA sign-off recorded, merged to `main`.

---

## Week 4 — End-to-End Testing, Bug Fixing, Pilot Launch Preparation

### Objectives

- Prove the full customer → kitchen → delivery → admin lifecycle holds together under realistic, uninterrupted use.
- Close out defects surfaced across Weeks 1–3 rather than carrying them into pilot.
- Leave the app in a state a small group of real users and real staff can be handed for a pilot, with a documented rollback path if something goes wrong.

This week intentionally has **no new feature work**. Treat any feature request that surfaces this week as backlog for after pilot, not an exception.

### Backend tasks

| # | Task | Notes |
|---|---|---|
| 4.1 | Pay down critical-path test debt | Automated tests for auth (login/register/refresh/rate-limit), checkout (all payment methods, stock deduction, order creation), order status transitions (including the delivery transitions added in Week 3), and inventory deduction under concurrent orders. This is where the ~0% coverage flagged in the readiness review gets addressed — prioritize the paths that would hurt most if they silently broke. |
| 4.2 | Fix defects found in E2E pass | See Testing tasks below — this is the main backend activity of the week. |
| 4.3 | Finalize environment configuration for pilot | Confirm every secret (Week 1) is sourced from the pilot environment's actual configuration, not a leftover dev value. |
| 4.4 | Database backup/restore runbook | Since there's no cloud/managed-Postgres safety net, script and document `pg_dump`/`pg_restore` for the actual deployment host, and rehearse it once against a real snapshot before pilot. |
| 4.5 | Rollback rehearsal | Apply the full Week 1–3 migration set to a fresh restore of a pre-sprint snapshot; confirm a clean apply with no manual intervention. |

### Frontend tasks

| # | Task | Notes |
|---|---|---|
| 4.6 | Cross-browser/device pass | Customer app, Admin Portal, Delivery Portal each checked on at least the browser/device mix real pilot users will actually have. |
| 4.7 | Fix defects found in E2E pass | Main frontend activity of the week. |
| 4.8 | Production-build audit | Confirm dev-only routes/hints removed in Week 1 stay removed; no console errors/warnings in a production build; no leftover "demo"/"mock" language in any flow that's now real. |
| 4.9 | Loading/error-state polish | Every page wired to a live API this month (dashboard, reports, customers, delivery, menu CRUD) gets a real loading and error state — not a silent blank screen on failure. |

### Database migrations

None planned. This week validates the migrations already shipped (4.5) rather than adding new ones. If a Week 1–3 defect genuinely requires a schema fix, treat it as an exception and document why it couldn't wait.

### Testing tasks

- Full end-to-end regression: place an order as a customer, have it accepted and progressed by admin, assigned to and delivered by a rider, tracked live throughout, printed correctly at KOT/invoice — one continuous script, run by QA, no shortcuts.
- Re-run the entire Week 1 security checklist (rate limiting, CORS, webhook signature, exception leakage, credential exposure) — confirm nothing regressed across the following three weeks of changes.
- Light load/smoke test at the volume expected during pilot (concurrent checkouts, concurrent admin status updates) — this sprint already found one real concurrency bug (the EF Core status-history issue) purely by exercising an endpoint for the first time; assume there may be others until proven otherwise under load.
- UAT session with actual restaurant/kitchen/delivery staff on the Admin and Delivery Portals — script real tasks, watch for friction, not just correctness.
- Go/no-go checklist reviewed with all four roles present (both developers, QA, whoever owns the pilot decision).

### Risks

- **Bug-fixing weeks are reliably underestimated** — hold a contingency buffer; if defect volume from the E2E pass is high, defer non-blocking polish (4.9-level items) rather than compressing QA's re-verification time.
- **Real payment gateway integration is explicitly out of scope for this 4-week plan** — pilot must launch either cash-on-delivery-only, or payments must be pulled forward from the broader roadmap's Phase 3 before pilot; this needs an explicit decision now, not an assumption.
- Team fatigue after three demanding weeks is real — protect this week's scope discipline actively, don't let "just one more small feature" in.
- No cloud/managed database means the backup/restore runbook (4.4) is the actual safety net if pilot goes wrong — do not treat it as optional paperwork.

### Definition of Done

- [ ] Full E2E lifecycle script passes with zero P0/P1 defects open.
- [ ] Week 1 security checklist re-verified clean.
- [ ] Backup/restore runbook rehearsed successfully against a real snapshot.
- [ ] Migration rollback rehearsal passes cleanly.
- [ ] UAT session completed with staff, feedback triaged (blocking vs. post-pilot backlog).
- [ ] Go/no-go decision made and documented, including the payment-method decision for pilot.
- [ ] Final PR(s) reviewed, merged to `main`, and the pilot branch/release tagged.

---

## Cross-cutting notes

- **No Docker, no cloud migration, no microservices** is assumed throughout — every task above operates within the existing modular-monolith ASP.NET Core deployment, existing Postgres instance, and existing hosting model. Nothing in this plan requires provisioning new infrastructure.
- **Migration ordering across the month**: Week 3 introduces the largest schema surface (delivery domain, possibly product presentational fields). Sequence Week 3's migrations to apply cleanly after Week 2's (contact/catering tables) with no interdependency — verify this explicitly during the Week 4 rollback rehearsal.
- **What's still out of scope after this 4-week plan**: a real payment gateway, real SMS OTP delivery, full coupon/discount modeling, reviews/ratings, and gallery/media management. These map to Phase 3+ of the broader [Platform Readiness Review](./PLATFORM_READINESS_REVIEW.md) and are intentionally not pulled into this stabilization sprint.
