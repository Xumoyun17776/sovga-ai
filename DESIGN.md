# Sovg'a — Design rules

Read this before touching any UI. Every rule here is a constraint, not a suggestion.
If a screen needs something this file doesn't allow, change this file first, then the screen.

---

## 0. What the audit found (October 2026)

| Area | Current state | Problem |
|---|---|---|
| Stack | React 18 + Vite 5 + Tailwind 3.4 + wouter + TanStack Query + zustand | fine |
| `client/src/index.css` | 1,677 lines, **seven stacked style layers** (v1 "glass", "Horology", "Aerospace/Cyber", "Billion-dollar", v6 "Maison", v7 "Plain") overriding each other with `!important` | Nobody can predict what a class looks like. This is the main reason the site reads as generated. |
| `tailwind.config.ts` | `amber`, `indigo`, `violet`, `purple`, `fuchsia`, `gold`, `brand` all remapped to the same red | Class names lie about colour. |
| Fonts | Onest only (display, body and "lux" all point to it) | No contrast between headings and text. |
| Icons | `client/src/lib/icons.tsx` (Phosphor paths, Lucide-style names). `lucide-react` is installed but unused. | OK, keep `lib/icons`. |
| UI primitives | **shadcn/ui is not installed** (no `components.json`, no Radix, no `cn()` helper). Buttons and dialogs are hand-rolled per page. | Same button exists in ~10 shapes. |
| Unused code | `framer-motion`, `lucide-react`, `react-router-dom` are never imported; `components/Gift3D.tsx` + `components/three/giftScene.ts` are no longer rendered (`three` / `@react-three` are still used by `pages/MysteryBoxPage.tsx`) | Dead weight. |
| Layout tropes in use now | 4 equal rounded cards for tools, 4 boxed stat tiles, centered section titles (wizard, occasions, FAQ), thin-grey-border card on almost everything, emoji in the admin table (⭐ 💍 📦) | All on the forbidden list below. |

---

## Direction

