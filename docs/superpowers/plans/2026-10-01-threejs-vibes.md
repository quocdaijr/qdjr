# Three-Vibe 3D Profile Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the profile home page (`/`) and the about page (`/about`) of qdjr.me around a three.js scene with three switchable vibes (terminal · cartoon vintage · galaxy), turn `/about` into a scroll-driven journey, and let the chosen vibe retint the whole site.

**Architecture:** A Pinia `theme` store owns `vibe` (persisted) and `isDarkMode` (derived from the clock in UTC+7, no toggle). CSS tokens on `html[data-vibe]` plus a Tailwind v4 `@theme inline` remap of the grey/blue ramps retint every existing page with no per-component edits. One lazy, client-only `VibeScene` component (raw `three`, dynamically imported) renders the active vibe's scene behind `/` and `/about`; the about page drives camera progress through a shared `useState` that an IntersectionObserver updates per "stop".

**Tech Stack:** Nuxt 4.5.2 (SPA, `ssr:false`), Vue 3.5, Pinia 3, Tailwind v4.3 (`@tailwindcss/vite`), `three` (new), Vitest 3 + happy-dom (utils/stores), Playwright (e2e).

**Spec:** this file, § Context and § Design system (no separate spec document was written; the user's brief and answers are recorded below verbatim).

**Research notes:** `docs/research/2026-10-01-threejs-profile-redesign.md` (Task 0 copies it from the session scratchpad; it is the primary-source record for the three.js / Nuxt / font facts this plan relies on). Two of its recommendations are deliberately **not** followed: Lenis smooth-scroll (the user chose native scroll + IntersectionObserver; zero dependencies) and an `UnrealBloomPass` for the galaxy sun (post-processing doubles the render cost on phones; a back-face halo sphere gives the glow for one extra mesh). train-diorama itself turned out to have no scroll at all (camera presets on keys 1–4), so the journey model comes from Singularity: fixed canvas at `z-index: 0`, content at `z-index: 10`, full-height sections.

---

## Context

### The brief (user, verbatim)

> I want you re-design profile page. Use threeJS to make a specific UIs (can switch theme): vibe terminal, coding · vibe cartoon vitage chill · vibe galaxy with many planet. In page /about, should make as a journey, scroll to view each info. same like a discovery.

References the user pointed at: landing.love three.js collection, awwwards three.js collection, https://train-diorama.vercel.app/.

### Decisions already made with the user (do not re-litigate)

| Question | Answer |
| --- | --- |
| Where does the vibe switcher apply? | **Whole site.** Vibe tokens (fonts, colours) restyle header, footer and blog. The 3D scene renders on `/` and `/about` only. |
| Relation to the light/dark toggle? | **Keep light/dark, but it follows the clock in UTC+7** (Vietnam) instead of a manual switch. The sun/moon button goes away; the vibe switcher takes its slot. Each vibe ships a light and a dark palette. |
| Three.js integration | **Raw `three`**, dynamically imported inside a client-only component. No TresJS, no GSAP, no Lenis. |
| About-page scroll engine | **Native scroll + IntersectionObserver.** Each section is a full-height stop; the camera eases to that stop's waypoint. |

### Hallmark design gate (inferred, since the brief fixed the tone)

- **Audience:** recruiters, engineering peers and clients who land on qdjr.me from GitHub / LinkedIn / a blog post.
- **Use case:** read who Nguyen Quoc Dai is and go on to `/about` (CV) or `/blog`. One primary action per page: Home → "About me →"; About → reach the contact stop.
- **Tone:** fixed by the brief, one per vibe: **technical** (terminal), **playful-vintage** (cartoon), **atmospheric** (galaxy).

### Pre-flight findings (Hallmark Step 0)

- Font stack: `--font-sans: "Nunito", …` in `app/assets/css/main.css:17` — **inert**, Nunito is never loaded (the file says so). Nothing to preserve.
- Palette: none. Raw Tailwind `gray-*` / `blue-*` utilities across 24 files (`rg -l "gray-|blue-" app`). Dark mode = `.dark` class on `<html>` via `@custom-variant dark` (`main.css:10`), set by `app/stores/theme.ts`.
- Motion: no motion library. `@tsparticles/vue3` + `@tsparticles/slim` are installed and registered in `app/plugins/vue-particles.client.ts` but the particle background has **never rendered** (comment in `app/pages/index.vue:33-34`). Slated for removal in this plan.
- Spacing: Tailwind defaults.
- Framework: Nuxt 4.5.2, `app/` dir, SPA mode, Pinia, `@nuxt/content`.
- No `design.md`, no `.hallmark/`, no `docs/`.

**Hallmark will preserve:** the `.dark` class mechanism, every route, every component file, all copy on `/about` (moved verbatim into a data module), header/footer/blog markup.
**Hallmark will introduce:** `tokens.css` (three vibes × light/dark, OKLCH), `design.md`, `.hallmark/log.json`, Marquee Hero on `/`, Narrative Workflow journey on `/about`, motion discipline, reduced-motion fallbacks.

### Hallmark picks (stated before code, per the skill)

- **Scope:** multi-page redesign → `design.md` is the locked system; the diversification rule is *inverted* (pages share the system). First Hallmark run for this project (no `log.json`).
- **Genres:** terminal → atmospheric/terminal cluster · cartoon → playful · galaxy → atmospheric. One genre per vibe, all three live in one `design.md` as named variants.
- **Macrostructures:** `/` → **03 Marquee Hero** (the person is the message; the 3D canvas is the fold's background, the name is the statement). `/about` → **14 Narrative Workflow** (numbered stops 00–07; the journey the user asked for *is* a process timeline).
- **Nav:** one shared header structure (existing `Header.vue`, N1b-shaped: logo · search · links · control). Per-vibe voice is applied with CSS only: terminal gets the N8 prompt prefix `>` and caret on the link row; cartoon gets rounded 2 px-bordered link chips; galaxy gets a translucent elevated bar. *Deliberate simplification:* three separate nav archetypes would triple the header diff for no information gain.
- **Footer:** one shared **Ft2 inline single line** (social row · clock · credit), retinted per vibe. The existing `Footer.vue` is already this shape.
- **Section heads:** stacked stage numbers (`01` above the heading) on `/about` only. Allowed because Narrative Workflow content is genuinely ordinal. No eyebrows anywhere else.
- **Enrichment:** the three.js canvas is the enrichment (Tier A: built from primitives, no GLTF, no textures, no Lottie). No stock imagery.
- **Typography (2+1 rule, per vibe):**
  - terminal: **JetBrains Mono** 400/700 everywhere (single-font page is the design, allowed for a true terminal aesthetic).
  - cartoon: display **Fraunces** 700 (`SOFT 100`, `WONK 1` → the rounded, slightly cartoon cut), body **Bricolage Grotesque** 400/600.
  - galaxy: display **Tomorrow** 600, body **Geist** 400/600, outlier **Geist Mono** (wordmark line + clock only).
- **Colour:** OKLCH only, one accent per vibe, tinted greys, no `#000`/`#fff`. Palettes in § Design system.
- **Motion:** the scene animates; the DOM mostly does not. Allowed DOM motion: one page-load reveal (`opacity` + `translateY(8px)`, staggered ≤ 500 ms), terminal caret blink, hover underline. `prefers-reduced-motion: reduce` → scene renders one static frame, reveals collapse to a 150 ms opacity fade.
- **Glassmorphism is banned (all genres).** Text panels over the canvas are **opaque** `paper` surfaces; the canvas shows in the margins and between stops.

### What this plan deliberately does NOT change

- Blog, legacy-blogs, search, tag, category pages: not edited. They are retinted purely through the token remap.
- `Header.vue` layout widths, the mobile drawer, `PostSearch`: unchanged except the control slot (sun/moon → vibe switch) and the computed properties it needs. The `e2e/mobile-menu.spec.ts` selectors (`header button.w-10.h-10`, `.nav-mobile`) keep working.
- Routes, SEO meta on `/about` (`useHead`/`useSeoMeta` block is kept as-is), `profile.jpg`, project images.
- `nuxt.config.ts` beyond a comment edit (the chunk-size comment names tsparticles).

---

## Phases

Four phases, each a separate branch and PR against `main`, each leaving the site fully working on its own. Later phases depend on earlier ones being merged. Task numbers below are global so cross-references stay stable.

| Phase | Branch | Tasks | What ships | Done when |
| --- | --- | --- | --- | --- |
| **1 · Theme foundation** | `feature/dainq/vibes-1-theme` | 0 · 1 · 2 · 3 · 4 · 5 · 5.1 | Clock-driven dark mode, `vibe` store, OKLCH tokens, whole-site Tailwind remap, three font sets, vibe switcher in header/drawer, `SocialLinks`, profile data module, dead tsparticles removed. No 3D yet. | `npm run lint && npm run typecheck && npm run test:coverage && npx playwright test` green; blog/legacy pages visibly retint in all three vibes; PR merged. |
| **2 · 3D scenes + home** | `feature/dainq/vibes-2-scenes` | 6 · 7 · 8 · 8.1 | `three` scene contract, terminal/cartoon/galaxy scenes, lazy `VibeScene` mounted from the layout on `/` and `/about`, marquee hero on `/`. | Same gate; `npm run build` shows `three` in an async chunk; 20 vibe switches leak nothing; PR merged. |
| **3 · About journey** | `feature/dainq/vibes-3-journey` | 9 · 10 · 11 | `JourneyStop`, `JourneyRail`, `useJourney`, eight-stop `/about` driving the scene camera. | Same gate; mobile Projects stop activates; PR merged. |
| **4 · Lock + document** | `feature/dainq/vibes-4-docs` | 12 | `design.md`, `.hallmark/log.json`, README section, Hallmark slop-test pass. | Slop test 58/58; PR merged. |

Each phase ends with the **Phase gate** block at the end of its last task: full verification, push with `-u`, `gh pr create`, squash-merge (1 PR = 1 commit).

---

## Global Constraints

- Node `^22.19.0 || ^24.11.0 || >=26.0.0` (package.json `engines`); use `nvm use` → 24.19.0.
- New runtime dependency: `three` (latest 0.1xx, pinned by `npm i three@latest`), dev: `@types/three`. **No other new dependency** (no TresJS, GSAP, Lenis, drei, postprocessing).
- Remove: `@tsparticles/slim`, `@tsparticles/vue3`, `app/plugins/vue-particles.client.ts`.
- SPA mode stays (`ssr: false`); every `window`/`document` access still goes through `import.meta.client` guards in stores (Vitest stubs them to `true`).
- Code style: no semicolons, single quotes, 2-space indent, `{a, b}` object braces without inner spaces (matches `test/*.spec.ts` and `vitest.config.ts`). `eslint .` and `stylelint "**/*.{vue,css}"` must pass; `vue-tsc` via `npm run typecheck` must pass.
- CSS: every colour and `font-family` in new CSS references a token (`var(--color-…)`, `var(--font-…)`); raw OKLCH/hex only inside `tokens.css` and inside the three.js palette constants (three.js cannot parse `oklch()` strings).
- Mobile floor (Hallmark): no horizontal scroll at 320/375/414/768 px; `overflow-x: clip` on `html, body`; no clickable text wrapping; image grids use `minmax(0, 1fr)`; `100svh` not `100vh`.
- Accessibility: every interactive element has `:focus-visible` ring ≥ 3:1, min 44 × 44 px hit target under 40 rem; the vibe switch is a real radio group / button with labels; canvas is `aria-hidden="true"`.
- Immutability in TS: data modules export `as const` / `readonly` arrays; no in-place mutation of shared objects outside three.js scene internals.
- Coverage thresholds (80 % statements/branches/functions/lines) apply to `app/utils/**` and `app/stores/**` only (`vitest.config.ts`). New utils/stores need tests; components and scenes are covered by Playwright.
- Commits: conventional, one topic per commit while working; each phase branch (`feature/dainq/vibes-<n>-<slug>`, cut from `main` after the previous phase merged) lands as **one squash-merged PR**. Attribution trailer per the session rule: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

Inputs the spec implies but no task's happy path exercises, most likely to bite first:

1. **A stale `vibe` value in localStorage** (e.g. a future renamed vibe, or junk) → `initializeTheme()` must fall back to `'terminal'`, never set `data-vibe="undefined"`. Pinned in Task 3 test *"ignores an unknown saved vibe"*.
2. **Clock edge at exactly 06:00 and 18:00 UTC+7** and the UTC day wrap (23:30 UTC = 06:30 VN next day) → `isNightInVietnam` boundaries. Pinned in Task 2 tests.
3. **WebGL unavailable** (headless CI, old GPU, `webgl` disabled) → `WebGLRenderer` constructor throws; the page must still render the HTML overlay. Pinned in Task 7 (`onMounted` catches, warns, and leaves the page HTML-only) and in `e2e/vibe.spec.ts` (the hero heading is asserted visible before any canvas assertion).
4. **Switching vibes rapidly / leaving the page mid-switch** → the previous scene must be fully disposed before the next is built, and unmount must not touch a disposed renderer. Pinned in Task 7 (scene factories are synchronous, `buildScene` disposes-then-builds, `onBeforeUnmount` null-checks) and in `e2e/vibe.spec.ts` (cycle all three vibes, assert zero console/page errors).
5. **A stop taller than the viewport on mobile** (Projects, 10 cards) → the observer must still mark it active while scrolling through its middle. Pinned in Task 9 by using `rootMargin: '-50% 0px -50% 0px', threshold: 0` (a centre band) rather than `threshold: 0.5`, and asserted in `e2e/about-journey.spec.ts` on the mobile project (Task 11).

---

## Design system (what `design.md` will record)

### Shared tokens (all vibes)

```css
--space-3xs: 0.25rem; --space-2xs: 0.5rem; --space-xs: 0.75rem; --space-sm: 1rem;
--space-md: 1.5rem;  --space-lg: 2rem;    --space-xl: 3rem;    --space-2xl: 4.5rem; --space-3xl: 7rem;
--text-sm: 0.875rem; --text-base: 1rem; --text-md: 1.25rem; --text-lg: 1.5625rem; --text-xl: 1.9531rem; --text-2xl: 2.4414rem;
--text-display: clamp(2.75rem, 5vw + 1rem, 5.25rem);   /* "Nguyen Quoc Dai" = 15 chars → full display */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); --ease-in: cubic-bezier(0.7, 0, 0.84, 0); --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--dur-micro: 120ms; --dur-short: 220ms; --dur-long: 420ms;
--rule-hair: 1px; --page-gutter: clamp(1rem, 4vw, 2rem);
```

### Per-vibe palettes (OKLCH; hue never changes between light and dark)

| token | terminal · dark (default) | terminal · light | cartoon · light (default) | cartoon · dark | galaxy · dark (default) | galaxy · light |
| --- | --- | --- | --- | --- | --- | --- |
| paper | `oklch(13% 0.012 150)` | `oklch(96% 0.012 150)` | `oklch(96% 0.03 85)` | `oklch(24% 0.03 50)` | `oklch(12% 0.03 280)` | `oklch(95% 0.015 260)` |
| paper-2 | `oklch(17% 0.014 150)` | `oklch(92% 0.015 150)` | `oklch(92% 0.04 80)` | `oklch(28% 0.035 50)` | `oklch(16% 0.035 280)` | `oklch(91% 0.02 260)` |
| rule | `oklch(30% 0.02 150)` | `oklch(80% 0.02 150)` | `oklch(80% 0.04 75)` | `oklch(40% 0.03 50)` | `oklch(30% 0.03 280)` | `oklch(80% 0.02 260)` |
| muted | `oklch(68% 0.04 150)` | `oklch(45% 0.03 150)` | `oklch(48% 0.04 55)` | `oklch(75% 0.03 70)` | `oklch(72% 0.02 280)` | `oklch(45% 0.03 270)` |
| ink | `oklch(90% 0.05 150)` | `oklch(22% 0.03 150)` | `oklch(28% 0.04 50)` | `oklch(93% 0.025 85)` | `oklch(94% 0.012 280)` | `oklch(20% 0.04 280)` |
| accent | `oklch(80% 0.20 150)` phosphor | `oklch(50% 0.17 150)` | `oklch(62% 0.16 40)` terracotta | `oklch(72% 0.14 45)` | `oklch(82% 0.14 80)` star-amber | `oklch(58% 0.15 65)` |
| focus | `oklch(80% 0.20 150)` | `oklch(50% 0.17 150)` | `oklch(55% 0.18 40)` | `oklch(72% 0.14 45)` | `oklch(80% 0.16 80)` | `oklch(58% 0.15 65)` |
| radius-card | `0` | `0` | `12px` | `12px` | `8px` | `8px` |

Grey ramp (`--vibe-gray-50…950`) is one lightness ladder per vibe, tinted with the vibe hue: L = 97 / 93 / 87 / 78 / 62 / 50 / 40 / 30 / 20 / 14 / 10 %, chroma 0.012 (terminal, hue 150) · 0.03 (cartoon, hue 70) · 0.025 (galaxy, hue 280). The existing utilities `bg-gray-50 dark:bg-gray-900`, `text-gray-600 dark:text-gray-300`, `bg-gray-100 dark:bg-gray-800`, `bg-gray-200 dark:bg-gray-700` then land on tinted paper/ink automatically. Accent ramp: `--vibe-blue-600` = light accent, `--vibe-blue-400` = dark accent, `--vibe-blue-500` = midpoint; the site's `text-blue-600 dark:text-blue-400` links become accent links.

### Fonts (Google Fonts, `display=swap`, one `<link>` swapped per vibe)

| vibe | href |
| --- | --- |
| terminal | `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap` |
| cartoon | `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,700,100,1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&display=swap` |
| galaxy | `https://fonts.googleapis.com/css2?family=Tomorrow:wght@600&family=Geist:wght@400;600&family=Geist+Mono:wght@400&display=swap` |

(Task 0 verifies each URL returns HTTP 200 with `curl -sI`; if Google rejects an axis tuple, drop to `Fraunces:wght@700` and note it in `design.md`.)

### three.js palette constants (hex, because `THREE.Color` cannot parse `oklch()`)

| vibe | dark | light |
| --- | --- | --- |
| terminal | bg `#0b1410` · grid `#39ff8a` · fog `#0b1410` · solid `#1b3b2a` | bg `#eef5f0` · grid `#13884a` · fog `#eef5f0` · solid `#b9d6c4` |
| cartoon | sky `#2b2320` · ground `#6b4a35` · grass `#7fae63` · leaf `#4f8a4b` · trunk `#5a3b2a` · wall `#f3e5c8` · roof `#c9633c` · cloud `#d9cfc4` | sky `#f6ecd8` · ground `#8d5e43` · grass `#9bc77a` · leaf `#5d9c57` · trunk `#6b4631` · wall `#fff6e1` · roof `#d9704a` · cloud `#ffffff` (allowed: it is a lit 3D surface, not a CSS paper) |
| galaxy | bg `#0a0920` · sun `#ffb347` · star `#cfd3ff` · orbit `#5a5c8a` · planets `['#c98b5e','#7aa6d9','#d9b96b','#8c6ad9','#5fb0a0','#d97a7a','#b4b4c8']` | bg `#edeef8` · sun `#e58f1a` · star `#3b3d6b` · orbit `#9a9cc4` · same planets |

---

## File structure

| Path | Status | Responsibility |
| --- | --- | --- |
| `docs/research/2026-10-01-threejs-profile-redesign.md` | create | Research notes (copied from scratchpad). |
| `docs/superpowers/plans/2026-10-01-threejs-vibes.md` | create | This plan, mirrored into the repo. |
| `design.md` | create | Locked design system (Hallmark multi-page). |
| `.hallmark/log.json` | create | Hallmark project memory, one `scope: app` entry. |
| `package.json` | modify | `+three`, `+@types/three`, `−@tsparticles/*`. |
| `app/plugins/vue-particles.client.ts` | **delete** | Dead particle plugin. |
| `nuxt.config.ts:165-172` | modify | Comment no longer names tsparticles. |
| `app/utils/vnTime.ts` | create | `vietnamHour`, `isNightInVietnam` (pure). |
| `test/vnTime.spec.ts` | create | Boundary tests. |
| `app/stores/theme.ts` | rewrite | `vibe` + clock-derived `isDarkMode`. |
| `test/theme.spec.ts` | rewrite | Store behaviour. |
| `app/plugins/theme.client.ts` | modify | init + `startClock()`. |
| `app/assets/css/tokens.css` | create | Vibe tokens (terminal on `:root`/`.dark`, others on `[data-vibe]`), grey/accent ramps, shared scale. |
| `app/assets/css/main.css` | modify | import tokens, `@theme inline` remap, base rules, prose retint, per-vibe nav voice, reveal keyframes. |
| `nuxt.config.ts` `app.head.link` | modify | preconnect + three static Google Fonts stylesheets (one per vibe). |
| `app/components/VibeSwitch.vue` | create | Segmented radio group (`variant="segmented"`) or icon cycle button (`variant="icon"`). |
| `app/components/SocialLinks.vue` | create | The 7 social anchors, extracted from `Footer.vue`/about. |
| `app/components/Header.vue` | modify | Control slot → `<VibeSwitch variant="icon">`; drop `toggleTheme`. |
| `app/components/NavBar.vue` | modify | Mobile drawer gets `<VibeSwitch variant="segmented">`. |
| `app/components/Footer.vue` | modify | Use `<SocialLinks size="sm">`; scroll-to-top via `scrollTo({behavior:'smooth'})`. |
| `app/layouts/default.vue` | modify | `<LazyVibeScene v-if>` on `/` and `/about`; content wrapper `relative z-10`. |
| `app/data/profile.ts` | create | All `/about` copy as typed constants. |
| `app/scenes/types.ts` | create | `VibeScene`, `SceneOptions`, `SceneFactory`. |
| `app/scenes/terminal.ts` · `cartoon.ts` · `galaxy.ts` | create | One scene factory each, primitives only. |
| `app/composables/useJourneyProgress.ts` | create | `useState('journey-progress')` wrapper (page → scene channel). |
| `app/components/VibeScene.vue` | create | Canvas + renderer + loop + scene swap + pointer + progress + disposal. |
| `app/pages/index.vue` | rewrite | Marquee hero overlay. |
| `app/pages/about/index.vue` | rewrite | 8 journey stops from `profile.ts`. |
| `app/components/journey/Stop.vue` | create | One stop shell (id, stage number, heading, slot). |
| `app/components/journey/Rail.vue` | create | Fixed left rail with 8 dots. |
| `app/composables/useJourney.ts` | create | IntersectionObserver → `activeStop` + progress. |
| `e2e/layout.spec.ts:40-55` | modify | Dark-mode test uses `page.clock`. |
| `e2e/vibe.spec.ts` | create | Switch vibes, persistence, font, canvas/overlay, rapid switching. |
| `e2e/about-journey.spec.ts` | create | Stops, rail, active state (desktop + mobile). |
| `README.md` | modify | One section: vibes + clock-based dark mode. |

Decisions from the architecture review folded in above: the canvas is `position: fixed; z-index: 0` **above** the opaque body background (a `z-index: -1` canvas is invisible behind `bodyAttrs` `bg-gray-50` — the exact reason tsparticles never showed), with the content wrapper lifted to `z-10`; one `VibeScene` lives in the layout so the WebGL context survives `/ ↔ /about`; `html` is the scroll container (the `h-screen` wrapper is not), so nothing may add `overflow: auto` to the wrapper; scroll-snap is **cut** (fights iOS momentum and the footer's scroll-to-top); the per-vibe font-link swap is **cut** in favour of three static links; `document.hidden` / canvas-intersection pausing is cut (browsers already stop rAF in hidden tabs; the canvas is always on screen).

---

## Tasks

# Phase 1 — Theme foundation

Branch `feature/dainq/vibes-1-theme`. Deliverable: the whole site switches between three vibes and follows the Vietnam clock for light/dark, with no 3D yet. Tasks 0 → 5.1.

### Task 0: Branch, research notes, dependencies

**Files:**
- Create: `docs/research/2026-10-01-threejs-profile-redesign.md`, `docs/superpowers/plans/2026-10-01-threejs-vibes.md`
- Modify: `package.json`, `nuxt.config.ts:165-172`, `app/pages/index.vue:32-36`
- Delete: `app/plugins/vue-particles.client.ts`

- [ ] **Step 1: Branch from main**

```bash
cd /private/var/www/html/personal/qdjr
git fetch origin && git checkout main && git pull --ff-only
git checkout -b feature/dainq/vibes-1-theme
nvm use
```
Expected: `Switched to a new branch 'feature/dainq/vibes-1-theme'`, `Now using node v24.19.0`.

- [ ] **Step 2: Copy the research notes and this plan into the repo**

```bash
mkdir -p docs/research docs/superpowers/plans
cp /private/tmp/claude-501/-private-var-www-html-personal-qdjr/e01ea6d6-8245-45c7-9bbd-785de1df8237/scratchpad/research-threejs-profile.md docs/research/2026-10-01-threejs-profile-redesign.md
cp /Users/quocdaijr/.claude/plans/pasted-content-id-fde5-hallmark-mattpoc-wobbly-mist.md docs/superpowers/plans/2026-10-01-threejs-vibes.md
```
If the scratchpad file is gone (new session), re-run the research prompt from § Research notes of this plan's history or skip the copy and note it in the commit body.

- [ ] **Step 3: Swap dependencies**

```bash
npm uninstall @tsparticles/slim @tsparticles/vue3
npm install three@latest
npm install -D @types/three@latest
git rm app/plugins/vue-particles.client.ts
node -e "console.log(require('three/package.json').version)"
```
Expected: a `0.1xx.0` version printed; `package.json` no longer lists `@tsparticles/*`.

- [ ] **Step 4: Verify the three Google Fonts URLs resolve**

```bash
for u in \
 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap' \
 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,700,100,1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&display=swap' \
 'https://fonts.googleapis.com/css2?family=Tomorrow:wght@600&family=Geist:wght@400;600&family=Geist+Mono:wght@400&display=swap'; do
  printf '%s -> ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' -A 'Mozilla/5.0' "$u"; done
```
Expected: three lines ending in `200`. A `400` on the Fraunces line means the axis tuple is wrong: replace that family segment with `Fraunces:wght@700` in the `nuxt.config.ts` link added in Task 3 Step 3 and record the fallback in `design.md` (Task 12).

- [ ] **Step 5: Fix the stale comment in nuxt.config.ts**

In `nuxt.config.ts` lines 165–172 replace the `build:` comment block:

```ts
    build: {
      // The main bundle is ~1MB because several legacy client plugins (prismjs
      // with many languages, video.js, vue-spinner) are registered globally.
      // They only run on /legacy-blogs/* but are bundled eagerly. The whole
      // legacy surface is slated for removal, so raising the warning threshold
      // here is intentional until that happens. three.js is NOT part of this:
      // it is reached only through dynamic imports in app/scenes/* and lands in
      // its own async chunk.
      chunkSizeWarningLimit: 1200
    }
```

- [ ] **Step 6: Drop the dead particle element from the home page** — `app/pages/index.vue:32-36`. FIND:

```vue
    <ClientOnly>
      <!-- `id` is required by @tsparticles/vue3 (it throws without one). It was
           missing, so the particle background has never actually rendered. -->
      <vue-particles id="tsparticles" class="absolute left-0 top-0 h-full w-full" style="z-index: -1"/>
    </ClientOnly>
```
REPLACE with nothing (delete the five lines). The rest of the page is rewritten in Phase 2 (Task 8).

- [ ] **Step 7: Confirm the app still boots without the particles plugin**

```bash
npm run lint:js && npm run typecheck && timeout 90 npm run dev &
sleep 25 && curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/ ; kill %1
```
Expected: lint clean, typecheck clean, `200`, no unknown-element warning in the dev console.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts app/pages/index.vue docs
git commit -m "chore: swap dead tsparticles for three, add research notes and plan

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 1: `isNightInVietnam` (pure clock helper)

**Files:**
- Create: `app/utils/vnTime.ts`
- Test: `test/vnTime.spec.ts`

**Interfaces:**
- Produces: `vietnamHour(date: Date): number` (0–23), `isNightInVietnam(date: Date): boolean`, constants `VN_UTC_OFFSET_HOURS = 7`, `NIGHT_START_HOUR = 18`, `NIGHT_END_HOUR = 6`. Night = `[18:00, 06:00)` Vietnam time.

- [ ] **Step 1: Write the failing test**

```ts
// test/vnTime.spec.ts
import {describe, expect, test} from 'vitest'
import {isNightInVietnam, vietnamHour} from '~/utils/vnTime'

// Dates are built in UTC; Vietnam is UTC+7 with no DST.
const utc = (h: number, m = 0) => new Date(Date.UTC(2026, 9, 1, h, m))

describe('vietnamHour', () => {
  test('adds seven hours to the UTC hour', () => {
    expect(vietnamHour(utc(5))).toBe(12)
  })

  test('wraps past midnight', () => {
    expect(vietnamHour(utc(23, 30))).toBe(6)
  })
})

describe('isNightInVietnam', () => {
  test('is day at noon in Vietnam', () => {
    expect(isNightInVietnam(utc(5))).toBe(false)
  })

  test('is day at exactly 06:00 (night ends)', () => {
    expect(isNightInVietnam(utc(23))).toBe(false)
  })

  test('is night at 05:59', () => {
    expect(isNightInVietnam(utc(22, 59))).toBe(true)
  })

  test('is night at exactly 18:00 (night starts)', () => {
    expect(isNightInVietnam(utc(11))).toBe(true)
  })

  test('is day at 17:59', () => {
    expect(isNightInVietnam(utc(10, 59))).toBe(false)
  })

  test('is night at midnight', () => {
    expect(isNightInVietnam(utc(17))).toBe(true)
  })
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run test/vnTime.spec.ts`
Expected: FAIL — `Failed to resolve import "~/utils/vnTime"`.

- [ ] **Step 3: Implement**

```ts
// app/utils/vnTime.ts
// Light/dark on qdjr.me follows the clock in Vietnam (UTC+7, no DST) instead
// of a manual toggle: visitors see the site the way the author does right now.

export const VN_UTC_OFFSET_HOURS = 7
export const NIGHT_START_HOUR = 18
export const NIGHT_END_HOUR = 6

const HOURS_PER_DAY = 24

/** Hour of day (0–23) in Vietnam for the given instant. */
export function vietnamHour(date: Date): number {
  return (date.getUTCHours() + VN_UTC_OFFSET_HOURS) % HOURS_PER_DAY
}

/** True from 18:00 up to (not including) 06:00 Vietnam time. */
export function isNightInVietnam(date: Date): boolean {
  const hour = vietnamHour(date)
  return hour < NIGHT_END_HOUR || hour >= NIGHT_START_HOUR
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run test/vnTime.spec.ts`
Expected: `8 passed`.

- [ ] **Step 5: Commit**

```bash
git add app/utils/vnTime.ts test/vnTime.spec.ts
git commit -m "feat(theme): add Vietnam-clock day/night helper

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Theme store — `vibe` + clock-derived dark mode

**Files:**
- Rewrite: `app/stores/theme.ts`
- Rewrite: `test/theme.spec.ts`
- Modify: `app/plugins/theme.client.ts`

**Interfaces:**
- Consumes: `isNightInVietnam` from Task 1 (auto-imported by Nuxt from `app/utils`; the Vitest run imports it explicitly).
- Produces (used by Tasks 5, 6, 9, 10, 11):
  ```ts
  export type Vibe = 'terminal' | 'cartoon' | 'galaxy'
  export const VIBES: readonly Vibe[]                    // ['terminal', 'cartoon', 'galaxy']
  export const DEFAULT_VIBE: Vibe                        // 'terminal'
  export const VIBE_STORAGE_KEY = 'vibe'
  export function isVibe(value: unknown): value is Vibe
  useThemeStore(): {
    vibe: Vibe; isDarkMode: boolean; isInitialized: boolean
    currentTheme: 'dark' | 'light'; logoSrc: string
    initializeTheme(now?: Date): void; setVibe(v: Vibe): void; nextVibe(): void
    syncClock(now?: Date): void; applyTheme(): void; startClock(intervalMs?: number): () => void
  }
  ```
- `applyTheme()` sets `document.documentElement.classList` `dark` and `document.documentElement.dataset.vibe`.

- [ ] **Step 1: Replace the test file**

```ts
// test/theme.spec.ts
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {DEFAULT_VIBE, VIBES, VIBE_STORAGE_KEY, isVibe, useThemeStore} from '~/stores/theme'

// 12:00 and 22:00 Vietnam time, expressed in UTC (UTC+7).
const VN_NOON = new Date(Date.UTC(2026, 9, 1, 5, 0))
const VN_NIGHT = new Date(Date.UTC(2026, 9, 1, 15, 0))

const html = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  html().classList.remove('dark')
  delete html().dataset.vibe
})

afterEach(() => {
  vi.useRealTimers()
})

describe('vibe helpers', () => {
  test('isVibe accepts only the three vibes', () => {
    VIBES.forEach((v) => expect(isVibe(v)).toBe(true))
    expect(isVibe('neon')).toBe(false)
    expect(isVibe(null)).toBe(false)
    expect(isVibe(undefined)).toBe(false)
  })
})

describe('theme store', () => {
  test('starts on the default vibe, light, uninitialised', () => {
    const store = useThemeStore()
    expect(store.vibe).toBe(DEFAULT_VIBE)
    expect(store.isDarkMode).toBe(false)
    expect(store.isInitialized).toBe(false)
    expect(store.currentTheme).toBe('light')
  })

  test('initializeTheme restores a saved vibe and applies it to <html>', () => {
    localStorage.setItem(VIBE_STORAGE_KEY, 'galaxy')

    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe('galaxy')
    expect(html().dataset.vibe).toBe('galaxy')
    expect(store.isInitialized).toBe(true)
  })

  test('ignores an unknown saved vibe', () => {
    localStorage.setItem(VIBE_STORAGE_KEY, 'neon')

    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe(DEFAULT_VIBE)
    expect(html().dataset.vibe).toBe(DEFAULT_VIBE)
  })

  test('derives light mode from the Vietnam clock at noon', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    expect(store.isDarkMode).toBe(false)
    expect(html().classList.contains('dark')).toBe(false)
  })

  test('derives dark mode from the Vietnam clock at night', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NIGHT)

    expect(store.isDarkMode).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
    expect(store.currentTheme).toBe('dark')
    expect(store.logoSrc).toBe('/logo-dark.svg')
  })

  test('does not re-initialise once initialised', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    localStorage.setItem(VIBE_STORAGE_KEY, 'cartoon')
    store.initializeTheme(VN_NOON)

    expect(store.vibe).toBe(DEFAULT_VIBE)
  })

  test('setVibe persists and applies', () => {
    const store = useThemeStore()

    store.setVibe('cartoon')

    expect(store.vibe).toBe('cartoon')
    expect(localStorage.getItem(VIBE_STORAGE_KEY)).toBe('cartoon')
    expect(html().dataset.vibe).toBe('cartoon')
  })

  test('nextVibe cycles through all vibes and wraps', () => {
    const store = useThemeStore()

    store.nextVibe()
    expect(store.vibe).toBe('cartoon')
    store.nextVibe()
    expect(store.vibe).toBe('galaxy')
    store.nextVibe()
    expect(store.vibe).toBe('terminal')
  })

  test('syncClock re-evaluates dark mode for a given instant', () => {
    const store = useThemeStore()
    store.initializeTheme(VN_NOON)

    store.syncClock(VN_NIGHT)

    expect(store.isDarkMode).toBe(true)
    expect(html().classList.contains('dark')).toBe(true)
  })

  test('startClock ticks on the interval and the returned function stops it', () => {
    vi.useFakeTimers()
    vi.setSystemTime(VN_NOON)
    const store = useThemeStore()
    store.initializeTheme()
    expect(store.isDarkMode).toBe(false)

    const stop = store.startClock(60_000)
    vi.setSystemTime(VN_NIGHT)
    vi.advanceTimersByTime(60_000)
    expect(store.isDarkMode).toBe(true)

    stop()
    vi.setSystemTime(VN_NOON)
    vi.advanceTimersByTime(60_000)
    expect(store.isDarkMode).toBe(true) // no longer ticking
  })
})
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run test/theme.spec.ts`
Expected: FAIL — `isVibe`/`VIBES` are not exported; `initializeTheme` ignores the argument.

- [ ] **Step 3: Rewrite the store**

```ts
// app/stores/theme.ts
// Theme = vibe (user choice, persisted) + dark mode (derived from the Vietnam
// clock, never persisted, no manual toggle).
import {defineStore} from 'pinia'
import {isNightInVietnam} from '~/utils/vnTime'

