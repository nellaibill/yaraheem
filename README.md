# Yaraheem Catering Services

A production-quality proof of concept for **Yaraheem Catering Services** — a premium biryani restaurant and catering brand. This is a full food-ordering platform: customer app, mock authentication, cart & checkout, live order tracking, an admin dashboard, and a delivery partner portal — all running **entirely client-side**.

**No backend. No API. No database. No payment gateway.** Every piece of state (sessions, carts, orders, addresses, favorites, delivery status, restaurant settings) is persisted to the browser's `localStorage`, namespaced per logged-in mobile number so multiple accounts don't collide.

**Live demo:** https://nellaibill.github.io/yaraheem/

---

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 6** — build tooling, with vendor code-splitting for smaller/cacheable bundles
- **Tailwind CSS v4** — utility-first styling with CSS-variable theming
- **shadcn/ui** (New York style) — accessible component primitives built on Radix UI
- **React Router v7** — client-side routing, multiple auth-gated route trees
- **Framer Motion** — animation, with `prefers-reduced-motion` respected app-wide
- **Lucide Icons**
- **ESLint** + **Prettier** (with `prettier-plugin-tailwindcss`)
- **GitHub Actions** → **GitHub Pages** deployment

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173/yaraheem/` (the `/yaraheem/` base path matches the GitHub Pages deployment URL — see [Deployment](#deployment-github-pages)).

On first run you'll land on the **Splash** screen, which leads into a mock phone + OTP login (see [Mock Authentication](#mock-authentication) below).

### Production Build

```bash
npm run build
```

Type-checks with `tsc -b`, then builds an optimized bundle to `dist/`. This is the same command CI runs before every deploy.

### Preview the Production Build

```bash
npm run preview
```

Serves the `dist/` output locally so you can sanity-check the production build before pushing.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` / `npm run lint:fix` | Lint the codebase |
| `npm run format` / `npm run format:check` | Format with Prettier |
| `npm run deploy` | Manual build + publish to the `gh-pages` branch (fallback to the GitHub Actions flow) |

## Mock Authentication

There is no real SMS provider. The OTP is always **`1234`** — the login screen and OTP screen both say so.

Flow: **Splash → Welcome → Login (mobile number) → OTP → Success → Home**. Each mobile number gets its own independent session, cart, order history, addresses, and favorites (all namespaced under that number in `localStorage`). Logging out and back in with a different number gives you a completely separate account; logging back in with the same number restores where you left off.

Two other portals have their own, separate login:

- **Admin Dashboard** — `/admin`, reuses the customer session (no extra login step for this POC).
- **Delivery Partner Portal** — `/delivery/login`, a mobile-number login checked against a mock partner roster. Demo numbers are shown right on the login screen (e.g. `9123456701`).

Both are linked discreetly from the site footer.

## What's Included

**Customer app** — Home, Categories, Menu (with search/filter), Food Details, Search, Offers, Catering packages, Gallery, About, Contact, Reviews, Restaurant Info, Cart, Checkout (saved addresses, mock "use current location", coupon codes, Cash/UPI/Card selection), live animated Order Tracking, and a Profile hub (orders, addresses, favorites, settings, logout).

**Admin dashboard** (`/admin`) — sidebar-driven, desktop-first: today's revenue/orders, 7-day revenue chart, top-selling items, a cross-customer orders table with inline status updates, a customers table ranked by spend, delivery partner roster management, deeper reports (14-day trend, payment/status breakdowns), and restaurant settings. Seeds itself with realistic demo data on first visit so it's never empty.

**Delivery partner portal** (`/delivery`) — assigned/available/completed order tabs, call-customer (`tel:`) links, a mock map location dialog, and one-tap status progression (Picked Up → Out for Delivery → Delivered) that writes straight back to the customer's own order record.

**Print & reports** (`/print/kot/:id`, `/print/invoice/:id`) — branded, print-optimized Kitchen Order Tickets and tax invoices, triggered via `window.print()`.

