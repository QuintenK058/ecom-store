# Design tokens

Source of truth: `assets/tokens.css`. Components use **role** tokens (`--bg`, `--text`, `--cta-bg`…)
so a re-theme only touches the role mapping.

## Color

| Token | Hex | Use | Contrast |
|---|---|---|---|
| Fir | `#1F3D34` | Primary CTA, header accents, links | on Oat 10.42 · White on Fir 11.83 |
| Fir 700 | `#163029` | Hover/pressed | — |
| Fir 100 | `#DCE5DD` | Info surfaces, selected states | Fir on it 9.18 |
| Persimmon | `#B5461F` | Accent: badges, "Most popular", sale price | on Oat 4.79 · White on it 5.44 |
| Persimmon 300 | `#E8835A` | Decorative only (stars, progress fill) | Ink on it 6.41 |
| Oat | `#F5F0E7` | Page background | — |
| Linen | `#EBE4D7` | Section / card background | Ink on it 13.61 |
| Ink | `#1C1B19` | Body text | on Oat 15.16 |
| Graphite | `#57534B` | Secondary text | on Oat 6.74 · on Linen 6.05 |
| Stone | `#8C8475` | Borders, input outlines (non-text) | 3.26 (meets 3:1 non-text) |
| Hairline | `#DDD5C6` | Dividers | decorative |
| Success | `#2F6B3F` | In stock, free shipping unlocked | on Oat 5.61 |
| Error | `#B0302A` | Form errors, sold out | on Oat 5.60 |

All text pairings ≥ 4.5:1 (AA). Rule: Persimmon is never a background bigger than a badge;
never more than one accent element per viewport.

## Typography

- **Display:** Newsreader (variable, opsz 6–72, weights 400–500, plus italic for one-word emphasis).
- **Body/UI:** Hanken Grotesk (400 / 500 / 600).
- Both OFL, self-hosted woff2 subsets (Latin), `font-display: swap`, preload the 2 critical files
  only (Newsreader 400 roman, Hanken 400).

| Step | Size (375 → 1440) | Font | Leading | Tracking |
|---|---|---|---|---|
| 3xl (hero h1) | 42 → 76 | Display 400 | 1.05 | -0.02em |
| 2xl (h2) | 34 → 56 | Display 400 | 1.05 | -0.02em |
| xl (h3) | 28 → 40 | Display 400 | 1.2 | -0.01em |
| lg (h4/card) | 22 → 28 | Display 500 | 1.2 | 0 |
| md (lead) | 18 → 20 | Body 400 | 1.55 | 0 |
| base | 16 | Body 400 | 1.55 | 0 |
| sm | 14 | Body 400/500 | 1.5 | 0 |
| xs / eyebrow | 12 | Body 600 caps | 1.4 | 0.08em |

Buttons: Body 600, 16px, sentence case. Prices: Body 500, tabular numerals.

## Spacing
4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
Section padding fluid 48 → 96. Gutter 16 (mobile) → 40. Container 1280, text column 720.

## Radius
4 (inputs, chips) · 8 (cards, images) · 16 (drawers, modals) · pill (buttons, badges, swatches).

## Shadow
Warm and low. `sm` for sticky bars, `md` for popovers, `lg` for drawers only. Cards are flat
(border or Linen fill), never shadowed.

## Motion
150ms hovers, 200ms accordions/fades, 250ms drawers. `ease-out` for entering, `ease-in-out` for
moving. No parallax, no scroll-jacking, no autoplay carousels (announcement bar rotates at 5s,
pauses on hover/focus, has a pause control). All durations collapse to 0 under
`prefers-reduced-motion`.

## Components (preview of rules)
- **Primary button:** Fir bg, white text, pill, min-height 52px (mobile ATC 56px), full-width on mobile.
- **Secondary:** transparent, 1.5px Ink border.
- **Focus:** 2px Oat gap + 2px Fir ring on every interactive element (`:focus-visible`).
- **Tap targets:** ≥ 44×44px.