export type Vibe = 'terminal' | 'cartoon' | 'galaxy'

export const VIBES: readonly Vibe[] = ['terminal', 'cartoon', 'galaxy'] as const
export const DEFAULT_VIBE: Vibe = 'terminal'
export const VIBE_STORAGE_KEY = 'vibe'

const CLOCK_INTERVAL_MS = 60_000

export function isVibe(value: unknown): value is Vibe {
  return typeof value === 'string' && (VIBES as readonly string[]).includes(value)
}

export interface ThemeState {
  vibe: Vibe
  isDarkMode: boolean
  isInitialized: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    vibe: DEFAULT_VIBE,
    isDarkMode: false,
    isInitialized: false
  }),

  getters: {
    currentTheme: (state): 'dark' | 'light' => (state.isDarkMode ? 'dark' : 'light'),
    logoSrc: (state): string => (state.isDarkMode ? '/logo-dark.svg' : '/logo.svg')
  },

  actions: {
    // Restore the saved vibe (if valid) and evaluate the clock once.
    initializeTheme(now: Date = new Date()) {
      if (!import.meta.client || this.isInitialized) return
      const saved = localStorage.getItem(VIBE_STORAGE_KEY)
      this.vibe = isVibe(saved) ? saved : DEFAULT_VIBE
      this.isDarkMode = isNightInVietnam(now)
      this.applyTheme()
      this.isInitialized = true
    },

    setVibe(vibe: Vibe) {
      if (!isVibe(vibe)) return
      this.vibe = vibe
      if (import.meta.client) localStorage.setItem(VIBE_STORAGE_KEY, vibe)
      this.applyTheme()
    },

    nextVibe() {
      const index = VIBES.indexOf(this.vibe)
      this.setVibe(VIBES[(index + 1) % VIBES.length])
    },

    // Re-evaluate dark mode. Called once a minute by startClock().
    syncClock(now: Date = new Date()) {
      this.isDarkMode = isNightInVietnam(now)
      this.applyTheme()
    },

    applyTheme() {
      if (!import.meta.client) return
      const html = document.documentElement
      html.classList.toggle('dark', this.isDarkMode)
      html.dataset.vibe = this.vibe
    },

    // Returns a stop function so callers (and tests) can clear the interval.
    startClock(intervalMs: number = CLOCK_INTERVAL_MS): () => void {
      if (!import.meta.client) return () => {}
      const id = setInterval(() => this.syncClock(), intervalMs)
      return () => clearInterval(id)
    }
  }
})
```

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run test/theme.spec.ts test/vnTime.spec.ts`
Expected: all pass. Then `npm run test:coverage` → thresholds hold for `app/stores/theme.ts` and `app/utils/vnTime.ts` (every branch above is exercised: unknown vibe, re-init guard, cycle wrap, stop function).