## Project Structure

```
src/
  app/
    providers/          # ThemeProvider (dark mode)
    router/              # Route tree (customer / admin / delivery / auth, each behind its own guard)
  components/
    ui/                  # shadcn/ui primitives (button, card, dialog, sheet, select, tabs, ...)
    layout/              # Header, Footer, Layout, AdminLayout, DeliveryLayout, AuthLayout
    common/              # Shared building blocks (SectionHeading, DishVisual, EmptyState, ...)
  features/
    auth/                # Mock OTP auth: context, guard, hook
    cart/                # Per-mobile-number cart context + drawer
    checkout/             # Addresses, orders, coupon application
    tracking/             # Animated order-status timeline
    favorites/            # Per-mobile-number favorites
    admin/                # Cross-customer data aggregation, analytics, dashboard components
    delivery/             # Delivery partner auth, roster, order assignment
    print/                # Shared branded print header
    menu/ catering/ gallery/ testimonials/ contact/ offers/   # Content + feature-specific components
  hooks/                 # useLocalStorage, useScopedStorage (per-mobile-number), useTheme, useDocumentTitle
  lib/                   # utils (cn, formatCurrency, getMockRating), constants, storage wrapper
  pages/                 # Route-level pages (admin/, auth/, delivery/, print/ subfolders)
  styles/                # Tailwind entry + design tokens (globals.css)
  types/                 # Shared TypeScript types
docs/
  DESIGN_SYSTEM.md        # Written design system spec (also viewable live at /style-guide)
```

## Theming

Brand tokens (maroon, saffron gold, warm cream) are defined as CSS variables in [`src/styles/globals.css`](src/styles/globals.css) and mapped into Tailwind via `@theme inline`, with full light/dark support toggled through `ThemeProvider`. Headings use **Playfair Display**; body text uses **Poppins** (loaded via Google Fonts in `index.html`). See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for the full spec, or visit `/style-guide` in the running app for a live, interactive reference.

## Data Model (localStorage)

No key ever stores real credentials, payment details, or PII beyond what the user types into a mock form. Everything is namespaced by feature and, where relevant, by mobile number:

| Key pattern | Contents |
| --- | --- |
| `yaraheem:auth:users` / `:active-mobile` | Registered mock accounts + the current session |
| `yaraheem:cart:<mobile>` | That user's cart |
| `yaraheem:orders:<mobile>` | That user's order history (also what admin/delivery read across all users) |
| `yaraheem:addresses:<mobile>` / `yaraheem:favorites:<mobile>` | Saved addresses / favorited dishes |
| `yaraheem:delivery-partners` | Shared delivery partner roster + live status |
| `yaraheem:admin:settings` | Restaurant operational settings |
| `yaraheem:theme` | Light/dark preference |

## Deployment (GitHub Pages)

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which installs with `npm ci`, lints, type-checks + builds, and publishes `dist/` via `actions/deploy-pages`.

**One-time repository setup:** Settings → Pages → Source → **GitHub Actions**. (Already configured for this repo.)

The Vite `base` and React Router `basename` are both set to `/yaraheem/` (see [`vite.config.ts`](vite.config.ts)) to match the GitHub Pages project URL `https://<user>.github.io/yaraheem/`. **If you fork or rename the repository, update `base` in `vite.config.ts` to match the new repo name.**

To deploy manually instead of via CI:

```bash
npm run deploy
```

This builds and pushes `dist/` straight to the `gh-pages` branch using the `gh-pages` npm package.

## Notes for Reviewers

- **This is a POC.** Payment methods, GST/invoice numbers, delivery partner locations, and the "map" are all mocked — clearly labeled as such in the UI.
- **Demo data**: the admin dashboard seeds ~10 mock customers with two weeks of order history on first load, so charts and tables aren't empty. Your own real interactions (as the logged-in customer) show up alongside the seed data.
- Refreshing `localStorage` (clearing site data) resets the app to a first-time-visitor state.
