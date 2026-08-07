# Yaraheem Design System

A warm, premium design language for Yaraheem Catering Services — inspired by the restraint and clarity of Apple, the density and speed of Swiggy/Zomato, and the dark, luxurious food photography style of Behrouz Biryani.

Live, interactive reference: run the app and visit **`/style-guide`**.

---

## 1. Typography

Two-family system: an editorial serif for headings, a clean grotesque for everything functional.

| Role | Font | Tailwind class |
| --- | --- | --- |
| Display / headings | Playfair Display (500–800, italic 600) | `font-display` |
| Body / UI | Poppins (300–700) | `font-sans` (default) |

Type scale (Tailwind defaults, used consistently):

| Token | Size | Usage |
| --- | --- | --- |
| `text-xs` | 12px | Eyebrows, meta, badges |
| `text-sm` | 14px | Body copy, form labels |
| `text-base` | 16px | Default body |
| `text-lg` | 18px | Card titles |
| `text-xl` – `text-2xl` | 20–24px | Section sub-heads |
| `text-3xl` – `text-4xl` | 30–36px | Page/section titles |
| `text-5xl` – `text-6xl` | 48–60px | Hero headlines |

Rules: headings always use `font-display` with `font-semibold`/`font-bold`; body copy never uses the display font. Long headline wraps use `text-balance`.

## 2. Spacing

Tailwind's default 4px base scale (`1` = 4px) is used everywhere — no custom spacing tokens. Section vertical rhythm is standardized:

- Page section padding: `py-16` (mobile) → `py-20`/`py-24` (desktop) via `sm:`/`lg:` prefixes
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Card internal padding: `p-5`/`p-6`
- Stack gaps: `gap-2` (tight/inline), `gap-4` (form fields), `gap-6`–`gap-8` (grid items), `gap-10`–`gap-14` (section blocks)

## 3. Color Palette

Defined as OKLCH CSS variables in [`src/styles/globals.css`](../src/styles/globals.css), mapped to Tailwind via `@theme inline`. Full light/dark pairs.

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `background` / `foreground` | Page base | warm cream / near-black maroon | deep maroon-black / warm white |
| `primary` | Brand maroon | deep maroon | warm gold (inverted for contrast) |
| `secondary` | Soft brand tint | pale gold-cream | muted maroon |
| `accent` / `gold` | Saffron accent | warm gold | warm gold |
| `muted` | Low-emphasis surface | warm beige | deep neutral |
| `destructive` | Errors/danger | red | red (brighter) |
| `border` / `input` / `ring` | Structural | warm gray | warm gray-dark |

Semantic-only usage: components reference `bg-primary`, `text-muted-foreground`, etc. — never raw hex values — so the palette can be swapped in one file.

## 4. Border Radius

| Token | Value | Usage |
| --- | --- | --- |
| `rounded-sm` | radius − 4px | Checkboxes, small chips |
| `rounded-md` | radius − 2px | Inputs, buttons |
| `rounded-lg` | radius (12px) | Cards, dialogs |
| `rounded-xl` | radius + 4px | Large media panels |
| `rounded-2xl` | radius + 12px | Hero banners, feature panels |
| `rounded-full` | — | Avatars, pills, badges, FAB |

## 5. Shadow System

A warm-tinted shadow scale (maroon undertone instead of neutral gray) — see `--shadow-*` tokens in `globals.css`. Standard Tailwind utilities (`shadow-xs` … `shadow-xl`) automatically resolve to these.

Usage: `shadow-sm` for resting cards, `shadow-md` on hover, `shadow-lg`/`shadow-xl` for elevated overlays (dialogs, popovers, the mobile bottom sheet).

## 6. Animation Rules

Motion should feel deliberate, not bouncy. One easing family, three curves:

| Token | Curve | Use for |
| --- | --- | --- |
| `ease-brand` | `cubic-bezier(.22,1,.36,1)` | Default — entrances, hovers |
| `ease-brand-out` | `cubic-bezier(.16,1,.3,1)` | Fast-start, settle — modals, sheets |
| `ease-brand-in` | `cubic-bezier(.5,0,.75,0)` | Exits |

Duration guide: micro-interactions 150–200ms, component transitions 250–400ms, page/section reveals 400–600ms, decorative loops (marquee) seconds-scale.

Named keyframe utilities (`animate-fade-in`, `animate-fade-up`, `animate-scale-in`, `animate-shimmer`, `animate-pulse-ring`, `animate-marquee`) cover the recurring cases; bespoke sequences use Framer Motion directly with `viewport={{ once: true }}` for scroll reveals so animations never re-trigger and distract on scroll-back.

Respect `prefers-reduced-motion`: Framer Motion honors it automatically; custom CSS keyframe usage should stay subtle (opacity/translate only, no parallax) so reduced-motion users aren't jarred even without a manual media query per-component.

## 7. Component Variants

All primitives live in `src/components/ui/` (shadcn/ui, "new-york" style, Radix UI underneath) and are documented live at `/style-guide`:

- **Buttons** — `default`, `gold`, `secondary`, `outline`, `ghost`, `link`, `destructive` × `sm`/`default`/`lg`/`icon`
- **Cards** — header/title/description/content/footer slots, optional `shadow-md` hover lift
- **Inputs** — `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, all sharing focus-ring and error (`aria-invalid`) treatment
- **Badges** — `default`, `gold`, `secondary`, `outline`, `destructive`
- **Icons** — Lucide, stroke-width 1.5–2, sized via `size-*` utilities, never hard-coded pixel dimensions
- **Toasts** — `sonner`, themed to match light/dark tokens, top-center on mobile flows
- **Modals** — `Dialog` (centered, desktop-first content) and `Sheet` (edge-anchored, mobile nav/cart)
- **Loading Skeleton** — `Skeleton`, pulse animation, matches the shape of the content it replaces
- **Tooltip / Alert / Avatar / Progress** — supporting primitives for admin, profile, and tracking UIs

## 8. Dark Mode

Class-based (`.dark` on `<html>`), toggled via `ThemeProvider` (`src/app/providers/ThemeProvider.tsx`) and persisted to `localStorage`. Every token has a dark-mode value — components never branch on theme in JSX; they simply reference semantic tokens.

## 9. Responsive Rules

Mobile-first Tailwind breakpoints, used consistently:

| Breakpoint | Width | Primary use |
| --- | --- | --- |
| *(base)* | 0px | Phone |
| `sm:` | 640px | Large phone / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Small desktop — nav switches from Sheet to inline |
| `xl:` | 1280px | Desktop |

Customer-facing pages are mobile-first (single column → grid). The Admin Dashboard and Delivery Portal are desktop-first with a responsive collapse down to mobile, per their own prompts.