- [ ] **Step 5: Update the plugin**

```ts
// app/plugins/theme.client.ts
// Theme bootstrap: restore the saved vibe, evaluate the Vietnam clock once,
// then keep re-evaluating it every minute for the life of the tab.
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  themeStore.initializeTheme()
  themeStore.startClock()
})
```

- [ ] **Step 6: Lint and commit**

```bash
npm run lint:js
git add app/stores/theme.ts app/plugins/theme.client.ts test/theme.spec.ts
git commit -m "feat(theme): vibe selection with clock-derived dark mode

Dark mode now follows the clock in UTC+7 instead of a manual toggle.
The sun/moon button is replaced in a follow-up commit.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
(`Header.vue` still calls `toggleTheme`, which no longer exists. `vue-tsc` is not strict on Options API `this`, so typecheck passes; Task 4 fixes the header before anything ships.)

---

### Task 3: Design tokens, Tailwind remap, fonts

**Files:**
- Create: `app/assets/css/tokens.css`
- Modify: `app/assets/css/main.css` (whole file shown below), `nuxt.config.ts` `app.head.link`

**Interfaces:**
- Produces CSS tokens consumed by every later task: `--color-paper`, `--color-paper-2`, `--color-rule`, `--color-muted`, `--color-ink`, `--color-accent`, `--color-focus`, `--radius-card`, `--radius-pill`, `--vibe-font-display|body|mono`, `--space-*`, `--text-*`, `--ease-*`, `--dur-*`, `--rule-hair`, `--page-gutter`, grey ramp `--vibe-gray-50…900`, accent ramp `--vibe-blue-50|100|300|400|500|600|700|900`.
- Tailwind utilities produced by the `@theme inline` block: `font-display`, `font-sans`, `font-mono`; all `gray-*` and `blue-*` colour utilities now follow the vibe.
- Global classes: `.reveal` (page-load fade), `.link` (C3 typographic link).

- [ ] **Step 1: Create `app/assets/css/tokens.css`**

```css
/* Hallmark · genre: atmospheric (terminal, galaxy) · playful (cartoon)
 * macrostructure: Marquee Hero (/) · Narrative Workflow (/about)
 * theme: custom ×3 — terminal (dark-band · mono · chromatic-green)
 *                    cartoon  (light-band · soft-serif display · warm-terracotta)
 *                    galaxy   (dark-band · geometric-sans display · warm-amber)
 * nav: N1b shell, per-vibe voice (N8 flags on terminal) · footer: Ft2 inline single line
 * enrichment: Tier-A three.js primitives · design-system: design.md · designed-as-app
 * Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4
 *
 * Rules: OKLCH only in this file. Hue never changes between light and dark —
 * only lightness and chroma move. Terminal is the default vibe, so its tokens
 * live on :root / .dark and are always defined even before the store runs.
 */

:root {
  /* ---- shared scale ---- */
  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;
  --text-display: clamp(2.75rem, 5vw + 1rem, 5.25rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --rule-hair: 1px;
  --page-gutter: clamp(1rem, 4vw, 2rem);

  /* ---- vibe: terminal · light (default vibe) ---- */
  --color-paper: oklch(96% 0.012 150);
  --color-paper-2: oklch(92% 0.015 150);
  --color-rule: oklch(80% 0.02 150);
  --color-muted: oklch(45% 0.03 150);
  --color-ink: oklch(22% 0.03 150);
  --color-accent: oklch(50% 0.17 150);
  --color-focus: oklch(50% 0.17 150);
  --radius-card: 0;
  --radius-pill: 0;
  --vibe-font-display: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --vibe-font-body: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --vibe-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --vibe-gray-50: oklch(97% 0.012 150);
  --vibe-gray-100: oklch(93% 0.012 150);
  --vibe-gray-200: oklch(87% 0.012 150);
  --vibe-gray-300: oklch(78% 0.012 150);
  --vibe-gray-400: oklch(62% 0.012 150);
  --vibe-gray-500: oklch(50% 0.012 150);
  --vibe-gray-600: oklch(40% 0.012 150);
  --vibe-gray-700: oklch(30% 0.012 150);
  --vibe-gray-800: oklch(20% 0.012 150);
  --vibe-gray-900: oklch(14% 0.012 150);
  --vibe-blue-50: oklch(95% 0.03 150);
  --vibe-blue-100: oklch(90% 0.05 150);
  --vibe-blue-300: oklch(78% 0.1 150);
  --vibe-blue-400: oklch(80% 0.2 150);
  --vibe-blue-500: oklch(62% 0.16 150);
  --vibe-blue-600: oklch(50% 0.17 150);
  --vibe-blue-700: oklch(42% 0.14 150);
  --vibe-blue-900: oklch(28% 0.08 150);
}

/* terminal · dark */
.dark {
  --color-paper: oklch(13% 0.012 150);
  --color-paper-2: oklch(17% 0.014 150);
  --color-rule: oklch(30% 0.02 150);
  --color-muted: oklch(68% 0.04 150);
  --color-ink: oklch(90% 0.05 150);
  --color-accent: oklch(80% 0.2 150);
  --color-focus: oklch(80% 0.2 150);
}

/* ---- vibe: cartoon · light ---- */
[data-vibe="cartoon"] {
  --color-paper: oklch(96% 0.03 85);
  --color-paper-2: oklch(92% 0.04 80);
  --color-rule: oklch(80% 0.04 75);
  --color-muted: oklch(48% 0.04 55);
  --color-ink: oklch(28% 0.04 50);
  --color-accent: oklch(62% 0.16 40);
  --color-focus: oklch(55% 0.18 40);
  --radius-card: 12px;
  --radius-pill: 999px;
  --vibe-font-display: "Fraunces", ui-serif, Georgia, serif;
  --vibe-font-body: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --vibe-font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --vibe-gray-50: oklch(97% 0.03 70);
  --vibe-gray-100: oklch(93% 0.03 70);
  --vibe-gray-200: oklch(87% 0.03 70);
  --vibe-gray-300: oklch(78% 0.03 70);
  --vibe-gray-400: oklch(62% 0.03 70);
  --vibe-gray-500: oklch(50% 0.03 70);
  --vibe-gray-600: oklch(40% 0.03 70);
  --vibe-gray-700: oklch(30% 0.03 70);
  --vibe-gray-800: oklch(20% 0.03 70);
  --vibe-gray-900: oklch(14% 0.03 70);
  --vibe-blue-50: oklch(95% 0.03 40);
  --vibe-blue-100: oklch(90% 0.05 40);
  --vibe-blue-300: oklch(78% 0.1 40);
  --vibe-blue-400: oklch(72% 0.14 45);
  --vibe-blue-500: oklch(66% 0.15 42);
  --vibe-blue-600: oklch(62% 0.16 40);
  --vibe-blue-700: oklch(48% 0.14 40);
  --vibe-blue-900: oklch(30% 0.08 40);
}

/* cartoon · dark */
.dark[data-vibe="cartoon"] {
  --color-paper: oklch(24% 0.03 50);
  --color-paper-2: oklch(28% 0.035 50);
  --color-rule: oklch(40% 0.03 50);
  --color-muted: oklch(75% 0.03 70);
  --color-ink: oklch(93% 0.025 85);
  --color-accent: oklch(72% 0.14 45);
  --color-focus: oklch(72% 0.14 45);
}

/* ---- vibe: galaxy · light ---- */
[data-vibe="galaxy"] {
  --color-paper: oklch(95% 0.015 260);
  --color-paper-2: oklch(91% 0.02 260);
  --color-rule: oklch(80% 0.02 260);
  --color-muted: oklch(45% 0.03 270);
  --color-ink: oklch(20% 0.04 280);
  --color-accent: oklch(58% 0.15 65);
  --color-focus: oklch(58% 0.15 65);
  --radius-card: 8px;
  --radius-pill: 999px;
  --vibe-font-display: "Tomorrow", ui-sans-serif, system-ui, sans-serif;
  --vibe-font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --vibe-font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --vibe-gray-50: oklch(97% 0.025 280);
  --vibe-gray-100: oklch(93% 0.025 280);
  --vibe-gray-200: oklch(87% 0.025 280);
  --vibe-gray-300: oklch(78% 0.025 280);
  --vibe-gray-400: oklch(62% 0.025 280);
  --vibe-gray-500: oklch(50% 0.025 280);
  --vibe-gray-600: oklch(40% 0.025 280);
  --vibe-gray-700: oklch(30% 0.025 280);
  --vibe-gray-800: oklch(20% 0.025 280);
  --vibe-gray-900: oklch(13% 0.03 280);
  --vibe-blue-50: oklch(95% 0.03 75);
  --vibe-blue-100: oklch(90% 0.05 75);
  --vibe-blue-300: oklch(80% 0.1 75);
  --vibe-blue-400: oklch(82% 0.14 80);
  --vibe-blue-500: oklch(70% 0.15 72);
  --vibe-blue-600: oklch(58% 0.15 65);
  --vibe-blue-700: oklch(46% 0.13 65);
  --vibe-blue-900: oklch(30% 0.07 65);
}

/* galaxy · dark */
.dark[data-vibe="galaxy"] {
  --color-paper: oklch(12% 0.03 280);
  --color-paper-2: oklch(16% 0.035 280);
  --color-rule: oklch(30% 0.03 280);
  --color-muted: oklch(72% 0.02 280);
  --color-ink: oklch(94% 0.012 280);
  --color-accent: oklch(82% 0.14 80);
  --color-focus: oklch(80% 0.16 80);
}
```

- [ ] **Step 2: Replace `app/assets/css/main.css` with this full content**

```css
/* Tailwind CSS v4 — CSS-first config. Replaces the deleted tailwind.config.ts.
   Content detection is automatic in v4; no `content` globs needed. */
@import "tailwindcss";

/* Vibe design tokens (three vibes × light/dark). Plain custom properties, so
   it does not matter that they sit outside Tailwind's layers. */
@import "./tokens.css";

/* was: plugins: [typography] */
@plugin "@tailwindcss/typography";

/* was: darkMode: 'class'
   The `dark` class is set on <html> by app/stores/theme.ts applyTheme().
   Dark mode follows the Vietnam clock (see app/utils/vnTime.ts). */
@custom-variant dark (&:where(.dark, .dark *));

/* Whole-site retint with zero per-component edits: every existing gray-* and
   blue-* utility is pointed at the active vibe's tinted ramp (tokens.css).
   `inline` makes Tailwind emit `var(--vibe-gray-500)` into the utility itself
   instead of snapshotting a value, so the swap happens at runtime when
   html[data-vibe] changes. Only the shades the codebase uses are remapped
   (rg "gray-|blue-" app). */
@theme inline {
  --font-sans: var(--vibe-font-body);
  --font-display: var(--vibe-font-display);
  --font-mono: var(--vibe-font-mono);
  --color-gray-50: var(--vibe-gray-50);
  --color-gray-100: var(--vibe-gray-100);
  --color-gray-200: var(--vibe-gray-200);
  --color-gray-300: var(--vibe-gray-300);
  --color-gray-400: var(--vibe-gray-400);
  --color-gray-500: var(--vibe-gray-500);
  --color-gray-600: var(--vibe-gray-600);
  --color-gray-700: var(--vibe-gray-700);
  --color-gray-800: var(--vibe-gray-800);
  --color-gray-900: var(--vibe-gray-900);
  --color-blue-50: var(--vibe-blue-50);
  --color-blue-100: var(--vibe-blue-100);
  --color-blue-300: var(--vibe-blue-300);
  --color-blue-400: var(--vibe-blue-400);
  --color-blue-500: var(--vibe-blue-500);
  --color-blue-600: var(--vibe-blue-600);
  --color-blue-700: var(--vibe-blue-700);
  --color-blue-900: var(--vibe-blue-900);
}

/* v3 compatibility: v4 changed the default border and divide colour from
   gray-200 to currentColor. This repo has ~10 uncoloured border-* / divide-*
   usages that would otherwise render near-black. Restore the v3 default
   globally rather than touching every call site. */
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--vibe-gray-200, currentcolor);
  }

  /* Hallmark mobile floor: never a horizontal scrollbar, never `hidden`
     (hidden would break position: sticky descendants). */
  html,
  body {
    overflow-x: clip;
  }

  /* In-page #stop-N links on /about; reduced-motion users get instant jumps. */
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }

  :focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* @tailwindcss/typography bakes slate values into --tw-prose-*; point the
     ones that matter at the vibe so blog prose retints like everything else. */
  .prose {
    --tw-prose-body: var(--vibe-gray-700);
    --tw-prose-headings: var(--vibe-gray-900);
    --tw-prose-links: var(--vibe-blue-600);
    --tw-prose-invert-body: var(--vibe-gray-300);
    --tw-prose-invert-headings: var(--vibe-gray-50);
    --tw-prose-invert-links: var(--vibe-blue-400);
  }
}

/* Moved out of app/layouts/default.vue.
   These targeted .nuxt-link-active / .nuxt-link-exact-active — Nuxt 2 class
   names that Nuxt 3/4 never emit, so the rules have been dead. Retargeted at
   the vue-router names and scoped to <nav> so the header logo link and the tag
   pills (also NuxtLinks) are not restyled.

   They also have to live here rather than in a component <style> block:
   Tailwind v4 treats each component stylesheet as a separate module, so @apply
   there needs an explicit @reference. */
@layer components {
  nav a.router-link-active {
    @apply font-semibold;
  }

  nav a.router-link-exact-active {
    @apply text-blue-600 dark:text-blue-400;
  }

  /* C3 typographic link: a word, an arrow, a 1 px underline. No box. */
  .link {
    color: var(--color-ink);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    white-space: nowrap;
    transition: text-decoration-color var(--dur-micro) var(--ease-out);
  }

  .link:hover {
    text-decoration-color: var(--color-accent);
    text-decoration-thickness: 2px;
  }

  /* One page-load reveal, staggered by DOM index via --i. */
  .reveal {
    opacity: 0;
    transform: translateY(8px);
    animation: reveal var(--dur-long) var(--ease-out) forwards;
    animation-delay: calc(var(--i, 0) * 60ms);
  }

  @keyframes reveal {
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal {
      transform: none;
      animation-duration: 150ms;
      animation-delay: 0ms;
    }
  }
}

/* Per-vibe nav voice. The header markup is shared; only the dressing moves.
   terminal → N8 terminal-command: links read as CLI flags.
   cartoon  → rounded 2 px chips.
   galaxy   → untouched (the canvas is the mood). */
[data-vibe="terminal"] header nav a > span::before {
  content: "--";
  color: var(--color-accent);
}

[data-vibe="cartoon"] header nav a {
  border: 2px solid var(--color-rule);
  border-radius: var(--radius-pill);
}

/* Used by tag/ListNewest.vue's horizontal strip but never actually defined
   anywhere, so the scrollbar has always shown. */
@utility hide-scroll-bar {
  scrollbar-width: none;
}

.hide-scroll-bar::-webkit-scrollbar {
  display: none;
}

/* Global chrome, moved out of app/layouts/default.vue (and out of error.vue's
   <style scoped>, where ::-webkit-scrollbar never applied anyway). */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: var(--vibe-gray-500);
}

