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

Accent ≤ 3 % of any viewport: the active rail dot, skill-level dots, link underlines, focus rings, the prompt glyph.
Tailwind `gray-*` / `blue-*` utilities are remapped to the vibe ramps in `main.css` (`@theme inline`).

## Typography (2+1)
- terminal: JetBrains Mono 400/700 for everything (single-font by design).
- cartoon: display Fraunces 700 (SOFT 100, WONK 1) · body Bricolage Grotesque 400/600.
- galaxy: display Chakra Petch 600 (Tomorrow has no Vietnamese subset) · body Geist 400/600 · outlier Geist Mono (rail labels, clock).
- Headings are always roman. Display: `clamp(2.75rem, 5vw + 1rem, 5.25rem)`, tracking −0.03em.

## Surfaces
- Journey panels on `/about` are frosted glass: `color-mix(in oklch, var(--color-paper) 90%, transparent)` + `backdrop-filter: blur(14px) saturate(1.2)`; solid paper without backdrop-filter support or under `prefers-reduced-transparency`. Contrast is checked against the worst case (panel over pure white and pure black). Glass is allowed nowhere else.
- Small accent-coloured text does not survive glass at AA: on panels the accent is carried by a dot or rule beside ink text.

## Spacing
4-pt named scale `--space-3xs … --space-3xl` in `tokens.css`. Pages use tokens, never raw values.

## Motion
- Easings `--ease-out`, `--ease-in`, `--ease-in-out`; durations 120 / 220 / 420 ms.
- DOM: one page-load reveal (`.reveal`), hover underline, terminal caret. No parallax, no scroll-scrubbed DOM.
- Scene: continuous rAF; camera eases to the active stop (`approach`, speed 3). Pointer sway ≤ 1.2 units.
- Cartoon: a train loops the diorama island on `/`; on `/about` it runs to the centred stop's station (braking curve, shortest way round the loop) with a chase camera that frames the station beside the text panel (above it on phones). Reduced motion parks it instantly.
- Cartoon is Ghibli-painterly: painted sky dome (the island floats in open sky), instanced cumulus clouds, wind sway on tree crowns and meadow grass, petals by day and fireflies at night. All of it freezes under reduced motion.
- Galaxy: each `/about` section is a body of the solar system (the Sun for Hello, then planets); the camera glides to it and rides along its orbit. Projects is Earth with ten orbiters (moon, satellites, a station, meteors, probes); picking one zooms onto it and a shooting star passes it. Ambient shooting stars every few seconds. Bodies are painted procedurally in a storybook style (shaders, no image files): Earth with oceans, continents, ice caps, clouds and atmosphere; banded Jupiter with its red spot; ringed lavender Saturn; red Mars; swirled Venus; cratered Mercury; blue Neptune; a churning sun with a soft corona; cyan orbits. Earth's orbiters are illustrated spacecraft (gridded solar panels, gold foil, dishes) plus a cratered moon and an ember-tailed meteor.
- Terminal: the `/about` journey is a system-design map floating over the flowing grid — client (Hello), api-gateway (Skills), one service per career stage, the k8s cluster whose pods are the projects, the contact queue. Request packets flow along the wires and burst along the wire just travelled; the camera glides node to node; picking a project zooms onto its pod. Labels are technical names, identical in both languages.
- Projects: one `/about` stop with a grouped picker (employer → project). Switching cross-fades the detail (opacity + 6 px, `--dur-short`); the rail shows a small sub-dot per project; the cartoon chase camera slides to the picked billboard in the project yard.
- `prefers-reduced-motion: reduce`: the scene renders one frame per state change; reveals are a 150 ms fade; anchor jumps are instant.

## Microinteractions stance
Silent success. Hover delay 0 (no tooltips, except the name of a hovered 3D scene object). Focus ring 2 px `--color-focus`, offset 2 px, never animated. Hit targets ≥ 44 px.
Scene objects are clickable shortcuts (pointer only; the rail and the project picker remain the accessible controls): a section's object goes to its section, a project's object picks it, and each vibe has an easter egg (cartoon: train whistle, windmill; galaxy: comet shower; terminal: a cron job that floods the map with requests). Hovering shows the name in a small mono tooltip. Page UI always wins a click over the scene behind it.

## CTA voice
Typographic links only (`.link`: word + arrow + 1 px underline, thickens on hover). No filled buttons on the profile pages.

## Per-page allowances
- `/` and `/about` MAY render the three.js enrichment (Tier A, primitives only, no GLTF/textures/Lottie).
- Blog pages MUST NOT load three.js (`SCENE_ROUTES` in `app/layouts/default.vue`).

## What pages MUST share
Header shell, Ft2 footer, the tokens, the fonts of the active vibe, the `.link` voice, the rail of section names on `/about` (no stage numbers).

## What pages MAY differ on
Macrostructure within the family above; the scene's camera path per vibe.

## Class naming
Kebab-case only (`stop-panel`, `rail-dot`); the repo's stylelint rejects BEM `__` / `--` separators.

## Scene palette (hex, three.js side)
See `PALETTE` constants in `app/scenes/{terminal,cartoon,galaxy}.ts`; they mirror the paper/accent hues above.

## Languages
- Vietnamese default, English under `/en` (`@nuxtjs/i18n`, `prefix_except_default`).
- Every UI string goes through `t()`; profile copy through `useProfile()`.
- Machine-translated posts always show `TranslationNotice` (above the article) and
  `TranslationBadge` (in lists); text shown in a different language than the page
  carries its own `lang` attribute.
- Vibe names stay untranslated; tags and categories are slugs.

## Exports
### tokens.css
`app/assets/css/tokens.css` is the canonical export.
### Tailwind v4 `@theme`
See the `@theme inline` block in `app/assets/css/main.css`.
