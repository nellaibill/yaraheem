# Pilot Go/No-Go — Ya Raheem

**Date:** 2026-08-12
**Basis:** Weeks 1–4 of the [Stabilization Roadmap](./STABILIZATION_ROADMAP.md)

## Decision: GO, cash-on-delivery only

Real payment gateway integration was explicitly out of scope for this 4-week plan. `DummyPaymentService` simulates COD/ONLINE outcomes but takes no real money. **Pilot must launch COD-only** — disable the ONLINE option at checkout (or clearly label it "not yet live") until a real gateway is integrated; do not let a customer believe an online payment was actually charged.

## Checklist

- [x] Week 1 security checklist re-verified: secrets in user-secrets/env, CORS fails closed, rate limiting active, webhook signature enforced, no exception detail leaked, no credentials/OTP in the production bundle (re-audited Week 4 — see [RUNBOOK.md](../backend/RUNBOOK.md) and Week 4 commit).
- [x] Critical-path automated tests added (`backend/src/Ecommerce.Tests`): order status transitions, delivery assignment transitions, password hashing, auth/checkout validators — 43 tests, all passing.
- [x] Migration rollback rehearsed (Delivery module down/up) — see RUNBOOK.md rehearsal log.
- [ ] Full `pg_dump`/`pg_restore` round-trip — **not yet rehearsed against the real pilot host**, do before go-live.
- [x] Production build audited: no dev-only routes, credentials, or OTP values in the shipped bundle.
- [ ] UAT with actual kitchen/delivery staff — not run in this session; schedule before go-live.
- [ ] Concurrent-load smoke test — not run in this session; the EF Core status-history bug found earlier this sprint was only caught by real usage, so treat this as a real gap, not a formality.

## Known gaps carried past pilot (unchanged from the readiness review)

Real payment gateway, real SMS OTP, coupon/discount modeling, reviews/ratings, gallery/media management.