/* Disable the grey flash when tapping links and buttons on touch devices. */
* {
  -webkit-tap-highlight-color: rgb(0 0 0 / 0%);
}
```

- [ ] **Step 3: Add the font links to `nuxt.config.ts`**

Replace lines 94–96 (the `link:` array inside `app.head`):

```ts
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Vibe fonts. Three static stylesheets (one per vibe) rather than a
        // runtime swap: browsers only download font binaries for text that is
        // actually rendered, so the inactive vibes cost one small CSS fetch each.
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,700,100,1&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Tomorrow:wght@600&family=Geist:wght@400;600&family=Geist+Mono:wght@400&display=swap'
        }
      ]
```
(If Task 0 Step 4 returned 400 for the Fraunces URL, use `family=Fraunces:wght@700` instead.)

- [ ] **Step 4: Verify the retint in the browser**

```bash
npm run lint:style && npm run dev
```
Open http://localhost:3000/blog. In DevTools console:

```js
document.documentElement.dataset.vibe = 'cartoon'
getComputedStyle(document.body).backgroundColor   // changes to a warm cream (light) / cocoa (dark)
getComputedStyle(document.body).fontFamily        // starts with "Bricolage Grotesque"
document.documentElement.dataset.vibe = 'galaxy'
getComputedStyle(document.querySelector('nav a')).color
```
Expected: body background, text colour and font change on each assignment; blog page still readable in both modes (toggle `document.documentElement.classList.toggle('dark')`). Check 375 px width in device mode: no horizontal scrollbar.

- [ ] **Step 5: Commit**

```bash
git add app/assets/css/tokens.css app/assets/css/main.css nuxt.config.ts
git commit -m "feat(theme): vibe design tokens and whole-site Tailwind remap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: `VibeSwitch`, `SocialLinks`, header/footer/nav wiring

**Files:**
- Create: `app/components/VibeSwitch.vue`, `app/components/SocialLinks.vue`
- Modify: `app/components/Header.vue`, `app/components/NavBar.vue`, `app/components/Footer.vue`

**Interfaces:**
- Consumes: `useThemeStore` (`vibe`, `setVibe`, `nextVibe`), `VIBES` from Task 2.
- Produces: `<VibeSwitch variant="segmented" | "icon">` (default `icon`); `<SocialLinks size="sm" | "lg">` (default `sm`). (The layout mount of the 3D scene is Phase 2, Task 7 — nothing in Phase 1 references `VibeScene`.)

- [ ] **Step 1: Create `app/components/VibeSwitch.vue`**

```vue
<template>
  <fieldset v-if="variant === 'segmented'" class="vibe-switch">
    <legend class="sr-only">Vibe</legend>
    <label v-for="vibe in VIBES" :key="vibe" class="vibe-switch__option">
      <input
        class="sr-only"
        type="radio"
        name="vibe"
        :value="vibe"
        :checked="store.vibe === vibe"
        @change="store.setVibe(vibe)"
      >
      <span class="vibe-switch__label">{{ LABELS[vibe] }}</span>
    </label>
  </fieldset>

  <button
    v-else
    type="button"
    class="vibe-switch-icon"
    :aria-label="`Vibe: ${LABELS[store.vibe]}. Switch to ${LABELS[nextVibe]}`"
    :title="`Switch vibe (now: ${LABELS[store.vibe]})`"
    @click="store.nextVibe()"
  >
    <svg v-if="store.vibe === 'terminal'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6l6 6-6 6M12 18h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg v-else-if="store.vibe === 'cartoon'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.2 3.5 3.5 0 0 0 7 18z" fill="currentColor"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-20 12 12)"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import {VIBES, useThemeStore, type Vibe} from '~/stores/theme'

withDefaults(defineProps<{variant?: 'segmented' | 'icon'}>(), {variant: 'icon'})

const LABELS: Record<Vibe, string> = {
  terminal: 'Terminal',
  cartoon: 'Cartoon',
  galaxy: 'Galaxy'
}

const store = useThemeStore()
const nextVibe = computed(() => VIBES[(VIBES.indexOf(store.vibe) + 1) % VIBES.length])
</script>

<style scoped>
/* States: default · hover · focus-visible · active (pressed) · checked.
   disabled / loading / error / success do not apply to a theme control. */
.vibe-switch {
  display: inline-flex;
  gap: var(--space-3xs);
  padding: var(--space-3xs);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
}

.vibe-switch__option {
  display: inline-flex;
}

.vibe-switch__label {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 var(--space-sm);
  border-radius: var(--radius-pill);
  font-family: var(--vibe-font-mono);
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
}

.vibe-switch__label:hover {
  color: var(--color-ink);
}

.vibe-switch__option:active .vibe-switch__label {
  transform: translateY(1px);
}

input:checked + .vibe-switch__label {
  background: var(--color-ink);
  color: var(--color-paper);
}

input:focus-visible + .vibe-switch__label {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.vibe-switch-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  background: var(--color-paper);
  transition: border-color var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out);
}

.vibe-switch-icon:hover {
  border-color: var(--color-accent);
}

.vibe-switch-icon:active {
  transform: translateY(1px);
}

.vibe-switch-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
```

- [ ] **Step 2: Create `app/components/SocialLinks.vue`**

The seven anchors are the ones currently duplicated in `Footer.vue:6-64` and `about/index.vue:55-172`. Copy the `<path d="…">` data **verbatim from `app/components/Footer.vue`** for each icon (Mail, Telegram, Signal, Discord, Github, Facebook, Linkedin — same order, same `href`, same `viewBox`). The component shell:

```vue
<template>
  <ul class="social" :class="`social--${size}`">
    <li v-for="item in LINKS" :key="item.label">
      <a target="_blank" rel="noopener noreferrer" :href="item.href">
        <span class="sr-only">{{ item.label }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" :viewBox="item.viewBox" fill="currentColor" class="social__icon" aria-hidden="true">
          <path :d="item.path"/>
        </svg>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
withDefaults(defineProps<{size?: 'sm' | 'lg'}>(), {size: 'sm'})

// Icon paths are the ones that lived inline in Footer.vue and about/index.vue.
const LINKS = [
  {
    label: 'Mail',
    href: 'mailto:quocdaijr@gmail.com',
    viewBox: '0 0 16 16',
    path: 'M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z'
  },
  {
    label: 'Telegram',
    href: 'https://t.me/quocdaijr',
    viewBox: '0 0 16 16',
    path: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z'
  },
  {
    label: 'Signal',
    href: 'https://signal.me/#eu/U1eIvUn29-2TB8fu6lTq-nxX0qOa3LNUCoyywDx_WVvEdYF7C5NK15eKfieS3TDe',
    viewBox: '0 0 50 50',
    path: 'M 25 2 L 24.78125 2.0019531 L 24.796875 4.0019531 L 25 4 C 26.529 4 28.054203 4.1651875 29.533203 4.4921875 L 29.966797 2.5390625 C 28.345797 2.1810625 26.674 2 25 2 z M 22.695312 2.1132812 C 20.955313 2.2872813 19.241656 2.6606562 17.597656 3.2226562 L 18.242188 5.1152344 C 19.741187 4.6022344 21.307531 4.2625156 22.894531 4.1035156 L 22.695312 2.1132812 z M 31.984375 3.0859375 L 31.376953 4.9902344 C 32.893953 5.4762344 34.349078 6.1370312 35.705078 6.9570312 L 36.740234 5.2460938 C 35.250234 4.3450938 33.649375 3.6189375 31.984375 3.0859375 z M 15.648438 3.9921875 C 14.051438 4.7111875 12.545875 5.6147344 11.171875 6.6777344 L 12.394531 8.2597656 C 13.645531 7.2917656 15.015703 6.4694531 16.470703 5.8144531 L 15.648438 3.9921875 z M 38.476562 6.4121094 L 37.285156 8.0195312 C 38.566156 8.9705312 39.727422 10.068203 40.732422 11.283203 L 42.273438 10.009766 C 41.165437 8.6707656 39.887563 7.4591094 38.476562 6.4121094 z M 25 7 C 15.626 7 8 14.178 8 23 C 8 28.129 10.606 32.9265 15 35.9375 L 15 41 C 15 41.357 15.19 41.686234 15.5 41.865234 C 15.654 41.954234 15.827 42 16 42 C 16.172 42 16.344047 41.955234 16.498047 41.865234 L 21.929688 38.738281 C 22.939688 38.912281 23.972 39 25 39 C 34.374 39 42 31.822 42 23 C 42 14.178 34.374 7 25 7 z M 9.578125 8.0371094 C 8.295125 9.2421094 7.1675156 10.594641 6.2285156 12.056641 L 7.9121094 13.136719 C 8.7631094 11.811719 9.7842656 10.586141 10.947266 9.4941406 L 9.578125 8.0371094 z M 43.529297 11.689453 L 41.869141 12.804688 C 42.757141 14.125688 43.469281 15.54825 43.988281 17.03125 L 45.878906 16.371094 C 45.302906 14.727094 44.511297 13.152453 43.529297 11.689453 z M 5.1855469 13.878906 C 4.3875469 15.450906 3.8005 17.113266 3.4375 18.822266 L 5.3945312 19.238281 C 5.7205312 17.698281 6.24975 16.200203 6.96875 14.783203 L 5.1855469 13.878906 z M 46.466797 18.392578 L 44.519531 18.849609 C 44.838531 20.202609 45 21.6 45 23 C 45 23.184 44.996234 23.366828 44.990234 23.548828 L 46.990234 23.609375 C 46.996234 23.407375 47 23.204 47 23 C 47 21.445 46.819797 19.895578 46.466797 18.392578 z M 3.109375 20.900391 C 3.037375 21.595391 3 22.301 3 23 C 3 24.052 3.0820938 25.109578 3.2460938 26.142578 L 5.2226562 25.830078 C 5.0756563 24.899078 5 23.948 5 23 C 5 22.37 5.0336563 21.733422 5.0976562 21.107422 L 3.109375 20.900391 z M 44.835938 25.4375 C 44.624937 27.0005 44.207703 28.533141 43.595703 29.994141 L 45.441406 30.767578 C 46.120406 29.144578 46.585359 27.441078 46.818359 25.705078 L 44.835938 25.4375 z M 5.6152344 27.683594 L 3.6835938 28.199219 C 4.1335938 29.887219 4.8047344 31.519828 5.6777344 33.048828 L 7.4140625 32.056641 C 6.6270625 30.676641 6.0222344 29.205594 5.6152344 27.683594 z M 42.775391 31.703125 C 42.023391 33.083125 41.092859 34.377828 40.005859 35.548828 L 41.472656 36.908203 C 42.671656 35.615203 43.69925 34.185156 44.53125 32.660156 L 42.775391 31.703125 z M 8.4375 33.65625 L 6.8105469 34.818359 C 7.7425469 36.125359 8.830875 37.330297 10.046875 38.404297 L 10.457031 42.427734 L 12.449219 42.224609 L 11.996094 37.806641 C 11.969094 37.549641 11.844437 37.313484 11.648438 37.146484 C 10.433437 36.113484 9.3535 34.93925 8.4375 33.65625 z M 38.646484 36.876953 C 37.466484 37.924953 36.153094 38.837891 34.746094 39.587891 L 35.6875 41.351562 C 37.2325 40.527563 38.675609 39.524094 39.974609 38.371094 L 38.646484 36.876953 z M 33.023438 40.402344 C 31.562437 41.012344 30.023172 41.454797 28.451172 41.716797 L 28.779297 43.689453 C 30.504297 43.402453 32.191922 42.917047 33.794922 42.248047 L 33.023438 40.402344 z M 22.847656 41.890625 C 22.680656 41.874625 22.499844 41.900703 22.339844 41.970703 L 21.326172 42.419922 L 22.138672 44.248047 L 22.910156 43.904297 C 24.179156 44.019297 25.464078 44.0285 26.705078 43.9375 L 26.558594 41.943359 C 25.341594 42.031359 24.083656 42.015625 22.847656 41.890625 z M 19.5 43.232422 L 14.927734 45.259766 L 15.738281 47.087891 L 20.310547 45.060547 L 19.5 43.232422 z M 12.652344 44.212891 L 10.662109 44.417969 L 11.005859 47.753906 C 11.038859 48.072906 11.222047 48.354625 11.498047 48.515625 C 11.653047 48.605625 11.826 48.650391 12 48.650391 C 12.138 48.650391 12.275297 48.623453 12.404297 48.564453 L 13.910156 47.896484 L 13.099609 46.068359 L 12.853516 46.177734 L 12.652344 44.212891 z'
  },
  {
    label: 'Discord',
    href: 'https://discord.com/users/quocdaijr',
    viewBox: '0 0 50 50',
    path: 'M 41.625 10.769531 C 37.644531 7.566406 31.347656 7.023438 31.078125 7.003906 C 30.660156 6.96875 30.261719 7.203125 30.089844 7.589844 C 30.074219 7.613281 29.9375 7.929688 29.785156 8.421875 C 32.417969 8.867188 35.652344 9.761719 38.578125 11.578125 C 39.046875 11.867188 39.191406 12.484375 38.902344 12.953125 C 38.710938 13.261719 38.386719 13.429688 38.050781 13.429688 C 37.871094 13.429688 37.6875 13.378906 37.523438 13.277344 C 32.492188 10.15625 26.210938 10 25 10 C 23.789063 10 17.503906 10.15625 12.476563 13.277344 C 12.007813 13.570313 11.390625 13.425781 11.101563 12.957031 C 10.808594 12.484375 10.953125 11.871094 11.421875 11.578125 C 14.347656 9.765625 17.582031 8.867188 20.214844 8.425781 C 20.0625 7.929688 19.925781 7.617188 19.914063 7.589844 C 19.738281 7.203125 19.34375 6.960938 18.921875 7.003906 C 18.652344 7.023438 12.355469 7.566406 8.320313 10.8125 C 6.214844 12.761719 2 24.152344 2 34 C 2 34.175781 2.046875 34.34375 2.132813 34.496094 C 5.039063 39.605469 12.972656 40.941406 14.78125 41 C 14.789063 41 14.800781 41 14.8125 41 C 15.132813 41 15.433594 40.847656 15.621094 40.589844 L 17.449219 38.074219 C 12.515625 36.800781 9.996094 34.636719 9.851563 34.507813 C 9.4375 34.144531 9.398438 33.511719 9.765625 33.097656 C 10.128906 32.683594 10.761719 32.644531 11.175781 33.007813 C 11.234375 33.0625 15.875 37 25 37 C 34.140625 37 38.78125 33.046875 38.828125 33.007813 C 39.242188 32.648438 39.871094 32.683594 40.238281 33.101563 C 40.601563 33.515625 40.5625 34.144531 40.148438 34.507813 C 40.003906 34.636719 37.484375 36.800781 32.550781 38.074219 L 34.378906 40.589844 C 34.566406 40.847656 34.867188 41 35.1875 41 C 35.199219 41 35.210938 41 35.21875 41 C 37.027344 40.941406 44.960938 39.605469 47.867188 34.496094 C 47.953125 34.34375 48 34.175781 48 34 C 48 24.152344 43.785156 12.761719 41.625 10.769531 Z M 18.5 30 C 16.566406 30 15 28.210938 15 26 C 15 23.789063 16.566406 22 18.5 22 C 20.433594 22 22 23.789063 22 26 C 22 28.210938 20.433594 30 18.5 30 Z M 31.5 30 C 29.566406 30 28 28.210938 28 26 C 28 23.789063 29.566406 22 31.5 22 C 33.433594 22 35 23.789063 35 26 C 35 28.210938 33.433594 30 31.5 30 Z'
  },
  {
    label: 'Github',
    href: 'https://github.com/quocdaijr',
    viewBox: '0 0 16 16',
    path: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z'
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/quocdaijr',
    viewBox: '0 0 16 16',
    path: 'M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z'
  },
  {
    label: 'Linkedin',
    href: 'https://www.linkedin.com/in/quocdaijr',
    viewBox: '0 0 16 16',
    path: 'M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z'
  }
] as const
</script>

<style scoped>
.social {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
  list-style: none;
  margin: 0;
  padding: 0;
}

.social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  color: var(--color-ink);
  transition: color var(--dur-micro) var(--ease-out);
}

.social a:hover {
  color: var(--color-accent);
}

.social--sm .social__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.social--lg .social__icon {
  width: 2rem;
  height: 2rem;
}
</style>
```
Sanity check after writing: `rg -c "M 25 2 L 24.78125" app/components/SocialLinks.vue` prints `1` and `diff <(rg -o 'd="[^"]+"' app/components/Footer.vue | sort) <(rg -o "path: '[^']+'" app/components/SocialLinks.vue | sed "s/path: '/d=\"/; s/'$/\"/" | sort)` prints nothing (the seven paths match the footer byte for byte).

- [ ] **Step 3: Edit `app/components/Header.vue`** (anchors verified at commit `3472b3f`)

Edit 3a — desktop control, `Header.vue:12-26`. FIND:

```vue
      <div class="w-1/12 flex justify-end">
        <button
          :class="'w-8 h-8 rounded-full text-white flex items-center transition duration-300 shadow-xl hover:scale-125 ' + (isDarkMode ? 'bg-gray-500': 'bg-yellow-500')"
          @click="toggleTheme"
        >
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
```
REPLACE:
```vue
      <div class="w-1/12 flex justify-end">
        <VibeSwitch variant="icon"/>
      </div>
```

Edit 3b — mobile control, `Header.vue:59-73`. FIND: the identical `<button … @click="toggleTheme">…</button>` block, this time wrapped in `<div class="w-2/12 flex justify-end">`. REPLACE:
```vue
      <div class="w-2/12 flex justify-end">
        <VibeSwitch variant="icon"/>
      </div>
```

Edit 3c — `Header.vue:97-108` computed block. FIND:
```js
  computed: {
    themeStore() {
      return useThemeStore()
    },
    isDarkMode() {
      return this.themeStore.isDarkMode
    },
    logoSrc() {
      // Fallback to light logo if theme store isn't initialized
      return this.themeStore?.logoSrc || '/logo.svg'
    }
  },
```
REPLACE:
```js
  computed: {
    themeStore() {
      return useThemeStore()
    },
    logoSrc() {
      // Fallback to light logo if theme store isn't initialized
      return this.themeStore?.logoSrc || '/logo.svg'
    }
  },
```

