# Witech Design Guidelines

## Stance
Swiss precision + Kinetic dark UI — minimal, data-dense, motion-forward. Inspired by Vercel, Linear, Apple, and Stripe. Every element earns its place; nothing decorative without purpose.

## Typography
- **Sans**: Inter (Google Fonts) — all weights from 300–900. Used for headings, body, UI labels.
- **Mono**: JetBrains Mono — 400/500/700. Used for section labels, badges, code, metadata.
- Display headings: `font-black` (900), `tracking-tight`, `leading-[0.92–0.95]`
- Body: `text-sm` or `text-base`, `leading-relaxed` (1.625)

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#080808` | Page background |
| `--color-foreground` | `#f0f0f0` | Primary text |
| `--color-card` | `#111111` | Card / panel backgrounds |
| `--color-secondary` | `#161616` | Input backgrounds, hover states |
| `--color-muted-foreground` | `#737373` | Captions, labels |
| `--color-accent` | `#6366f1` | Indigo — primary interactive, highlights |
| `--color-border` | `#1e1e1e` | Hairline borders |

## Spacing
4px base scale: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`. All spacing via Tailwind scale.

## Border Radius
- `--radius-sm: 6px` — badges, inputs
- `--radius-md: 10px` — cards
- `--radius-lg: 16px` — modals, hero containers
- `--radius-xl: 24px` — large feature blocks

## Component Patterns
- **Card**: `bg-card border border-border rounded-xl p-5–6 hover:border-accent/30 transition-all`
- **Button primary**: `bg-foreground text-background rounded-lg px-6 py-3 font-semibold hover:opacity-90`
- **Button accent**: `bg-accent text-white rounded-lg hover:bg-accent/90`
- **Button ghost**: `border border-border hover:border-accent/40`
- **Badge**: `font-mono text-xs px-2.5 py-1 rounded border`
- **Section label**: `text-xs font-mono text-accent uppercase tracking-widest`

## Grid
- Max-width container: `max-w-7xl mx-auto px-6`
- Desktop: 12-col grid. Default section uses `grid-cols-3` or `grid-cols-4`.
- Mobile: single column, collapses at `sm` (640px)

## Background Treatments
- Hero grid: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)` at `64px` size
- Radial glow: `radial-gradient(ellipse, rgba(99,102,241,0.10–0.15), transparent)`
- Feature panels: `radial-gradient at 50% 0%` over `#111111`

## Motion
- Transition duration: `150–200ms`
- Easing: `ease-out` enter, `ease-in` exit
- Image hover scale: `group-hover:scale-105 duration-500`
- `prefers-reduced-motion`: disable all non-essential transitions
