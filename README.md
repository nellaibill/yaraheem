# Yaraheem Catering Services

Production-quality proof of concept for **Yaraheem Catering Services** — a premium biryani restaurant and catering brand. Fully client-side: no backend, no API, no database. All user data (cart, catering inquiries, contact messages, theme) is persisted to `localStorage`.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** — build tooling
- **Tailwind CSS v4** — utility-first styling with CSS-variable theming
- **shadcn/ui** (New York style) — accessible component primitives built on Radix UI
- **React Router v7** — client-side routing
- **Framer Motion** — animation
- **Lucide Icons**
- **ESLint** + **Prettier** (with `prettier-plugin-tailwindcss`)
- **GitHub Actions** → **GitHub Pages** deployment

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` / `npm run lint:fix` | Lint the codebase |
| `npm run format` / `npm run format:check` | Format with Prettier |
| `npm run deploy` | Manual build + publish to the `gh-pages` branch |

## Project Structure

```
src/
  app/                 # App shell: providers (theme), router config
  components/
    ui/                # shadcn/ui primitives (button, card, dialog, sheet, ...)
    layout/             # Header, Footer, Layout, Logo, ThemeToggle
    common/             # Shared building blocks (SectionHeading, DishVisual, ...)
  features/
    menu/                # Menu data, card + filter components
    catering/            # Catering packages, inquiry dialog
    cart/                # localStorage-backed cart context + drawer
    gallery/             # Gallery data + grid
    testimonials/        # Testimonials data + card
    contact/              # Contact form (localStorage)
  hooks/                # useLocalStorage, useTheme
  lib/                  # utils (cn, formatCurrency), constants, storage wrapper
  pages/                # Route-level page components
  styles/                # Tailwind entry + design tokens (globals.css)
  types/                 # Shared TypeScript types
```

## Theming

Brand tokens (maroon, saffron gold, warm cream) are defined as CSS variables in [`src/styles/globals.css`](src/styles/globals.css) and mapped into Tailwind via `@theme inline`, with full light/dark support toggled through `ThemeProvider`. Headings use **Playfair Display**; body text uses **Poppins** (loaded via Google Fonts in `index.html`).

## Deployment (GitHub Pages)

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which lints, builds, and publishes `dist/` to GitHub Pages via `actions/deploy-pages`.

One-time setup in the repository: **Settings → Pages → Source → GitHub Actions**.

The Vite `base` and React Router `basename` are both set to `/yaraheem/` (see [`vite.config.ts`](vite.config.ts)) to match the GitHub Pages project URL `https://<user>.github.io/yaraheem/`. Update this if the repository is renamed.