Edit 3d — `Header.vue:126-136` methods block. FIND:
```js
  methods: {
    toggleTheme() {
      this.themeStore.toggleTheme()
    },
    toggleNav() {
      this.isOpenMenu = !this.isOpenMenu
    },
    closeNav() {
      this.isOpenMenu = false
    }
  }
```
REPLACE:
```js
  methods: {
    toggleNav() {
      this.isOpenMenu = !this.isOpenMenu
    },
    closeNav() {
      this.isOpenMenu = false
    }
  }
```

- [ ] **Step 4: Edit `app/components/NavBar.vue:7-10`** — FIND:

```vue
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
      <span class="w-full" @click="methodToggleNav">About</span>
    </NuxtLink>
```
REPLACE (the About link stays; the switch is appended under it, inside the mobile `<nav>` only):
```vue
    <NuxtLink to="/about"
              class="flex items-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">
      <span class="w-full" @click="methodToggleNav">About</span>
    </NuxtLink>
    <div class="px-5 py-3">
      <VibeSwitch variant="segmented"/>
    </div>
```

- [ ] **Step 5: Edit `app/components/Footer.vue`**

Edit 5a — `Footer.vue:5-65`. FIND the block that starts with
```vue
      <div class="flex mb-3 space-x-4">
        <a target="_blank" rel="noopener noreferrer" href="mailto:quocdaijr@gmail.com">
```
and ends with the `</div>` on line 65, immediately before `      <Clock />`. REPLACE the whole block with:
```vue
      <SocialLinks size="sm" class="mb-3"/>
```

Edit 5b — `Footer.vue:119-128`. FIND:
```js
  methods: {
    scrollTop() {
      this.intervalId = setInterval(() => {
        if (window.pageYOffset === 0) {
          clearInterval(this.intervalId)
        }
        window.scroll(0, window.pageYOffset - 50)
      }, 20)
    }
  }
```
REPLACE:
```js
  methods: {
    scrollTop() {
      // Native smooth scroll; the old setInterval stepper never cleared itself
      // when the user scrolled during the animation.
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }
```

- [ ] **Step 6: Verify**

```bash
npm run lint && npm run typecheck && npm run dev
```
Open `/blog` at 1280 px: header shows the round icon button at the far right; clicking cycles terminal → cartoon → galaxy and the whole page retints and changes font. At 375 px: hamburger opens the drawer, the segmented control sits under "About", the three radios work with keyboard (Tab to the group, arrow keys move selection). Footer icons unchanged visually; scroll-to-top glides. The old home page (photo, name, quote, two buttons) still renders, now in vibe colours.

- [ ] **Step 7: Run the existing e2e mobile menu suite (header selectors must still hold)**

```bash
npx playwright test e2e/mobile-menu.spec.ts
```
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add app/components/VibeSwitch.vue app/components/SocialLinks.vue app/components/Header.vue app/components/NavBar.vue app/components/Footer.vue
git commit -m "feat(theme): vibe switcher replaces the dark-mode toggle

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Profile data module

**Files:**
- Create: `app/data/profile.ts`

**Interfaces:**
- Produces typed, immutable constants consumed by Task 10/11: `PROFILE`, `SKILLS`, `OTHER_SKILLS`, `TIMELINE`, `PROJECTS`, `CONTACT`, `QUOTE`. All copy is **verbatim** from `app/pages/about/index.vue` and `app/pages/index.vue` at commit `3472b3f`.

- [ ] **Step 1: Create the file**

```ts
// app/data/profile.ts
// Every string on / and /about lives here so the page templates stay small.
// Copy is verbatim from the pre-redesign pages; edit content here, not in Vue.

export const PROFILE = {
  name: 'Nguyen Quoc Dai',
  displayName: 'Quoc Dai Nguyen',
  role: 'Senior Backend Software Engineer',
  photo: '/profile.jpg',
  photoAlt: 'Quoc Dai Nguyen - Senior Backend Software Engineer Profile Photo',
  summary:
    'Backend Software Engineer with 6+ years of experience building and operating high-performance backend systems for media and e-commerce platforms. Strong background in system design, performance optimization, background processing, and third-party integrations. Experienced in owning and operating production systems at scale.'
} as const

export const QUOTE = {
  text: 'First, solve the problem. Then, write the code',
  author: 'John Johnson'
} as const

export const SKILLS = [
  {group: 'Programming Languages', expert: 'PHP (Yii2, Laravel)', proficient: 'Node.js (NestJS, AdonisJS), Python, JavaScript'},
  {group: 'Database & Storage', expert: 'MySQL, Redis, Elasticsearch', proficient: 'MongoDB, Database optimization, Query performance tuning'},
  {group: 'Messaging & Streaming', expert: 'RabbitMQ', proficient: 'Kafka'},
  {group: 'DevOps & Infrastructure', expert: 'Linux, Docker, Nginx, Git, Supervisor', proficient: 'Kubernetes, CI/CD Pipelines, AWS'},
  {group: 'Frontend Technologies', proficient: 'Vue.js, Nuxt.js, HTML5, CSS3, Tailwind CSS'},
  {
    group: 'Third-party Integrations',
    note: 'Shopify, E-commerce platforms, Payment gateways, Analytics & tracking services, Customer engagement tools, Real-time communication systems, Project management platforms, API testing tools'
  }
] as const

export const OTHER_SKILLS = [
  {label: 'Production Readiness', text: 'Experienced in system observability, monitoring, and incident response for production environments'},
  {label: 'Team Collaboration', text: 'Strong communication skills and technical knowledge sharing across cross-functional teams'},
  {label: 'Problem Solving', text: 'Strong analytical skills in debugging complex systems and architecting scalable solutions for high-traffic applications'},
  {label: 'Continuous Learning', text: 'Actively stay current with emerging technologies and implement modern development practices'},
  {label: 'Interests', text: 'Sports (Football, Running), Technology trends, System architecture'}
] as const

export const TIMELINE = [
  {
    period: '08/2014 - 12/2018',
    org: 'HCMC University of Natural Resources and Environment',
    kind: 'education',
    major: 'Information Technology',
    degree: "Engineer's Degree",
    achievements: []
  },
  {
    period: '08/2018 - 07/2019',
    org: 'Applancer JSC - Onsite at Tuoi Tre Newspaper',
    kind: 'work',
    position: 'Web Developer',
    technologies: 'PHP, Yii2 Framework, MySQL, Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor',
    achievements: [
      'Actively maintained and enhanced backend components of production web platforms',
      'Participated directly in developing features for high-traffic websites operating in production environments',
      'Involved in development and deployment workflows within Linux-based and containerized setups'
    ]
  },
  {
    period: '07/2019 - 08/2022',
    org: 'Tuoi Tre Newspaper',
    kind: 'work',
    position: 'Software Development Engineer',
    technologies:
      'PHP, Python, Yii2 Framework, Django Rest Framework, MySQL, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry',
    achievements: [
      'Maintained and evolved backend systems for high-traffic news platforms operating in production environments',
      'Designed database schemas and developed backend APIs and internal tools for content and editorial workflows',
      'Built reusable internal packages and modular backend components to improve maintainability and development efficiency',
      'Developed background processing and automation tools for data synchronization, transformation, and aggregation',
      'Implemented and operated production deployments, service configurations, monitoring, and logging to ensure system reliability',
      'Researched and implemented a Single Sign-On (SSO) authentication solution across multiple platforms'
    ]
  },
  {
    period: '08/2022 - Present',
    org: 'FireGroup Technology',
    kind: 'work',
    position: 'Senior Backend Software Engineer',
    technologies:
      'PHP, Python, Node.js, Laravel Framework, NestJS, MySQL, Redis, RabbitMQ, Kafka, GitLab, Linux, Docker, Kubernetes, Supervisor, Sentry, Rancher',
    thirdParties: 'Shopify, Jira, Segment, CustomerIO, Crisp Chat',
    achievements: [
      'Designed and developed backend services and background processing systems for Shopify-based applications, with a focus on performance and reliability',
      'Architected database schemas and core backend components, contributing to technical planning and implementation decisions across backend systems',
      'Owned and maintained Shopify application backends, ensuring system stability, scalability, and continuous service delivery',
      'Integrated third-party platforms and internal services to extend product capabilities and streamline business workflows',
      'Collaborated with DevOps teams to configure Kubernetes deployments and integrate monitoring and observability for backend services',
      'Utilized AI-assisted development tools to support code generation, debugging, and daily development productivity'
    ]
  }
] as const

export const PROJECTS = [
  {
    name: 'OneMobile ‑ Mobile App Builder',
    image: '/images/projects/om.webp',
    alt: 'OneMobile',
    url: 'https://onemobile.ai',
    description: 'Turn your store into a mobile app with OneMobile. Scale brand, reduce ad costs & retain customers.',
    role: 'Backend Software Engineer - Backend services, analytics & reporting, third-party integrations.'
  },
  {
    name: 'OneLoyalty: Loyalty & Rewards',
    image: '/images/projects/ol.webp',
    alt: 'OneLoyalty',
    url: 'https://oneloyalty.io',
    description: 'Easily run loyalty and referral programs that drive sales, customer retention rate & lifetime value.',
    role: 'Backend Software Engineer - Built core backend systems and business logic from scratch.'
  },
  {
    name: 'Transcy: AI Language Translate',
    image: '/images/projects/tc.webp',
    alt: 'Transcy',
    url: 'https://transcy.io',
    description: "Translate store's language with OpenAI, DeepL, Gemini, Baidu, etc. Convert Currency to sell globally",
    role: 'Backend Software Engineer - Translation services, performance optimization, AI provider integrations.'
  },
  {
    name: 'Swift SEO Page Speed Optimizer',
    image: '/images/projects/sw.webp',
    alt: 'Swift',
    url: 'https://onecommerce.io/swift',
    description: 'Easily boost your SEO and page speed. Websites that rank higher and load faster convert better.',
    role: 'Backend Software Engineer - Backend rebuild and SEO feature development.'
  },
  {
    name: 'FireGroup - OneExpert Internal Tools & Systems',
    image: '/images/projects/fg.webp',
    alt: 'FireGroup Internal',
    description: 'Internal backend platform enabling CS, TS, and Expert teams to deliver Expert services across FireGroup applications.',
    role: 'Backend Software Engineer - Designed and built internal backend systems, integrated across FireGroup products.'
  },
  {
    name: 'SSO Tuoitre Authentication System',
    image: '/images/projects/tt.webp',
    alt: 'SSO Tuoitre',
    url: 'https://sso.tuoitre.vn',
    description: 'Centralized single sign-on platform for Tuoi Tre digital services.',
    role: 'Software Development Engineer - Designed and implemented SSO architecture, authentication flows, and security mechanisms.'
  },
  {
    name: 'Tuoi Tre Rao Vat',
    image: '/images/projects/ttrv.webp',
    alt: 'Tuoi Tre Rao Vat',
    url: 'https://raovat.tuoitre.vn',
    description: 'Online marketplace platform operated by Tuoi Tre Newspaper.',
    role: 'Software Development Engineer - Maintained existing backend features and developed new functionalities.'
  },
  {
    name: 'Tuoi Tre Cuoi',
    image: '/images/projects/ttc.webp',
    alt: 'Tuoi Tre Cuoi',
    url: 'https://cuoi.tuoitre.vn',
    description: 'Humor and satire content platform under Tuoi Tre Newspaper.',
    role: 'Software Development Engineer - Developed and maintained backend features for content and comment management.'
  },
  {
    name: 'Tuoi Tre News',
    image: '/images/projects/ttn.webp',
    alt: 'Tuoi Tre News',
    url: 'https://news.tuoitre.vn',
    description: 'English news website of Tuoi Tre Newspaper',
    role: 'Software Development Engineer - Maintained and enhanced backend features to support content delivery.'
  },
  {
    name: 'Tuoi Tre Internal Tools',
    image: '/images/projects/tt.webp',
    alt: 'Tuoi Tre Internal',
    description: 'Internal systems supporting newsroom and operational workflows.',
    role: 'Software Development Engineer - Built internal tools from scratch and migrated legacy systems to modern backend architectures.'
  }
] as const

export const CONTACT = [
  {label: 'Name', value: 'Quoc Dai Nguyen'},
  {label: 'Phone', value: '+84969-113-505', href: 'tel:+84969113505'},
  {label: 'Email', value: 'quocdaijr@gmail.com', href: 'mailto:quocdaijr@gmail.com'},
  {label: 'Experience', value: '6+ years in web development'},
  {label: 'Role', value: 'Senior Backend Software Engineer'},
  {label: 'Date of Birth', value: '27/10/1996'},
  {label: 'Address', value: 'My Chanh Commune, Phu My District, Binh Dinh Province'}
] as const

export type TimelineEntry = (typeof TIMELINE)[number]
export type Project = (typeof PROJECTS)[number]
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/data/profile.ts
git commit -m "refactor(about): move profile copy into a data module

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
(The module is consumed by Tasks 8 and 10 in later phases; it lands here so Phase 2 and 3 branches start from merged data.)

---

### Task 5.1: Phase 1 end-to-end tests and phase gate

**Files:**
- Modify: `e2e/layout.spec.ts:40-55`
- Create: `e2e/vibe.spec.ts`

- [ ] **Step 1: Replace the dark-mode test in `e2e/layout.spec.ts` (lines 40–55)**

FIND (the whole existing test):
```ts
test('dark mode variant applies from the html class', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'runs once, on desktop')

  await page.addInitScript(() => localStorage.setItem('isDarkMode', 'true'))
  await page.goto('/blog')

  await expect(page.locator('html')).toHaveClass(/dark/)

  // body carries `dark:bg-gray-900`; if @custom-variant were mis-wired the
  // computed background would stay at the light value.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).not.toBe('rgb(249, 250, 251)') // gray-50, the light value
})
```
REPLACE:
```ts
// Dark mode follows the Vietnam clock (UTC+7), not a stored preference.
const VN_NIGHT = new Date('2026-10-01T15:00:00Z') // 22:00 in Vietnam
const VN_NOON = new Date('2026-10-01T05:00:00Z') // 12:00 in Vietnam

test('dark mode applies at night in Vietnam', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'runs once, on desktop')

  await page.clock.install({time: VN_NIGHT})
  await page.goto('/blog')

  await expect(page.locator('html')).toHaveClass(/dark/)

  // body carries `dark:bg-gray-900`; the remapped token is a dark tinted paper.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).not.toBe('rgb(249, 250, 251)')
})

test('light mode applies at noon in Vietnam', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'runs once, on desktop')

  await page.clock.install({time: VN_NOON})
  await page.goto('/blog')

  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
```

- [ ] **Step 2: Create `e2e/vibe.spec.ts`** (Phase 2 appends one more test to this file)

```ts
import {expect, test} from '@playwright/test'

const HTML = 'html'
const HAMBURGER = 'header button.w-10.h-10'
const SEGMENTED_RADIO = (name: string) => `input[type=radio][name=vibe][value=${name}]`

test.describe('vibe switcher', () => {
  test('defaults to terminal and the header button cycles without console errors', async ({page}) => {
    const errors: string[] = []
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/blog')
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')

    const button = page.getByRole('button', {name: /^Vibe:/}).first()
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'terminal')

    expect(errors).toEqual([])
  })

  test('cartoon vibe swaps the body font and persists across reloads', async ({page}) => {
    await page.goto('/blog')
    const button = page.getByRole('button', {name: /^Vibe:/}).first()
    await button.click()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')

    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(font).toContain('Bricolage Grotesque')

    await page.reload()
    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
  })

  test('the mobile drawer exposes the segmented control', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'drawer exists only below md')

    await page.goto('/blog')
    await page.click(HAMBURGER)
    await page.locator(SEGMENTED_RADIO('galaxy')).check({force: true})

    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'galaxy')
  })
})
```

- [ ] **Step 3: Run everything**

```bash
npm run lint && npm run typecheck && npm run test:coverage && npx playwright test
```
Expected: all green; coverage ≥ 80 % on `app/utils` and `app/stores`.

- [ ] **Step 4: Commit**

```bash
git add e2e/layout.spec.ts e2e/vibe.spec.ts
git commit -m "test(e2e): clock-driven dark mode and vibe switching

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 5: Phase 1 gate — push and open the PR**

```bash
git push -u origin feature/dainq/vibes-1-theme
gh pr create --base main --title "feat(theme): three vibes with clock-driven dark mode" --body-file - <<'EOF'
## Summary
- Light/dark follows the clock in UTC+7 (`app/utils/vnTime.ts`); the sun/moon toggle is replaced by a vibe switcher.
- Three vibes (terminal / cartoon / galaxy): OKLCH tokens + fonts retint the whole site through a Tailwind `@theme inline` remap of the gray/blue ramps.
- Dead `@tsparticles/*` removed; `three` added for Phase 2 (not yet imported anywhere).
- About-page copy moved into `app/data/profile.ts` (no visual change yet).

## Test plan
- [ ] `npm run test:coverage` ≥ 80 % on utils/stores
- [ ] `npx playwright test` (mobile + desktop)
- [ ] Manual: `/blog`, `/about`, `/legacy-blogs` in all three vibes, both modes (`document.documentElement.classList.toggle('dark')`), 320/375/414/768 px

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```
Squash-merge once green. Phase 2 branches from the updated `main`.

---

# Phase 2 — 3D scenes and the home page

Branch `feature/dainq/vibes-2-scenes`, cut from `main` after Phase 1 merged:

```bash
git checkout main && git pull --ff-only && git checkout -b feature/dainq/vibes-2-scenes
```
Deliverable: the three scenes render behind `/` and `/about`; `/` becomes the marquee hero. Tasks 6 → 8.1.

### Task 6: Scene contract and the three scenes

**Files:**
- Create: `app/scenes/types.ts`, `app/scenes/terminal.ts`, `app/scenes/cartoon.ts`, `app/scenes/galaxy.ts`

**Interfaces:**
- Produces, consumed by Task 7:
  ```ts
  export interface SceneOptions { isDark: boolean; aspect: number }
  export interface ScenePointer { x: number; y: number }          // −1..1, smoothed by the stage
  export interface VibeScene {
    scene: Scene
    camera: PerspectiveCamera
    /** dt: clamped seconds since last frame · elapsed: seconds since build · progress: 0..1 smoothed journey position */
    update(dt: number, elapsed: number, progress: number, pointer: ScenePointer): void
  }
  export type SceneFactory = (options: SceneOptions) => VibeScene
  createTerminalScene, createCartoonScene, createGalaxyScene: SceneFactory
  ```
- Scenes own nothing outside their `scene` graph; the stage disposes the graph generically (geometry, materials, textures). Every scene positions its own camera inside `update()` from `progress` and `pointer`, so the stage never touches camera position.

- [ ] **Step 1: `app/scenes/types.ts`**

```ts
// app/scenes/types.ts
import type {PerspectiveCamera, Scene} from 'three'