A modern consumer product site — the way good startups (Linear, Revolut, Uzum's own app) look, not a magazine.
White page, navy type, one cobalt blue. Real photos and real product images do the decorating; rounded cards and
soft shadows give depth. It should feel built by a product team, not generated: specific copy, real data, no filler.

## 1. Fonts

| Role | Family | Weights we load | Why |
|---|---|---|---|
| **Display** (h1, h2, big numbers, prices, card titles) | **Manrope** | 600, 700, 800 | Geometric grotesk with character; tight tracking (-0.03em) at 800 for headlines. Has Cyrillic. |
| **Body** (paragraphs, UI, buttons, forms) | **Golos Text** | 400, 500, 600 | Very readable, made for Cyrillic + Latin. |
| **Mono** (rare: codes, receipts) | **JetBrains Mono** | 400, 500 | Only where text is literally a code. Not for labels. |

Loaded once from Google Fonts in `client/index.html`. Tailwind: `font-display`/`font-lux`, `font-sans`, `font-mono`.

**Never use:** Inter, Roboto, Open Sans, Arial, Helvetica, system-ui as a visible font, Poppins, Montserrat,
any thin "luxury" serif, any italic gradient headline. (`system-ui` may appear only as the last fallback.)

---

## 2. Colour

```css
:root {
  --anor:        #1F4CA8;   /* DOMINANT — cobalt blue: primary buttons, links, featured plan, CTA band (old name kept) */
  --anor-deep:   #183D88;   /* hover / pressed */
  --accent-soft: #EAF0FB;   /* icon tiles, soft hovers */
  --saffron-soft:#E4ECFB;   /* pale-blue highlight */
  --paper:       #FFFFFF;   /* page */
  --paper-2:     #F3F6FB;   /* alternating section bands, image wells */
  --ink:         #0E1A36;   /* navy text, footer, the dark feature card */
  --ink-2:       #4A5672;   /* secondary text */
  --rule-soft:   #DCE3EF;   /* card borders, dividers */
  --ok:          #1F7A4D;   /* savings / discount badges, "live" dot — functional only */
}
```

- Text on blue or navy is white; on white or pale blue it is navy.
- **Banned:** purple/indigo, rainbow or purple-to-blue gradients, gradient text, neon, glow, glassmorphism.
  Allowed: a near-white vertical wash behind the hero and a dark-to-transparent scrim over photos so text is readable.

### Night mode

`html.dark` swaps the same tokens (page `#0A1020`, cards `#131D36`, text `#E9EEF8`, blue `#4A7BE6`); the toggle is the moon/sun
button in the navbar (`lib/theme.ts`, saved as `sovga_theme`, applied in `index.html` before first paint). Light stays the default.
Write colours as tokens (`var(--white)`, `var(--paper-2)`, `var(--ok-soft)`…) so they follow the theme. Exceptions that must not
flip: white buttons on blue/navy use `bg-[#fff]`; store product photos sit on `var(--img-well)` (stays light).

---

## 3. Spacing — 8px rhythm (4px allowed inside components)

- Sections: 96px desktop / 64px mobile (`.section`). Alternate white and `--paper-2` bands (`.band`).
- Gutter 24 / 48 / 64px, max width 1280px (`.wrap`).
- Card padding 24–32px desktop, 16–24px mobile. Grid gaps 12px mobile, 20px desktop.

---

## 4. Type scale

| Use | Size (desktop / mobile) | Font / weight |
|---|---|---|
| Hero h1 (`.hero-lux`) | 76px / 40px, lh 1.04 | Manrope 800 |
| Section h2 (`SectionHeader`) | 40px / 32px, lh 1.1 | Manrope 800 |
| Card title | 20–24px | Manrope 800 |
| Kicker above h2 | 14px | Golos 600, blue — one short phrase, sentence case |
| Body | 16–18px, lh 1.6 | Golos 400 |
| Small / meta | 13px | Golos 500–600 |

---

## 5. Structure & layout

**Do:**
- Left-aligned hero, split 6/6: headline + search + popular pills on the left, the live price card (rounded 24px,
  big soft shadow) on the right on a blue dotted panel.
- Stats as small white cards under the hero; a strip of store names under that.
- Products as **product cards**: image well on `--paper-2`, green `−X%` badge, store in blue, name, price, strikethrough.
- Occasions as **photo cards** in a bento grid (one big, five small) with a navy scrim and white title.
- Pricing as three cards, the middle one (Plus) filled blue with "Most popular".
- One dark navy feature card with a photo per page at most; one blue CTA band before the footer.
- Corners: inputs/buttons 12px, cards 16px, big panels 24–28px, pills 999px.
- Shadows: navy-tinted and soft (`0 12px 32px -12px rgba(14,26,54,.18)`) on hover and on the one hero card.
- Hover: border darkens + lift 2px on cards; images zoom 4%.

**Forbidden:**
- Text-only tile grids where a photo or product image could show the thing.
- Centered-everything heroes. Fake testimonials, fake user counts, fake logos.
- Emoji as icons, 3D icons, blob illustrations, AI-rendered images.
- More than one blue-filled surface per screen (besides buttons).

---

## 6. Imagery

- Product images come from the stores (in the live data); shown `object-contain` on `--paper-2`.
- Occasion and editorial photos: Unsplash, natural light, people and real objects (IDs are in `HomePage.tsx`).
  Always `loading="lazy"`, `object-cover`, a scrim if text sits on top.
- Icons: `client/src/lib/icons.tsx` only, inside a 44px `.tile` (pale blue, blue icon).

---

## 7. Components — reuse, don't hand-roll

### shadcn/ui
Not installed today. When we add it, it goes in `client/src/components/ui/` and is restyled with the tokens above
(radius 2px, no shadows). Primitives to add and use everywhere instead of the hand-written versions:

| Primitive | Replaces |
|---|---|
| `components/ui/button.tsx` (variants: `primary` = anor, `secondary` = ink outline, `link`) | `btn-luxury-gold`, `btn-ghost`, `btn-hyper`, `btn-gold`, ad-hoc button classes |
| `components/ui/input.tsx` | per-page input styles |
| `components/ui/dialog.tsx` / `sheet.tsx` | each modal's own overlay + box |
| `components/ui/dropdown-menu.tsx` | Navbar "Barcha bo'limlar" menu, profile menu |
| `components/ui/tabs.tsx` | store tabs in `LivePriceCard`, catalog filters |
| `components/ui/accordion.tsx` | `FaqSection` |
| `components/ui/badge.tsx` | discount / status pills |
| `lib/utils.ts` → `cn()` | string-concatenated classNames |

Needs: `@radix-ui/react-*`, `class-variance-authority`, `tailwind-merge`, `clsx`. **Waiting for your OK before installing.**

### Components already in the repo (keep and restyle; import paths from `client/src`)

| Component | Import | Notes |
|---|---|---|
| Page shell | `components/Layout` | Navbar + Footer + global modals |
| Navbar | `components/Navbar` | Reads `MAIN_LINKS` / `TOOL_GROUPS` |
| Footer | `components/Footer` | Reads `TOOL_GROUPS` |
| Logo | `components/BrandMark` | |
| Section heading | `components/SectionHeader`, `sectionActionCls` | Will become the "01 — Title" ruled header |
| Search | `components/SearchBar` | `large` prop for the hero |
| Product card | `components/ProductCard` | Catalog / results |
| Live price comparison | `components/LivePriceProof` → `LivePriceCard`, `LiveProofStats`, `useLivePriceBoard`, `useCheckedAgo` | Hero right column |
| Tool directory | `components/HeroFeatureLaunchpad`, `components/AllServicesModal` | Data from `lib/tools` |
| Plans block | `components/HolographicPrivilegeCard` | Data from `@shared/plans` |
| Limit prompt | `components/UpgradeModal` | Opens on `plan-limit` event |
| Toasts | `components/Toast` → `useToast()` | |
| Price modals | `components/PriceComparisonModal`, `components/ProductQuickViewModal` | |
| Gift picker | `components/GiftMatcherWizard` | |
| FAQ | `components/FaqSection` | |

### Data/helpers to use instead of re-declaring
- `lib/tools.ts` — `TOOL_GROUPS`, `MAIN_LINKS`, `pick()` (every page link and its uz/ru/en label)
- `lib/i18n` — `useTranslation()`
- `lib/api` — `formatPrice()`, typed API calls
- `lib/icons` — all icons
- `@shared/plans` — `PLANS`, `PAID_PLANS`

---

## 8. Clean-up that comes with the redesign

1. Replace the seven layers in `index.css` with one file: tokens (section 2), base type (section 4), and a few
   component classes. Target: under 300 lines, zero `!important`.
2. Remove the colour remaps from `tailwind.config.ts`; add `anor`, `saffron`, `paper`, `ink` and the three font families.
3. Remove unused dependencies `framer-motion`, `lucide-react`, `react-router-dom`, and the unused
   `components/Gift3D.tsx` + `components/three/giftScene.ts`. (Keep `three` / `@react-three` while `MysteryBoxPage` uses them.)
4. Remove the emoji from `pages/AdminPage.tsx`.
