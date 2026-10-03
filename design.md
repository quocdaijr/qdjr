# Design — qdjr.me

A locked design system for this app. Every page redesign reads this file before
emitting code. Extend or amend this file when the system needs to grow.

## Genre
Three named variants selected at runtime by `html[data-vibe]` (store: `app/stores/theme.ts`), in this order — **cartoon is the default** (the page shell carries `data-vibe="cartoon"`), the coding vibe last:
- `cartoon` — playful (vintage diorama register)
- `galaxy` — atmospheric
- `terminal` — atmospheric / terminal cluster (the coding vibe)

Light/dark is **not** a user preference: it follows the clock in UTC+7
(`app/utils/vnTime.ts`, night = 18:00–06:00). Every variant ships both modes.

## Macrostructure family
- `/` (profile): **Marquee Hero** — the name is the statement; the three.js canvas is the fold background.
- `/about`: **Narrative Workflow** — 17 numbered stops (`00`–`16`: hello · skills · four career stages · one per project · contact), opaque paper panels over the canvas, N3 side rail ≥ 60 rem.
- Blog / content pages and the `/trips` list: unchanged layout, retinted by tokens, read straight over the vibe scene behind the veil (§ Surfaces) — no panel, as on `/`.
- `/trips`: **Long Document** list — one row per trip with the real road drawn as a small accent SVG (hand-built from the data), title, summary, stops · distance · vehicles, a `.link`.
- `/trips` is not in the menu: it is reached by link only (still being tried out). It opens with the trip planner form (origin + stops picked from suggestions, vehicle; `TripPlanner.vue`), above the curated list.
- `/trips/plan`: the trip page's layout for a visitor's own trip (`TripView.vue`, shared with `/trips/[slug]`); while the road is found, the same glass panel with a seconds counter.
- `/trips/[slug]`: **Marquee Hero** — the trip scene is the statement; one glass panel (vehicle and view pickers as segmented radios, distance · estimated time, the motorbike detour note, itinerary on a vertical line — each place a button that drives the vehicle there — with the current place marked by an accent dot, a status line with "Drive on" while parked) left on wide screens, below a 42svh window onto the scene on phones.

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
- Journey panels on `/about` and the trip itinerary panel are frosted glass (opacity kept within 50–70 %, user call 2026-10-03): `color-mix(in oklch, var(--color-paper) 50%, transparent)` + `backdrop-filter: blur(18px) saturate(1.3)` — the scene shows through clearly; solid paper without backdrop-filter support or under `prefers-reduced-transparency`.
- Pages without panels of their own (blog, trips list, search, legacy, tags, categories) have no surface at all: a full-screen **veil** (`.scene-veil`, between canvas and content) lays 50 % of the body ground (gray-50 / gray-900, which the blog's text colours were tuned on) over the scene and blurs it 6 px; 85 % without blur support, solid under `prefers-reduced-transparency`.
- Contrast: the scene behind glass or veil is blurred and painted in the page's light/dark register, so text on it is measured over the page ground, as text drawn straight on `/` always was (`e2e/contrast.spec.ts`). Glass and the veil are allowed nowhere else.
- Small accent-coloured text does not survive glass at AA: on panels the accent is carried by a dot or rule beside ink text.

## Spacing
4-pt named scale `--space-3xs … --space-3xl` in `tokens.css`. Pages use tokens, never raw values.

## Motion
- Easings `--ease-out`, `--ease-in`, `--ease-in-out`; durations 120 / 220 / 420 ms.
- DOM: one page-load reveal (`.reveal`), hover underline, terminal caret. No parallax, no scroll-scrubbed DOM.
- Scene: continuous rAF; camera eases to the active stop (`approach`, speed 3). Pointer sway ≤ 1.2 units.
- Cartoon: a train loops the diorama island on `/`; on `/about` it runs to the centred stop's station (braking curve) in the reader's direction — forward to a later stop or on arrival from `/`, backwards to an earlier one, the long way round if need be (scrolling down never sends it backwards) with a chase camera that frames the station beside the text panel (above it on phones). Reduced motion parks it instantly.
- Cartoon is Ghibli-painterly: painted sky dome (the island floats in open sky), instanced cumulus clouds, wind sway on tree crowns and meadow grass, petals by day and fireflies at night. All of it freezes under reduced motion.
- Cartoon landscape (map in `app/scenes/cartoon/layout.ts`, kept off the track and stations by `test/cartoonLayout.spec.ts`): a lake inside the loop with a sandy shore and ducks paddling round it; a river out of the lake, glints drifting downstream, under a red arch bridge that carries the track (the ballast gives way to a plank deck), then over the island's edge as a waterfall pouring into the open sky; two rounded hills with rock tops; four cottages whose chimneys breathe slow smoke; sheep grazing; a flock of birds wheeling overhead by day; a dense forest; the island's cut face in earth layers; snow-capped peaks on floating rocks far behind it, low on the horizon. The train is a locomotive, its tender and four carriages.
- Galaxy: each `/about` section is a body of the solar system (the Sun for Hello, then planets); the camera glides to it and rides along its orbit. Projects is Earth with ten orbiters (moon, satellites, a station, meteors, probes); picking one zooms onto it and a shooting star passes it. Ambient shooting stars every few seconds. Bodies are painted procedurally in a storybook style (shaders, no image files): Earth with oceans, continents, ice caps, clouds and atmosphere; banded Jupiter with its red spot; ringed lavender Saturn; red Mars; swirled Venus; cratered Mercury; blue Neptune; a churning sun with a soft corona; cyan orbits. Earth's orbiters are illustrated spacecraft (gridded solar panels, gold foil, dishes) plus a cratered moon and an ember-tailed meteor.
- Terminal: the `/about` journey is a system-design map floating over the flowing grid — client (Hello), api-gateway (Skills), one service per career stage, the k8s cluster whose pods are the projects, the contact queue. Request packets flow along the wires and burst along the wire just travelled; the camera glides node to node; picking a project zooms onto its pod. Labels are technical names, identical in both languages.
- Trips: whatever the vibe, a trip page draws the cartoon board (same kit, sky and clouds) for **one vehicle per trip**, picked on the page (motorbike · car · coach); each has its own road from Valhalla (a motorbike stays off expressways). The board is a diorama block of the **real land**: an elevation grid over the whole board (plains, plateaus, mountains; the seabed under a flat sea with a sandy coast and bobbing boats; named lakes at their level), a corridor levelled to the road, earth walls round the edge. The road is grey with a dashed centre line, expressways wider and darker with a double line, bridges have railings and piers over a meandering river cut into the ground, tunnels a stone portal at each end, a mound over them and a dark bore inside, mountain passes red-and-white guard posts; towns the road passes are lined with blocks of buildings, every stop is a little town. What grows follows the land: pines above 850 m, coconut palms on the coast, round broadleaf trees elsewhere, rice paddies on flat lowland beside the road, rocks on steep mountainsides. Named bridges, tunnels and towns are stretched to a visible length (spans.ts). Passes and sights get a bobbing pin; every place gets a mono label, nearby labels stack upwards.
- City trips (a road mostly in town): paved ground, blocks of buildings of every height, a few trees, no paddies; landmarks along the street are its places.
- Trip motion: the vehicle drives on its own on a loop — eases into every place, waits there, at most 10 s between two places, tilts with the slope. Clicking a place in the itinerary (a button) or a town or pin in the scene drives it there (turning round to go back) and parks it; "Drive on" resumes the loop from that place. Two views, a segmented radio: **Overview** (chase camera that keeps the vehicle right of the panel) and **Driver's seat** (eye height per vehicle, looking down the road, wider lens, closer haze; the vehicle model hides). The itinerary follows the vehicle (`aria-current="step"`). Reduced motion parks it at the start and jumps to picked places.
- Projects: one `/about` stop with a grouped picker (employer → project). Switching cross-fades the detail (opacity + 6 px, `--dur-short`); the rail shows a small sub-dot per project; the cartoon chase camera slides to the picked billboard in the project yard.
- `prefers-reduced-motion: reduce`: the scene renders one frame per state change; reveals are a 150 ms fade; anchor jumps are instant.

## Microinteractions stance
Silent success. Hover delay 0 (no tooltips, except the name of a hovered 3D scene object). Focus ring 2 px `--color-focus`, offset 2 px, never animated. Hit targets ≥ 44 px.
No mouse-follow sway. On desktop the reader drags the scene to look around (a press that moves under 5 px is still a click) and zooms with the wheel on the home page, ⌘/ctrl + wheel or pinch on the journey (the plain wheel keeps scrolling), or the − / + buttons at the bottom left; a reset button appears once the view has moved. Touch keeps scrolling; the buttons are hidden below 40rem.
Scene objects are clickable shortcuts (pointer only; the rail and the project picker remain the accessible controls): a section's object goes to its section, a project's object picks it, and each vibe has an easter egg (cartoon: train whistle, windmill; galaxy: comet shower; terminal: a cron job that floods the map with requests). Hovering shows the name in a small mono tooltip. Page UI always wins a click over the scene behind it.

## CTA voice
Typographic links only (`.link`: word + arrow + 1 px underline, thickens on hover). No filled buttons on the profile pages.

## Per-page allowances
- Every page renders the vibe scene behind it (Tier A, primitives only, no GLTF/textures/Lottie); `/trips/[slug]` renders its trip instead (`app/layouts/default.vue`).
- Trip pages credit Valhalla for roads and times and "© OpenStreetMap contributors" (ODbL); map data never comes from Google (its terms forbid drawing it on a non-Google map).

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