export interface SceneOptions {
  isDark: boolean
  aspect: number
}

/** Normalised pointer position, −1..1 on both axes, already smoothed by the stage. */
export interface ScenePointer {
  x: number
  y: number
}

export interface VibeScene {
  scene: Scene
  camera: PerspectiveCamera
  /**
   * Advance the scene one frame and place the camera.
   * @param dt seconds since the previous frame, clamped to 0.1
   * @param elapsed seconds since the scene was built
   * @param progress 0..1 position along the /about journey (0 on /)
   * @param pointer smoothed pointer, −1..1
   */
  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer): void
}

export type SceneFactory = (options: SceneOptions) => VibeScene

/** Exponential approach — frame-rate independent lerp. */
export function approach(current: number, target: number, dt: number, speed: number): number {
  return current + (target - current) * Math.min(1, dt * speed)
}
```

- [ ] **Step 2: `app/scenes/terminal.ts`** — a wireframe terrain flowing toward the viewer under a wireframe icosahedron, fogged in the vibe's paper colour.

```ts
// app/scenes/terminal.ts
import * as THREE from 'three'
import type {SceneFactory} from './types'

// Hex because THREE.Color cannot parse oklch(); mirrors tokens.css terminal.
const PALETTE = {
  dark: {bg: 0x0b1410, grid: 0x39ff8a, solid: 0x1b3b2a},
  light: {bg: 0xeef5f0, grid: 0x13884a, solid: 0xb9d6c4}
} as const

const GRID_SIZE = 80
const GRID_SEGMENTS = 60
const GRID_Y = -2
const FLOW_SPEED = 2.2 // world units per second toward the camera
const FOG_NEAR = 6
const FOG_FAR = 46
const ROAD_HALF_WIDTH = 6
const Z_PERIODS = 3 // height must repeat every GRID_SIZE in z so the two tiles loop seamlessly
const CAMERA_FOV = 60
const CAMERA_BASE_Y = 1.6
const CAMERA_BASE_Z = 8
const JOURNEY_RISE = 9 // how high the camera climbs over the /about journey
const JOURNEY_ADVANCE = 6
const POINTER_SWAY = 0.6
const ICO_POSITION = new THREE.Vector3(0, 1.4, -10)
const ICO_SPIN = 0.25

function heightAt(x: number, z: number): number {
  const road = Math.min(1, Math.abs(x) / ROAD_HALF_WIDTH)
  const zWave = Math.cos((z * Z_PERIODS * Math.PI * 2) / GRID_SIZE)
  return road * (Math.sin(x * 0.35) * 1.4 + zWave * 0.9)
}

function buildTerrain(color: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_SEGMENTS, GRID_SEGMENTS)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightAt(position.getX(i), position.getZ(i)))
  }
  position.needsUpdate = true
  const material = new THREE.MeshBasicMaterial({color, wireframe: true, transparent: true, opacity: 0.55})
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = GRID_Y
  return mesh
}

export const createTerminalScene: SceneFactory = ({isDark, aspect}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)
  scene.fog = new THREE.Fog(colors.bg, FOG_NEAR, FOG_FAR)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 200)

  // Two tiles of the same terrain, leap-frogging so the flow never shows an edge.
  const tileA = buildTerrain(colors.grid)
  const tileB = buildTerrain(colors.grid)
  scene.add(tileA, tileB)

  const ico = new THREE.Group()
  ico.add(
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({color: colors.solid})),
    new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshBasicMaterial({color: colors.grid, wireframe: true}))
  )
  ico.position.copy(ICO_POSITION)
  scene.add(ico)

  const lookAt = new THREE.Vector3()

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer) {
      const offset = (elapsed * FLOW_SPEED) % GRID_SIZE
      tileA.position.z = offset
      tileB.position.z = offset - GRID_SIZE

      ico.rotation.y += dt * ICO_SPIN
      ico.rotation.x += dt * ICO_SPIN * 0.4
      ico.position.y = ICO_POSITION.y + Math.sin(elapsed * 0.9) * 0.25

      camera.position.set(
        pointer.x * POINTER_SWAY,
        CAMERA_BASE_Y + progress * JOURNEY_RISE - pointer.y * 0.3,
        CAMERA_BASE_Z - progress * JOURNEY_ADVANCE
      )
      lookAt.set(0, 0.5 - progress * 2, -20)
      camera.lookAt(lookAt)
    }
  }
}
```

- [ ] **Step 3: `app/scenes/cartoon.ts`** — a low-poly floating island (train-diorama energy, built from primitives with toon shading), drifting clouds, a warm window light at night, camera orbiting as the journey advances.

```ts
// app/scenes/cartoon.ts
import * as THREE from 'three'
import type {SceneFactory} from './types'

const PALETTE = {
  dark: {sky: 0x2b2320, ground: 0x6b4a35, grass: 0x7fae63, leaf: 0x4f8a4b, trunk: 0x5a3b2a, wall: 0xf3e5c8, roof: 0xc9633c, cloud: 0xd9cfc4, window: 0xffb15c},
  light: {sky: 0xf6ecd8, ground: 0x8d5e43, grass: 0x9bc77a, leaf: 0x5d9c57, trunk: 0x6b4631, wall: 0xfff6e1, roof: 0xd9704a, cloud: 0xffffff, window: 0xffb15c}
} as const

const CAMERA_FOV = 45
const ORBIT_START_ANGLE = -0.4
const ORBIT_SWEEP = Math.PI * 1.5 // radians travelled across the /about journey
const ORBIT_RADIUS_START = 9.5
const ORBIT_RADIUS_END = 7.5
const ORBIT_HEIGHT_START = 2.6
const ORBIT_HEIGHT_END = 5
const BOB_AMPLITUDE = 0.15
const BOB_SPEED = 0.8
const ISLAND_SPIN = 0.06
const CLOUD_SPEED = 0.4
const CLOUD_WRAP_X = 9
const TREE_SPOTS: ReadonlyArray<readonly [number, number]> = [
  [1.6, 0.8],
  [-1.4, 1.2],
  [0.4, -1.8],
  [-1.9, -0.6],
  [2.1, -1.3]
]
const CLOUD_SPOTS: ReadonlyArray<readonly [number, number, number]> = [
  [-6, 3.2, -3],
  [-2, 4.1, -6],
  [3, 3.6, -4],
  [6.5, 4.4, -7]
]

/** Three-band toon ramp; shared by every material in the scene. */
function toonRamp(): THREE.DataTexture {
  const texture = new THREE.DataTexture(new Uint8Array([90, 160, 230, 255]), 4, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

/** Faceted (low-poly) normals: un-index the geometry so each face shades flat. */
function faceted(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  geometry.dispose()
  return flat
}

export const createCartoonScene: SceneFactory = ({isDark, aspect}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const gradientMap = toonRamp()
  const toon = (color: number) => new THREE.MeshToonMaterial({color, gradientMap})
  const mesh = (geometry: THREE.BufferGeometry, color: number) => new THREE.Mesh(faceted(geometry), toon(color))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.sky)
  scene.fog = new THREE.Fog(colors.sky, 14, 30)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 100)

  scene.add(new THREE.HemisphereLight(colors.sky, colors.ground, isDark ? 0.5 : 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, isDark ? 0.5 : 1.4)
  sun.position.set(5, 8, 3)
  scene.add(sun)

  const island = new THREE.Group()
  const rock = mesh(new THREE.CylinderGeometry(3, 0.6, 2.4, 8), colors.ground)
  rock.position.y = -1.3
  const grass = mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.3, 8), colors.grass)
  island.add(rock, grass)

  TREE_SPOTS.forEach(([x, z]) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 5), colors.trunk)
    trunk.position.set(x, 0.4, z)
    const crown = mesh(new THREE.ConeGeometry(0.5, 1.2, 6), colors.leaf)
    crown.position.set(x, 1.2, z)
    island.add(trunk, crown)
  })

  const walls = mesh(new THREE.BoxGeometry(1, 0.8, 1), colors.wall)
  walls.position.set(-0.2, 0.55, 0.1)
  const roof = mesh(new THREE.ConeGeometry(0.9, 0.6, 4), colors.roof)
  roof.position.set(-0.2, 1.25, 0.1)
  roof.rotation.y = Math.PI / 4
  island.add(walls, roof)

  // A warm window at night — the one "lived-in" cue.
  const windowLight = new THREE.PointLight(colors.window, isDark ? 2.5 : 0, 6, 2)
  windowLight.position.set(-0.2, 0.6, 0.8)
  island.add(windowLight)
  scene.add(island)

  const clouds = CLOUD_SPOTS.map(([x, y, z]) => {
    const cloud = new THREE.Group()
    const puffs = [
      [0, 0, 0, 0.55],
      [0.6, 0.1, 0.1, 0.42],
      [-0.55, -0.05, 0.05, 0.4]
    ] as const
    puffs.forEach(([px, py, pz, r]) => {
      const puff = mesh(new THREE.SphereGeometry(r, 8, 6), colors.cloud)
      puff.position.set(px, py, pz)
      cloud.add(puff)
    })
    cloud.position.set(x, y, z)
    scene.add(cloud)
    return cloud
  })

  const lookAt = new THREE.Vector3(0, 0.3, 0)

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer) {
      island.position.y = Math.sin(elapsed * BOB_SPEED) * BOB_AMPLITUDE
      island.rotation.y += dt * ISLAND_SPIN

      clouds.forEach((cloud) => {
        cloud.position.x += dt * CLOUD_SPEED
        if (cloud.position.x > CLOUD_WRAP_X) cloud.position.x = -CLOUD_WRAP_X
      })

      const angle = ORBIT_START_ANGLE + progress * ORBIT_SWEEP
      const radius = ORBIT_RADIUS_START + (ORBIT_RADIUS_END - ORBIT_RADIUS_START) * progress
      const height = ORBIT_HEIGHT_START + (ORBIT_HEIGHT_END - ORBIT_HEIGHT_START) * progress
      camera.position.set(
        Math.sin(angle) * radius + pointer.x * 0.5,
        height - pointer.y * 0.3,
        Math.cos(angle) * radius
      )
      camera.lookAt(lookAt)
    }
  }
}
```

- [ ] **Step 4: `app/scenes/galaxy.ts`** — emissive sun with a halo, seven orbiting planets (one ringed), an asteroid belt and a starfield; the camera dives from an overview into the system as the journey advances.

```ts
// app/scenes/galaxy.ts
import * as THREE from 'three'
import type {SceneFactory} from './types'

const PALETTE = {
  dark: {bg: 0x0a0920, sun: 0xffb347, star: 0xcfd3ff, orbit: 0x5a5c8a, starOpacity: 0.9, ambient: 0.12},
  light: {bg: 0xedeef8, sun: 0xe58f1a, star: 0x3b3d6b, orbit: 0x9a9cc4, starOpacity: 0.45, ambient: 0.6}
} as const

interface PlanetSpec {
  radius: number
  distance: number
  speed: number // radians per second around the sun
  tilt: number // orbit plane tilt, radians
  color: number
  ring?: boolean
}

const PLANETS: readonly PlanetSpec[] = [
  {radius: 0.28, distance: 3.2, speed: 0.5, tilt: 0.05, color: 0xc98b5e},
  {radius: 0.42, distance: 4.6, speed: 0.36, tilt: -0.08, color: 0x7aa6d9},
  {radius: 0.36, distance: 6.1, speed: 0.28, tilt: 0.12, color: 0xd9b96b},
  {radius: 0.9, distance: 8.6, speed: 0.18, tilt: -0.04, color: 0x8c6ad9, ring: true},
  {radius: 0.6, distance: 11.2, speed: 0.13, tilt: 0.1, color: 0x5fb0a0},
  {radius: 0.5, distance: 13.4, speed: 0.1, tilt: -0.14, color: 0xd97a7a},
  {radius: 0.34, distance: 15.6, speed: 0.07, tilt: 0.07, color: 0xb4b4c8}
]

const SUN_RADIUS = 1.2
// ponytail: tuned by eye for ACES tone mapping; raise if planets look muddy, lower if the inner ones blow out.
const SUN_INTENSITY_DARK = 260
const SUN_INTENSITY_LIGHT = 180
const STAR_COUNT = 2000
const STAR_SHELL_MIN = 60
const STAR_SHELL_MAX = 120
const BELT_COUNT = 600
const BELT_INNER = 9.6
const BELT_OUTER = 10.4
const CAMERA_FOV = 50
const CAMERA_START = {radius: 24, height: 9}
const CAMERA_END = {radius: 11, height: 3}
const CAMERA_SWEEP = Math.PI * 0.9
const LOOK_AT = new THREE.Vector3(0, -1.5, 0) // keeps the sun below the hero text on /

function randomInShell(min: number, max: number): [number, number, number] {
  const r = min + Math.random() * (max - min)
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
}

function points(count: number, place: () => [number, number, number], color: number, size: number, opacity: number): THREE.Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) positions.set(place(), i * 3)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({color, size, sizeAttenuation: true, transparent: true, opacity, depthWrite: false})
  return new THREE.Points(geometry, material)
}

export const createGalaxyScene: SceneFactory = ({isDark, aspect}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.bg)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 400)

  scene.add(new THREE.AmbientLight(0xffffff, colors.ambient))
  const sunLight = new THREE.PointLight(colors.sun, isDark ? SUN_INTENSITY_DARK : SUN_INTENSITY_LIGHT, 0, 2)
  scene.add(sunLight)

  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 16), new THREE.MeshBasicMaterial({color: colors.sun}))
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.6, 32, 16),
    new THREE.MeshBasicMaterial({color: colors.sun, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false})
  )
  scene.add(sun, halo)

  const pivots = PLANETS.map((spec) => {
    const pivot = new THREE.Object3D()
    pivot.rotation.x = spec.tilt
    pivot.rotation.y = Math.random() * Math.PI * 2

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(spec.radius, 24, 16),
      new THREE.MeshStandardMaterial({color: spec.color, roughness: 0.9, metalness: 0})
    )
    planet.position.x = spec.distance
    pivot.add(planet)

    if (spec.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(spec.radius * 1.4, spec.radius * 2.2, 48),
        new THREE.MeshBasicMaterial({color: spec.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
      )
      ring.rotation.x = Math.PI / 2.4
      planet.add(ring)
    }

    const orbit = new THREE.Mesh(
      new THREE.RingGeometry(spec.distance - 0.015, spec.distance + 0.015, 128),
      new THREE.MeshBasicMaterial({color: colors.orbit, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false})
    )
    orbit.rotation.x = Math.PI / 2
    pivot.add(orbit)

    scene.add(pivot)
    return {pivot, planet, speed: spec.speed}
  })

  const belt = points(
    BELT_COUNT,
    () => {
      const r = BELT_INNER + Math.random() * (BELT_OUTER - BELT_INNER)
      const a = Math.random() * Math.PI * 2
      return [Math.cos(a) * r, (Math.random() - 0.5) * 0.3, Math.sin(a) * r]
    },
    colors.orbit,
    0.12,
    0.8
  )
  scene.add(belt)

  scene.add(points(STAR_COUNT, () => randomInShell(STAR_SHELL_MIN, STAR_SHELL_MAX), colors.star, 0.45, colors.starOpacity))

  return {
    scene,
    camera,
    update(dt, _elapsed, progress, pointer) {
      pivots.forEach(({pivot, planet, speed}) => {
        pivot.rotation.y += dt * speed
        planet.rotation.y += dt * 0.5
      })
      belt.rotation.y += dt * 0.05

      const angle = progress * CAMERA_SWEEP
      const radius = CAMERA_START.radius + (CAMERA_END.radius - CAMERA_START.radius) * progress
      const height = CAMERA_START.height + (CAMERA_END.height - CAMERA_START.height) * progress
      camera.position.set(
        Math.sin(angle) * radius + pointer.x * 1.2,
        height - pointer.y * 0.8,
        Math.cos(angle) * radius
      )
      camera.lookAt(LOOK_AT)
    }
  }
}
```

- [ ] **Step 5: Typecheck and commit**

```bash
npm run typecheck && npm run lint:js
git add app/scenes
git commit -m "feat(scene): terminal, cartoon and galaxy three.js scenes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
(Nothing renders yet; Task 7 mounts them. If `vue-tsc` complains that `three` types are missing, confirm `@types/three` is in `devDependencies` from Task 0.)

---

### Task 7: `VibeScene.vue` — renderer, loop, scene swap, disposal

**Files:**
- Create: `app/composables/useJourneyProgress.ts`, `app/components/VibeScene.vue`
- Modify: `app/layouts/default.vue` (full file below)

