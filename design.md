# Design — qdjr.me

A locked design system for this app. Every page redesign reads this file before
emitting code. Extend or amend this file when the system needs to grow.

## Genre
Three named variants selected at runtime by `html[data-vibe]` (store: `app/stores/theme.ts`):
- `terminal` — atmospheric / terminal cluster
- `cartoon` — playful (vintage diorama register)
- `galaxy` — atmospheric

Light/dark is **not** a user preference: it follows the clock in UTC+7
(`app/utils/vnTime.ts`, night = 18:00–06:00). Every variant ships both modes.

## Macrostructure family
- `/` (profile): **Marquee Hero** — the name is the statement; the three.js canvas is the fold background.
- `/about`: **Narrative Workflow** — 17 numbered stops (`00`–`16`: hello · skills · four career stages · one per project · contact), opaque paper panels over the canvas, N3 side rail ≥ 60 rem.
- Blog / content pages: unchanged layout, retinted by tokens only. Typography only, no enrichment.

## Theme
Tokens live in `app/assets/css/tokens.css`. Per vibe (light / dark):

| | terminal | cartoon | galaxy |
| --- | --- | --- | --- |
| paper | oklch(96% 0.012 150deg) / oklch(13% 0.012 150deg) | oklch(96% 0.03 85deg) / oklch(24% 0.03 50deg) | oklch(95% 0.015 260deg) / oklch(12% 0.03 280deg) |
| ink | oklch(22% 0.03 150deg) / oklch(90% 0.05 150deg) | oklch(28% 0.04 50deg) / oklch(93% 0.025 85deg) | oklch(20% 0.04 280deg) / oklch(94% 0.012 280deg) |
| accent | oklch(50% 0.17 150deg) / oklch(80% 0.2 150deg) | oklch(52% 0.16 40deg) / oklch(72% 0.14 45deg) | oklch(50% 0.15 65deg) / oklch(82% 0.14 80deg) |

Accent ≤ 3 % of any viewport: stage numbers, link underlines, focus rings, the prompt glyph.
Tailwind `gray-*` / `blue-*` utilities are remapped to the vibe ramps in `main.css` (`@theme inline`).

## Typography (2+1)
- terminal: JetBrains Mono 400/700 for everything (single-font by design).
- cartoon: display Fraunces 700 (SOFT 100, WONK 1) · body Bricolage Grotesque 400/600.
- galaxy: display Chakra Petch 600 (Tomorrow has no Vietnamese subset) · body Geist 400/600 · outlier Geist Mono (stage numbers, clock).
- Headings are always roman. Display: `clamp(2.75rem, 5vw + 1rem, 5.25rem)`, tracking −0.03em.

## Spacing
4-pt named scale `--space-3xs … --space-3xl` in `tokens.css`. Pages use tokens, never raw values.

## Motion
- Easings `--ease-out`, `--ease-in`, `--ease-in-out`; durations 120 / 220 / 420 ms.
- DOM: one page-load reveal (`.reveal`), hover underline, terminal caret. No parallax, no scroll-scrubbed DOM.
- Scene: continuous rAF; camera eases to the active stop (`approach`, speed 3). Pointer sway ≤ 1.2 units.
- `prefers-reduced-motion: reduce`: the scene renders one frame per state change; reveals are a 150 ms fade; anchor jumps are instant.

## Microinteractions stance
Silent success. Hover delay 0 (no tooltips). Focus ring 2 px `--color-focus`, offset 2 px, never animated. Hit targets ≥ 44 px.

## CTA voice
Typographic links only (`.link`: word + arrow + 1 px underline, thickens on hover). No filled buttons on the profile pages.

## Per-page allowances
- `/` and `/about` MAY render the three.js enrichment (Tier A, primitives only, no GLTF/textures/Lottie).
- Blog pages MUST NOT load three.js (`SCENE_ROUTES` in `app/layouts/default.vue`).

## What pages MUST share
Header shell, Ft2 footer, the tokens, the fonts of the active vibe, the `.link` voice, the stage-number pattern on `/about`.

## What pages MAY differ on
Macrostructure within the family above; the scene's camera path per vibe.

## Class naming
Kebab-case only (`stop-panel`, `rail-dot`); the repo's stylelint rejects BEM `__` / `--` separators.

## Scene palette (hex, three.js side)
See `PALETTE` constants in `app/scenes/{terminal,cartoon,galaxy}.ts`; they mirror the paper/accent hues above.

## Exports
### tokens.css
`app/assets/css/tokens.css` is the canonical export.
### Tailwind v4 `@theme`
See the `@theme inline` block in `app/assets/css/main.css`.