**Interfaces:**
- Consumes: `SceneFactory`/`VibeScene` (Task 6), `useThemeStore` (Task 2).
- Produces: `useJourneyProgress(): Ref<number>` (0..1; written by Task 9's `useJourney` in Phase 3, read here; stays 0 until then). The layout renders `<LazyVibeScene>` on `/` and `/about`.

- [ ] **Step 1: `app/composables/useJourneyProgress.ts`**

```ts
// app/composables/useJourneyProgress.ts
// The one channel between the /about page and the layout-level VibeScene:
// 0 on /, i / (stops − 1) while a journey stop is centred on /about.
export const useJourneyProgress = () => useState<number>('journey-progress', () => 0)
```

- [ ] **Step 2: `app/components/VibeScene.vue`**

```vue
<template>
  <canvas ref="canvas" class="vibe-scene" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {createTerminalScene} from '~/scenes/terminal'
import {approach, type SceneFactory, type ScenePointer, type VibeScene} from '~/scenes/types'
import type {Vibe} from '~/stores/theme'

const FACTORIES: Record<Vibe, SceneFactory> = {
  terminal: createTerminalScene,
  cartoon: createCartoonScene,
  galaxy: createGalaxyScene
}

const MAX_DT = 0.1 // seconds; a backgrounded tab resumes without a time jump
const PROGRESS_SMOOTHING = 3
const POINTER_SMOOTHING = 4
const MAX_PIXEL_RATIO_FINE = 2
const MAX_PIXEL_RATIO_COARSE = 1.5 // phones: fill-rate bound, and nobody sees the difference

const canvas = ref<HTMLCanvasElement | null>(null)
const store = useThemeStore()
const journey = useJourneyProgress()

let renderer: THREE.WebGLRenderer | null = null
let active: VibeScene | null = null
let resizeObserver: ResizeObserver | null = null
let rafId = 0
let lastFrame = 0
let elapsed = 0
let progress = 0
let reduceMotion = false
const pointer: ScenePointer = {x: 0, y: 0}
const pointerTarget: ScenePointer = {x: 0, y: 0}

function aspectOf(el: HTMLCanvasElement): number {
  return el.clientWidth / Math.max(1, el.clientHeight)
}

/** Free every GPU resource reachable from the graph. scene.remove() alone leaks. */
function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      if (!material) return
      Object.values(material).forEach((value) => {
        if ((value as THREE.Texture)?.isTexture) (value as THREE.Texture).dispose()
      })
      material.dispose()
    })
  })
  scene.fog = null
  scene.background = null
  scene.clear()
}

function renderFrame(dt: number) {
  if (!renderer || !active) return
  active.update(dt, elapsed, progress, pointer)
  renderer.render(active.scene, active.camera)
}

function buildScene() {
  if (!renderer || !canvas.value) return
  if (active) {
    disposeScene(active.scene)
    renderer.renderLists.dispose()
  }
  active = FACTORIES[store.vibe]({isDark: store.isDarkMode, aspect: aspectOf(canvas.value)})
  elapsed = 0
  progress = journey.value // a vibe change jumps to the current stop instead of easing from 0
  renderFrame(0)
}

function tick(now: number) {
  const dt = Math.min(MAX_DT, Math.max(0, (now - lastFrame) / 1000))
  lastFrame = now
  elapsed += dt
  progress = approach(progress, journey.value, dt, PROGRESS_SMOOTHING)
  pointer.x = approach(pointer.x, pointerTarget.x, dt, POINTER_SMOOTHING)
  pointer.y = approach(pointer.y, pointerTarget.y, dt, POINTER_SMOOTHING)
  renderFrame(dt)
  rafId = requestAnimationFrame(tick)
}

function resize() {
  if (!renderer || !canvas.value) return
  const {clientWidth, clientHeight} = canvas.value
  renderer.setSize(clientWidth, clientHeight, false)
  if (active) {
    active.camera.aspect = aspectOf(canvas.value)
    active.camera.updateProjectionMatrix()
  }
  if (reduceMotion) renderFrame(0)
}

function onPointerMove(event: PointerEvent) {
  pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1
  pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1
}

onMounted(() => {
  if (!canvas.value) return
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const pixelRatio = Math.min(window.devicePixelRatio || 1, coarsePointer ? MAX_PIXEL_RATIO_COARSE : MAX_PIXEL_RATIO_FINE)

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: pixelRatio <= 1.5,
      alpha: false,
      powerPreference: 'low-power'
    })
  } catch (error) {
    // No WebGL (headless CI, blocked GPU): the HTML page stands on its own.
    console.warn('[VibeScene] WebGL unavailable; rendering without a scene.', error)
    return
  }
  renderer.setPixelRatio(pixelRatio)
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  resize()
  buildScene()

  if (reduceMotion) return // one frame per state change, no loop, no pointer
  window.addEventListener('pointermove', onPointerMove, {passive: true})
  lastFrame = performance.now()
  rafId = requestAnimationFrame(tick)
})

watch(() => [store.vibe, store.isDarkMode] as const, buildScene)

watch(journey, (value) => {
  if (!reduceMotion) return
  progress = value
  renderFrame(0)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onPointerMove)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (active) disposeScene(active.scene)
  active = null
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer = null
})
</script>

<style scoped>
.vibe-scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
```

- [ ] **Step 3: Mount it from the layout — `app/layouts/default.vue`, full file**

```vue
<template>
  <div class="w-full">
    <!-- The three.js canvas is fixed at z-0, above the opaque body background
         and below the content column (z-10). Only / and /about carry a scene;
         the component is lazy so blog routes never load three.js. One instance
         in the layout keeps the WebGL context alive across / <-> /about. -->
    <LazyVibeScene v-if="hasScene"/>
    <div class="relative z-10 max-w-3xl px-2 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
      <div class="flex flex-col justify-between h-screen">
        <Header/>
        <main class="grow font-medium text-gray-700">
          <slot />
        </main>
        <Footer/>
      </div>
    </div>
  </div>
</template>

<script setup>
const SCENE_ROUTES = new Set(['/', '/about'])

const route = useRoute()
const hasScene = computed(() => SCENE_ROUTES.has(route.path.replace(/\/+$/, '') || '/'))

// Set body attributes for theme styling
useHead({
  bodyAttrs: {
    class: 'bg-gray-50 dark:bg-gray-900'
  }
})
</script>
```
Do **not** add `overflow` to the wrapper: `html` must remain the scroll container (the footer's scroll listener and Phase 3's IntersectionObserver depend on it).

- [ ] **Step 4: Verify in the browser**

```bash
npm run dev
```
1. Open `/`: the terminal grid flows behind the (old) home content; the header's vibe button swaps to the island and then the galaxy with no console errors.
2. Open `/blog`: no `<canvas>` in the DOM (`document.querySelector('canvas')` → `null`) and no three.js chunk in the Network tab.
3. Leak check (DevTools console on `/`), switch vibes 20 times then run:
   ```js
   // The renderer is module-private; read GPU counts through the WebGL debug extension instead.
   performance.memory ? performance.memory.usedJSHeapSize / 1e6 : 'n/a'
   ```
   Switch 20 more times: heap should plateau, not grow ~linearly. (If it grows, something in a scene module holds a reference outside the graph — compare against the `disposeScene` checklist.)
4. Emulate `prefers-reduced-motion: reduce` (Rendering tab): the scene draws one still frame, switching vibes redraws once, nothing animates.
5. Lighthouse mobile on `/`: no "avoid enormous network payloads" from `three` on the first paint; the three chunk loads after the HTML overlay.

- [ ] **Step 5: Commit**

```bash
git add app/components/VibeScene.vue app/composables/useJourneyProgress.ts app/layouts/default.vue
git commit -m "feat(scene): lazy three.js stage behind the home and about pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Home page — Marquee Hero over the scene

**Files:**
- Rewrite: `app/pages/index.vue`

**Interfaces:**
- Consumes: `PROFILE`, `QUOTE` (Task 5), `<VibeSwitch variant="segmented">` (Task 4), `.link`/`.reveal`/`font-display` (Task 3).

- [ ] **Step 1: Replace the file**

```vue
<template>
  <section class="hero">
    <h1 class="hero__display font-display reveal" style="--i: 0">{{ PROFILE.name }}</h1>
    <p class="hero__role reveal" style="--i: 1">{{ PROFILE.role }}</p>
    <blockquote class="hero__quote reveal" style="--i: 2">
      <p>“{{ QUOTE.text }}.”</p>
      <footer>— {{ QUOTE.author }}</footer>
    </blockquote>
    <nav class="hero__links reveal" style="--i: 3" aria-label="Primary">
      <NuxtLink to="/about" class="link">About me →</NuxtLink>
      <NuxtLink to="/blog" class="link">Read the blog →</NuxtLink>
    </nav>
    <div class="hero__vibes reveal" style="--i: 4">
      <p class="hero__vibes-label">Pick a vibe</p>
      <VibeSwitch variant="segmented"/>
    </div>
  </section>
</template>

<script setup lang="ts">
import {PROFILE, QUOTE} from '~/data/profile'
</script>

<style scoped>
/* Hallmark · macrostructure: Marquee Hero · H1 knobs: size=xl, alignment=left-bias, underlay=none
 * nav: shared header · footer: Ft2 · enrichment: three.js canvas (layout) · design-system: design.md · designed-as-app */
.hero {
  display: grid;
  align-content: center;
  gap: var(--space-md);
  min-height: 60svh;
  padding: var(--space-2xl) var(--space-sm) var(--space-xl);
  color: var(--color-ink);
}

.hero__display {
  margin: 0;
  font-size: var(--text-display);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
  min-width: 0;
}

/* Terminal vibe: the N8 prompt, as a typographic cue only. */
[data-vibe="terminal"] .hero__display::before {
  content: "$ whoami";
  display: block;
  margin-bottom: var(--space-2xs);
  font-size: var(--text-md);
  font-weight: 400;
  letter-spacing: 0;
  color: var(--color-accent);
}

.hero__role {
  margin: 0;
  font-size: var(--text-md);
  color: var(--color-muted);
}

.hero__quote {
  max-width: 48ch;
  margin: var(--space-sm) 0 0;
  padding-inline-start: var(--space-sm);
  border-inline-start: 2px solid var(--color-accent);
  font-size: var(--text-base);
}

.hero__quote p {
  margin: 0;
}

.hero__quote footer {
  margin-top: var(--space-3xs);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.hero__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-sm);
  font-size: var(--text-md);
}

.hero__vibes {
  display: grid;
  gap: var(--space-2xs);
  justify-items: start;
  margin-top: var(--space-lg);
}

.hero__vibes-label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
```

- [ ] **Step 2: Verify at 320 / 375 / 414 / 768 / 1280 px**

Checklist: no horizontal scroll; the name wraps inside the column at 320 px (two lines, no clipping); the two links stay single-line; the segmented control fits (at 320 px it may wrap below "Pick a vibe", never overflow); in each vibe the name reads over the canvas (terminal: flat road behind the text; cartoon: island sits below the text; galaxy: sun sits low-right because of `LOOK_AT`). `prefers-reduced-motion`: reveal is a 150 ms fade.

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(home): marquee hero over the vibe scene

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8.1: Phase 2 end-to-end tests and phase gate

**Files:**
- Modify: `e2e/vibe.spec.ts` (append inside the existing `test.describe`)

- [ ] **Step 1: Append two tests to `e2e/vibe.spec.ts`**, before the closing `})` of `test.describe('vibe switcher', …)`:

```ts
  test('hero control switches the vibe and the heading renders before any canvas', async ({page}) => {
    await page.goto('/')

    await expect(page.getByRole('heading', {level: 1, name: 'Nguyen Quoc Dai'})).toBeVisible()
    await page.locator(SEGMENTED_RADIO('cartoon')).check({force: true})

    await expect(page.locator(HTML)).toHaveAttribute('data-vibe', 'cartoon')
  })

  test('scene canvas exists on / and /about but not on /blog', async ({page}) => {
    await page.goto('/')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1)

    await page.getByRole('link', {name: 'About me →'}).click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1)

    await page.goto('/blog')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(0)
  })
```

- [ ] **Step 2: Run everything, including a production build**

```bash
npm run lint && npm run typecheck && npm run test:coverage && npm run build && npx playwright test
```
Expected: all green. In the build output, `three` lives in an async chunk (a `VibeScene-*.js` line, several hundred kB) and the entry chunk did not grow.

- [ ] **Step 3: Commit, push, PR**

```bash
git add e2e/vibe.spec.ts
git commit -m "test(e2e): scene canvas presence and hero vibe control

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin feature/dainq/vibes-2-scenes
gh pr create --base main --title "feat(scene): three.js vibe scenes and marquee home page" --body-file - <<'EOF'
## Summary
- Three primitive-only three.js scenes (terminal grid, cartoon island, galaxy) behind `/` and `/about`, mounted lazily from the layout; blog routes never load `three`.
- `/` is a marquee hero (name · role · quote · two typographic links · vibe control) over the scene.
- Renderer caps DPR, pauses nothing it does not need to, disposes every GPU resource on vibe/dark switch, renders a single frame under `prefers-reduced-motion`, and degrades to HTML-only without WebGL.

## Test plan
- [ ] `npx playwright test` (mobile + desktop)
- [ ] `npm run build`: `three` in an async chunk only
- [ ] Manual: 20 vibe switches on `/` without heap growth; 320/375/414/768/1280 px; reduced-motion emulation

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```
Squash-merge once green.

---

# Phase 3 — About journey

Branch `feature/dainq/vibes-3-journey`, cut from `main` after Phase 2 merged:

```bash
git checkout main && git pull --ff-only && git checkout -b feature/dainq/vibes-3-journey
```
Deliverable: `/about` is an eight-stop scroll journey that drives the scene camera. Tasks 9 → 11.

### Task 9: Journey primitives — `Stop`, `Rail`, `useJourney`

**Files:**
- Create: `app/components/journey/Stop.vue`, `app/components/journey/Rail.vue`, `app/composables/useJourney.ts`

**Interfaces:**
- Produces:
  - `<JourneyStop :index="n" :title="…" :level="1|2">` — renders `<section id="stop-n" data-stop="n">` with a stacked stage number and heading, slot for body. (Nuxt auto-registers `components/journey/Stop.vue` as `JourneyStop`.)
  - `<JourneyRail :labels="string[]" :active="n">` — fixed left rail, `aria-current="step"` on the active item.
  - `useJourney(stopCount: number): {activeStop: Ref<number>}` — one IntersectionObserver over `[data-stop]`, centre-band root margin; writes `useJourneyProgress()`.

- [ ] **Step 1: `app/components/journey/Stop.vue`**

```vue
<template>
  <section :id="`stop-${index}`" :data-stop="index" class="stop" :aria-labelledby="`stop-${index}-title`">
    <div class="stop__panel">
      <p class="stop__stage font-mono" aria-hidden="true">{{ stage }}</p>
      <component :is="`h${level}`" :id="`stop-${index}-title`" class="stop__title font-display">
        {{ title }}
      </component>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{index: number; title: string; level?: 1 | 2}>(), {level: 2})

const stage = computed(() => String(props.index).padStart(2, '0'))
</script>

<style scoped>
/* Hallmark · macrostructure: Narrative Workflow · F4 step knobs: numbering=01/02, layout=vertical stack, connector=none
 * section head: stacked stage number above heading (ordinal content) · design-system: design.md · designed-as-app */
.stop {
  display: grid;
  align-content: center;
  min-height: 100svh;
  padding: var(--space-xl) 0;
  scroll-margin-top: var(--space-xl);
}

/* Opaque paper panel (glass is banned); the canvas shows around it. */
.stop__panel {
  max-width: 65ch;
  padding: var(--space-lg) var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
}

.stop__stage {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  color: var(--color-accent);
}

.stop__title {
  margin: 0 0 var(--space-md);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  min-width: 0;
}

.stop__panel :deep(h1.stop__title) {
  font-size: var(--text-2xl);
}

@media (min-width: 60rem) {
  .stop__panel {
    padding: var(--space-xl) var(--space-lg);
  }
}
</style>
```

- [ ] **Step 2: `app/components/journey/Rail.vue`**

```vue
<template>
  <nav class="rail" aria-label="Journey stops">
    <ol class="rail__list">
      <li v-for="(label, i) in labels" :key="label">
        <a :href="`#stop-${i}`" class="rail__dot" :aria-current="i === active ? 'step' : undefined">
          <span class="rail__num font-mono">{{ String(i).padStart(2, '0') }}</span>
          <span class="sr-only">{{ label }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{labels: readonly string[]; active: number}>()
</script>

<style scoped>
/* N3 side-rail used as in-page navigation. Hidden below the layout breakpoint:
   on a phone the stop numbers inside each panel carry the orientation. */
.rail {
  display: none;
}

@media (min-width: 60rem) {
  .rail {
    position: fixed;
    top: 50%;
    left: var(--space-md);
    z-index: 20;
    display: block;
    transform: translateY(-50%);
  }

  .rail__list {
    display: grid;
    gap: var(--space-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rail__dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-pill);
    color: var(--color-muted);
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
  }

  .rail__dot:hover {
    color: var(--color-ink);
  }

  .rail__dot[aria-current="step"] {
    color: var(--color-paper);
    background: var(--color-ink);
  }

  .rail__num {
    font-size: var(--text-sm);
  }
}
</style>
```

- [ ] **Step 3: `app/composables/useJourney.ts`**

```ts
// app/composables/useJourney.ts
// Which /about stop is centred in the viewport. One IntersectionObserver with a
// zero-height root band at the viewport centre: exactly one stop intersects at
// any scroll position regardless of stop height (a `threshold: 0.5` observer
// never fires for a stop taller than two viewports).
const CENTRE_BAND = '-50% 0px -50% 0px'

export function useJourney(stopCount: number) {
  const activeStop = ref(0)
  const progress = useJourneyProgress()
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.stop)
          if (Number.isNaN(index)) return
          activeStop.value = index
          progress.value = stopCount > 1 ? index / (stopCount - 1) : 0
        })
      },
      {rootMargin: CENTRE_BAND, threshold: 0}
    )
    document.querySelectorAll<HTMLElement>('[data-stop]').forEach((el) => observer?.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    progress.value = 0 // back on /, the scene returns to waypoint 0
  })

  return {activeStop}
}
```

- [ ] **Step 4: Lint, typecheck, commit**

```bash
npm run lint && npm run typecheck
git add app/components/journey app/composables/useJourney.ts
git commit -m "feat(about): journey stop, rail and active-stop observer

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: About page — eight stops

**Files:**
- Rewrite: `app/pages/about/index.vue` (keep lines 1074–1119 — the `<script setup>` SEO block — verbatim, add the imports and journey wiring shown)

**Interfaces:**
- Consumes: Task 5 data, Task 9 primitives, `<SocialLinks size="lg">` (Task 4).
- Produces: `data-active-stop` attribute on the page root (read by e2e), ids `#stop-0` … `#stop-7`.

- [ ] **Step 1: Replace the template and script**

```vue
<template>
  <div class="journey" :data-active-stop="activeStop">
    <JourneyRail :labels="STOP_LABELS" :active="activeStop"/>

    <JourneyStop :index="0" :title="PROFILE.displayName" :level="1">
      <img
        :src="PROFILE.photo"
        :alt="PROFILE.photoAlt"
        width="160"
        height="160"
        class="journey__photo"
        @error="handleProfileImageError"
      >
      <p class="journey__role">{{ PROFILE.role }}</p>
      <p>{{ PROFILE.summary }}</p>
      <p class="journey__hint" aria-hidden="true">Scroll to continue ↓</p>
    </JourneyStop>

    <JourneyStop :index="1" title="What I do">
      <dl class="spec">
        <template v-for="skill in SKILLS" :key="skill.group">
          <dt>{{ skill.group }}</dt>
          <dd>
            <p v-if="'expert' in skill"><span class="spec__level">Expert</span> {{ skill.expert }}</p>
            <p v-if="'proficient' in skill"><span class="spec__level">Proficient</span> {{ skill.proficient }}</p>
            <p v-if="'note' in skill">{{ skill.note }}</p>
          </dd>
        </template>
      </dl>
      <ul class="plain">
        <li v-for="item in OTHER_SKILLS" :key="item.label"><b>{{ item.label }}:</b> {{ item.text }}</li>
      </ul>
    </JourneyStop>

    <JourneyStop v-for="(entry, i) in TIMELINE" :key="entry.period" :index="i + 2" :title="entry.org">
      <p class="journey__period font-mono">{{ entry.period }}</p>
      <p v-if="entry.kind === 'education'"><b>Major:</b> {{ entry.major }}<br><b>Degree:</b> {{ entry.degree }}</p>
      <template v-else>
        <p><b>Position:</b> {{ entry.position }}</p>
        <p><b>Technologies:</b> {{ entry.technologies }}</p>
        <p v-if="'thirdParties' in entry"><b>3rd parties:</b> {{ entry.thirdParties }}</p>
        <p><b>Key Achievements:</b></p>
        <ul class="plain">
          <li v-for="line in entry.achievements" :key="line">{{ line }}</li>
        </ul>
      </template>
    </JourneyStop>

    <JourneyStop :index="6" title="Live Projects & Products">
      <ul class="projects">
        <li v-for="project in PROJECTS" :key="project.name" class="project">
          <img :src="project.image" :alt="project.alt" width="48" height="48" loading="lazy" class="project__logo">
          <div class="project__body">
            <h3 class="project__name">{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <p class="project__role">{{ project.role }}</p>
            <a v-if="'url' in project" :href="project.url" target="_blank" rel="noopener noreferrer" class="link">Visit live →</a>
            <span v-else class="project__internal">Internal</span>
          </div>
        </li>
      </ul>
    </JourneyStop>

    <JourneyStop :index="7" title="Say hello">
      <dl class="spec">
        <template v-for="row in CONTACT" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd><a v-if="'href' in row" :href="row.href" class="link">{{ row.value }}</a><template v-else>{{ row.value }}</template></dd>
        </template>
      </dl>
      <SocialLinks size="lg" class="journey__social"/>
    </JourneyStop>
  </div>
</template>

<script setup>
import {CONTACT, OTHER_SKILLS, PROFILE, PROJECTS, SKILLS, TIMELINE} from '~/data/profile'

defineOptions({name: 'AboutPage'})

const STOP_LABELS = [
  'Hello',
  'What I do',
  ...TIMELINE.map((entry) => entry.org),
  'Live Projects & Products',
  'Say hello'
]

const {activeStop} = useJourney(STOP_LABELS.length)

const config = useRuntimeConfig()

const TITLE = 'Quoc Dai Nguyen - Senior Backend Software Engineer'
const DESCRIPTION =
  'Quoc Dai Nguyen - Senior Backend Software Engineer with 6+ years of experience building and operating high-performance backend systems for media and e-commerce platforms'
const OG_DESCRIPTION =
  'Senior Backend Software Engineer with 6+ years of experience in system design, performance optimization, and building scalable solutions for production systems'

function handleProfileImageError(event) {
  console.warn('Profile image failed to load:', event.target.src)
  // Replace with a fallback placeholder
  event.target.src = '/no-image.jpg'
  event.target.alt = 'Profile image not available'
}

// Was an Options API head() hook, which Nuxt 3/4 do not support at all — it was
// silently ignored, so this page has been shipping with no title and no meta
// tags whatsoever.
//
// `hid` keys are dropped (removed in Unhead v2; useSeoMeta dedupes by tag
// identity). og:title/description/image were also declared with `name:` rather
// than `property:`, another long-standing bug that useSeoMeta gets right.
// process.env.baseUrl is undefined at runtime, hence useRuntimeConfig.
useHead({
  title: TITLE,
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [
    {
      name: 'keywords',
      content:
        'QDJr, Quoc Dai Nguyen, Nguyen Quoc Dai, Senior Backend Software Engineer, profile, cv, PHP, Laravel, Node.js, Kubernetes'
    }
  ]
})

useSeoMeta({
  description: DESCRIPTION,
  ogUrl: () => `${config.public.baseUrl}/about`,
  ogTitle: TITLE,
  ogDescription: OG_DESCRIPTION,
  ogImage: () => `${config.public.baseUrl}/profile.jpg`
})
</script>

<style scoped>
/* Hallmark · macrostructure: Narrative Workflow · nav: shared header + N3 rail · footer: Ft2
 * feature: F3 tabular spec (skills, contact) · F4 step sequence (timeline) · design-system: design.md · designed-as-app */
.journey__photo {
  width: 10rem;
  height: 10rem;
  margin-bottom: var(--space-md);
  border-radius: 50%;
  object-fit: cover;
}

.journey__role,
.journey__period {
  margin: 0 0 var(--space-sm);
  color: var(--color-muted);
}

.journey__hint {
  margin-top: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.journey__social {
  justify-content: flex-start;
  margin-top: var(--space-md);
}

/* F3 tabular spec sheet: key/value rows with hairline rules. */
.spec {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-2xs) var(--space-md);
  margin: 0 0 var(--space-md);
}

.spec dt {
  padding-top: var(--space-2xs);
  font-weight: 700;
}

.spec dd {
  margin: 0;
  padding-bottom: var(--space-2xs);
  border-bottom: var(--rule-hair) solid var(--color-rule);
}

.spec dd p {
  margin: 0 0 var(--space-3xs);
}

.spec__level {
  color: var(--color-accent);
  font-weight: 700;
}

@media (min-width: 40rem) {
  .spec {
    grid-template-columns: 11rem minmax(0, 1fr);
  }

  .spec dt {
    border-bottom: var(--rule-hair) solid var(--color-rule);
    padding-bottom: var(--space-2xs);
  }
}

.plain {
  margin: 0;
  padding-inline-start: 1.1em;
}

.plain li + li {
  margin-top: var(--space-2xs);
}

.projects {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.project {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: var(--space-sm);
}

.project__logo {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-card);
  object-fit: contain;
}

.project__name {
  margin: 0 0 var(--space-3xs);
  font-size: var(--text-base);
  font-weight: 700;
}

.project__body p {
  margin: 0 0 var(--space-3xs);
}

.project__role,
.project__internal {
  color: var(--color-muted);
  font-size: var(--text-sm);
}
</style>
```

The whole file is replaced: nothing from the old 1 072-line template survives except the copy, which now comes from `profile.ts`, and the SEO script block above, which is byte-identical to the current lines 1079–1118.

- [ ] **Step 2: Verify**

```bash
npm run lint && npm run typecheck && npm run dev
```
Open `/about` at 1280 px: eight panels, each at least one viewport tall; the rail on the left highlights the panel whose middle crosses the viewport centre; the camera moves between stops (terminal climbs, island orbits, galaxy dives). Click rail `05` → smooth scroll to FireGroup. At 375 px: no rail, no horizontal scroll, project cards stack, Projects stop activates while scrolling through it (watch `data-active-stop` in the Elements panel). `prefers-reduced-motion`: anchor jumps are instant, scene redraws once per stop. The SEO title and meta are unchanged (`document.title` = "Quoc Dai Nguyen - Senior Backend Software Engineer").

- [ ] **Step 3: Commit**

```bash
git add app/pages/about/index.vue
git commit -m "feat(about): scroll journey over the vibe scene

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Phase 3 end-to-end tests and phase gate

**Files:**
- Create: `e2e/about-journey.spec.ts`

(The clock and vibe-switch specs already landed in Phases 1 and 2.)

- [ ] **Step 1: Create `e2e/about-journey.spec.ts`**

```ts
import {expect, test} from '@playwright/test'

const STOP_COUNT = 8

test.describe('about journey', () => {
  test('renders eight stops with ordered ids', async ({page}) => {
    await page.goto('/about')

    await expect(page.locator('[data-stop]')).toHaveCount(STOP_COUNT)
    for (let i = 0; i < STOP_COUNT; i++) {
      await expect(page.locator(`#stop-${i}`)).toBeAttached()
    }
    await expect(page.getByRole('heading', {level: 1, name: 'Quoc Dai Nguyen'})).toBeVisible()
  })

  test('rail tracks the centred stop on desktop', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'rail is hidden below 60rem')
    await page.goto('/about')

    await page.locator('#stop-4').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '4')
    await expect(page.locator('.rail__dot[aria-current="step"]')).toHaveText(/04/)

    await page.locator('.rail__dot', {hasText: '07'}).click()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '7')
  })

  test('a stop taller than the viewport still becomes active on mobile', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only: the projects stop is several viewports tall')
    await page.goto('/about')

    // Scroll so the viewport centre sits well inside the projects stop
    // (document-relative top, not offsetTop, which is relative to the z-10 wrapper).
    await page.evaluate(() => {
      const el = document.querySelector('#stop-6') as HTMLElement
      const top = el.getBoundingClientRect().top + window.scrollY
      window.scrollTo({top: top + window.innerHeight * 1.2, behavior: 'instant'})
    })

    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
  })
})
```

- [ ] **Step 2: Run the whole suite**

```bash
npm run lint && npm run typecheck && npm run test:coverage && npx playwright test
```
Expected: Vitest green with coverage ≥ 80 % on `app/utils` + `app/stores`; Playwright green on both projects. Headless Chromium has SwiftShader WebGL, so the canvas mounts; if a CI box lacks it, every assertion still holds because the specs test the DOM, not pixels.

- [ ] **Step 3: Commit, push, PR**

```bash
git add e2e/about-journey.spec.ts
git commit -m "test(e2e): about journey stops and rail

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin feature/dainq/vibes-3-journey
gh pr create --base main --title "feat(about): scroll journey over the vibe scene" --body-file - <<'EOF'
## Summary
- `/about` becomes eight full-height stops (hello · what I do · four career stages · projects · contact) on opaque paper panels over the scene; copy unchanged, served from `app/data/profile.ts`.
- One IntersectionObserver with a centre band picks the active stop and drives the scene camera through `useJourneyProgress()`; a fixed side rail (≥ 60 rem) shows and links the stops.
- SEO title/meta for `/about` unchanged.

## Test plan
- [ ] `npx playwright test` (mobile + desktop), including the tall Projects stop on mobile
- [ ] Manual: all three vibes, both modes, reduced-motion (instant anchor jumps, single-frame redraws), 320/375/414/768/1280 px

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```
Squash-merge once green.

---

# Phase 4 — Lock the system and document it

Branch `feature/dainq/vibes-4-docs`, cut from `main` after Phase 3 merged:

```bash
git checkout main && git pull --ff-only && git checkout -b feature/dainq/vibes-4-docs
```
Deliverable: `design.md`, Hallmark memory, README, slop-test pass. Task 12.

### Task 12: `design.md`, Hallmark memory, README

**Files:**
- Create: `design.md`, `.hallmark/log.json`
- Modify: `README.md` (add one section after "🛠️ Development")

- [ ] **Step 1: `design.md`**

```markdown
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
- `/about`: **Narrative Workflow** — eight numbered stops (`00`–`07`), opaque paper panels over the canvas, N3 side rail ≥ 60 rem.
- Blog / content pages: unchanged layout, retinted by tokens only. Typography only, no enrichment.

## Theme
Tokens live in `app/assets/css/tokens.css`. Per vibe (light / dark):

| | terminal | cartoon | galaxy |
| --- | --- | --- | --- |
| paper | oklch(96% 0.012 150) / oklch(13% 0.012 150) | oklch(96% 0.03 85) / oklch(24% 0.03 50) | oklch(95% 0.015 260) / oklch(12% 0.03 280) |
| ink | oklch(22% 0.03 150) / oklch(90% 0.05 150) | oklch(28% 0.04 50) / oklch(93% 0.025 85) | oklch(20% 0.04 280) / oklch(94% 0.012 280) |
| accent | oklch(50% 0.17 150) / oklch(80% 0.20 150) | oklch(62% 0.16 40) / oklch(72% 0.14 45) | oklch(58% 0.15 65) / oklch(82% 0.14 80) |

Accent ≤ 3 % of any viewport: stage numbers, link underlines, focus rings, the prompt glyph.
Tailwind `gray-*` / `blue-*` utilities are remapped to the vibe ramps in `main.css` (`@theme inline`).

## Typography (2+1)
- terminal: JetBrains Mono 400/700 for everything (single-font by design).
- cartoon: display Fraunces 700 (SOFT 100, WONK 1) · body Bricolage Grotesque 400/600.
- galaxy: display Tomorrow 600 · body Geist 400/600 · outlier Geist Mono (stage numbers, clock).
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

## Scene palette (hex, three.js side)
See `PALETTE` constants in `app/scenes/{terminal,cartoon,galaxy}.ts`; they mirror the paper/accent hues above.

## Exports
### tokens.css
`app/assets/css/tokens.css` is the canonical export.
### Tailwind v4 `@theme`
See the `@theme inline` block in `app/assets/css/main.css`.
```

- [ ] **Step 2: `.hallmark/log.json`**

```json
[
  {
    "date": "2026-10-01",
    "scope": "app",
    "macrostructure": "Marquee Hero (/) · Narrative Workflow (/about)",
    "theme": "custom ×3 — terminal / cartoon / galaxy",
    "theme_axes": "dark/mono/chromatic-green · light/soft-serif/warm · dark/geometric-sans/warm",
    "enrichment": "Tier-A three.js primitives",
    "nav": "N1b shell (N8 voice on terminal) + N3 rail on /about",
    "footer": "Ft2 inline single line",
    "brief": "qdjr.me profile redesign · three switchable vibes · scroll journey about page"
  }
]
```

- [ ] **Step 3: README section** — insert after the "🛠️ Development" section:

```markdown
## 🎨 Vibes

The site has three switchable looks — **terminal**, **cartoon** and **galaxy** —
picked from the header button or the control on the home page and remembered in
`localStorage.vibe`. Each vibe sets its own fonts and OKLCH palette
(`app/assets/css/tokens.css`) and renders a three.js scene behind `/` and `/about`
(`app/scenes/*`, mounted lazily by `app/components/VibeScene.vue`).

Light/dark is not a toggle: it follows the clock in **UTC+7** (dark from 18:00
to 06:00 Vietnam time, `app/utils/vnTime.ts`). To preview the other mode locally,
run `document.documentElement.classList.toggle('dark')` in the console.

`/about` is a scroll journey: eight full-height stops drive the scene camera
through `useJourney()`; the content lives in `app/data/profile.ts`.
```

- [ ] **Step 4: Final verification**

```bash
npm run lint && npm run typecheck && npm run test:coverage && npm run build && npx playwright test
```
Expected: all green; `npm run build` prints a separate chunk containing `three` that is **not** part of the entry chunk (look for a `VibeScene-*.js` / `three-*.js` line in the Nitro/Vite output).

- [ ] **Step 5: Hallmark slop test** — load `~/.claude/skills/hallmark/references/slop-test.md` and run the 58 gates against `tokens.css`, `main.css`, `index.vue`, `about/index.vue`, `journey/*.vue`, `VibeSwitch.vue`. Any open gate is fixed in this branch (CSS-only fixes) before the PR; record the result line (`58 / 58 ✓` or the failing gate numbers and fixes) in the PR body.

- [ ] **Step 6: Commit, push, PR**

```bash
git add design.md .hallmark/log.json README.md
git commit -m "docs: lock the vibe design system and document the redesign

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push -u origin feature/dainq/vibes-4-docs
gh pr create --base main --title "docs: lock the vibe design system" --body-file - <<'EOF'
## Summary
- `design.md`: the locked three-vibe system (genres, macrostructures, tokens, type, motion, allowances) that future page work reads first.
- `.hallmark/log.json`: project memory for the redesign run.
- README: how vibes and the UTC+7 clock-driven dark mode work.
- Hallmark slop test: <58 / 58 ✓ | gates fixed: …>

## Test plan
- [ ] `npm run lint` (docs only, no runtime change)
- [ ] Lighthouse mobile on `/` and `/about` recorded in this PR: <scores>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

---

## Verification (end-to-end)

Each phase runs its own gate (see the Phases table and the last task of each phase). The checks below are the cumulative picture after Phase 4 merges.

1. **Unit:** `npm run test:coverage` — `test/vnTime.spec.ts`, `test/theme.spec.ts` green; thresholds hold.
2. **E2E:** `npx playwright test` — mobile + desktop projects; the new `vibe.spec.ts` and `about-journey.spec.ts` plus the updated clock-based dark-mode test.
3. **Build:** `npm run build` — three.js is in an async chunk; entry chunk size unchanged or smaller (tsparticles gone).
4. **Browser (BrowserOS neo or local Chrome):** on `/` cycle the three vibes in both modes (`classList.toggle('dark')`), check 320/375/414/768 px for horizontal scroll and wrapped links; on `/about` scroll through all eight stops and confirm the rail + camera follow; emulate reduced motion and a blocked WebGL context (DevTools → Rendering → "Emulate WebGL disabled" is not available; instead set `HTMLCanvasElement.prototype.getContext = () => null` in a snippet before load) and confirm the HTML still renders.
5. **Hallmark slop test (Step 7 of the skill):** run the 58 gates against `tokens.css`, `main.css`, `index.vue`, `about/index.vue` before the PR; fix any open gate and re-emit the preview block.

## Execution notes for the implementer

- Three constants are deliberate calibration knobs, tune by eye after the first render: `SUN_INTENSITY_*` in `galaxy.ts`, `FLOW_SPEED` in `terminal.ts`, `ORBIT_SWEEP` in `cartoon.ts`.
- If `vue-tsc` rejects `'expert' in skill` narrowing on the `as const` union, replace with `skill.expert !== undefined` after adding `expert?: string` to a `Skill` interface in `profile.ts`; keep the data literal unchanged.
- The `JourneyStop` for the FireGroup entry has the longest body; if its panel exceeds one viewport on desktop that is fine — the centre-band observer handles tall stops.
- Do not add `overflow: auto` anywhere on the layout wrapper; `html` must stay the scroll container.
