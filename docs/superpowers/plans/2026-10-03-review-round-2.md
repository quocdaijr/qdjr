# Review round 2 — glass panels, named rail, planet journey, system-design map, clickable scenes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, this repo's pattern). Steps use `- [ ]`. TDD: every step that adds behaviour writes the test first and watches it fail. One squashed commit per phase; each phase is its own stacked PR. Mirror this file to `docs/superpowers/plans/2026-10-03-review-round-2.md` in Phase 13.

**Goal:** Act on the user's 2026-10-03 review: (1) translucent blurred journey panels in all vibes; (2) a rail of section names instead of 00–07 and no stage numbers; (3) galaxy journey where every section is a planet and Projects is Earth with ten orbiters; (4) coding journey as a system-design map whose cluster pods are the projects; (5) clickable scenes (go to section, pick project, small easter eggs).

**Architecture:** Phase 13 is CSS/markup only (`Stop.vue`, `Rail.vue`, about page, profile data). Phases 14–15 replace the galaxy constellation and the terminal commit graph with per-stop *anchors* the camera chases, reusing `panelAim` (`app/scenes/framing.ts`) and `approach` (`app/scenes/types.ts`). Phase 16 adds a `pickables` list to the scene contract, a pure hit→action resolver, raycasting in `VibeScene.vue`, and one layout-level composable that turns actions into navigation.

**Tech stack:** Nuxt 4 SPA, Vue 3.5, Tailwind v4 + design tokens, `@nuxtjs/i18n`, three 0.186, Vitest (happy-dom), Playwright. No new dependency.

**Spec:** this file, § Context (the user's review is the spec).

## Context

User review (verbatim, `/hallmark`):
> - [screenshot of the cartoon Projects panel] => should have blur background (80-90%) to can view below layer. for all 3 themes.
> - In galaxy, when list projects, it scroll to new UI, it bad, 1 section should be append to 1 planet, section project should focus to earth planet, each prject will zoom in to a satellite or star or meteorite or ... [screenshot of the galaxy constellations]
> - with coding theme, same above each section should append to thing (suggest me)
> - No use 01, 02, 03,... It should be a section title.
> - Can you make themes can clickable? If can, it is good

Answers (AskUserQuestion): coding → **System-design map** (client → gateway → one service per job → cluster whose 10 pods are the projects → queue for Contact); clickable → **all three** (section object → go to section; project object → pick it; easter eggs); rail → **short section names**, stage number above panel titles removed.

State today: tip branch `feature/dainq/vibes-12-terminal-projects` (PR #22). Journey = 8 stops: Hello · What I do · HCMUNRE · Applancer · Tuổi Trẻ · FireGroup · Projects (picker) · Contact. Scene contract `update(dt, elapsed, progress, pointer, stop, focus)`. Canvas is `position: fixed; z-index: 0; pointer-events: none` under the `z-10` content column (`app/layouts/default.vue`).

Dev server: run on **:3100** (`npx nuxt dev --port 3100`). Port 3000 is a Colima/Docker forward — never kill it. Playwright: `E2E_BASE_URL=http://localhost:3100 npx playwright test --workers=1` (the config already reads `E2E_BASE_URL` and reuses a running server).

Hallmark: `design.md` is the locked system; this round amends it (user overrides): glass is allowed on `/about` journey panels; the stage-number pattern is removed. Disciplines kept: tokens only, no italic headings, AA contrast, reduced motion, 320/375/414/768 checks, honest copy (scene labels are names, never invented numbers). Canvas stays `aria-hidden`: every scene click has a DOM equivalent (rail link, picker button), so nothing is pointer-only.

## Global Constraints
- Files < 300 lines; functions < ~50 lines; immutable data in pure modules.
- CSS uses tokens only (`var(--color-*)`, `--space-*`, `--dur-*`, `--ease-*`); kebab-case classes; `(width >= …)` media ranges; empty line before comments.
- Animate transform/opacity/uniforms only. `prefers-reduced-motion`: scenes render one frame per state change; clicks still navigate; easter eggs no-op.
- `detail: 'low'` (coarse pointer) halves decorative counts.
- ≥ 50 fps desktop on each vibe's Projects stop (BrowserOS); heap plateau over 21 vibe switches; no console errors.
- Vietnamese copy keeps English job titles / product names / technical terms.
- Stop dev by port before typecheck: `lsof -ti tcp:3100 | xargs kill`.
- Commits: conventional, lowercase subject; trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Review Focus
1. Glass panel text still passes AA against the worst possible backdrop (composited over both white and black) in every vibe × mode.
2. A click on a panel, link, button, header or footer never triggers a scene action, even if a scene object lies under it.
3. Scene-click navigation and rail navigation end in the same state (active stop, picker selection, camera framing).
4. Picker ↔ scene stay in sync both ways; keyboard model (`nextPick`) unchanged.
5. Vibe switch on any stop (and with a project picked) frames that stop's anchor / orbiter / pod on frame one in galaxy and terminal.

---

## Phase 13 — Glass panels + named rail

Branch `feature/dainq/vibes-13-glass-rail` from `feature/dainq/vibes-12-terminal-projects`. PR #23 → base `vibes-12-terminal-projects`.

### Task 13.1 — Short names for career stages

**Files:** `app/data/profile.ts`, `app/data/profile.en.ts`, `app/data/profile.vi.ts`, `test/profile.spec.ts`.

**Interfaces:** Produces `TimelineEntry.short: string`.

- [ ] **Step 1: failing test** — append inside `describe('profile content')` in `test/profile.spec.ts`:
```ts
  test('every career stage has a short rail name', () => {
    for (const content of [vi, en]) {
      for (const entry of content.timeline) {
        expect(entry.short.trim().length).toBeGreaterThan(0)
        expect(entry.short.length).toBeLessThanOrEqual(12)
      }
    }
    // Names, not prose: only the Vietnamese diacritics may differ.
    expect(vi.timeline.map((e) => e.short.normalize('NFD').replace(/\p{M}/gu, '').replace('Đ', 'D'))).toEqual(en.timeline.map((e) => e.short))
  })
```
Run `npx vitest run test/profile.spec.ts` → FAIL (`short` undefined).

- [ ] **Step 2: implement**
  - `profile.ts` `TimelineEntry`: add after `org: string`:
```ts
  /** Rail label: a name short enough for the side rail (≤ 12 chars). */
  short: string
```
  - `profile.en.ts` timeline entries in order: `short: 'HCMUNRE'`, `short: 'Applancer'`, `short: 'Tuoi Tre'`, `short: 'FireGroup'`.
  - `profile.vi.ts`: `short: 'HCMUNRE'`, `short: 'Applancer'`, `short: 'Tuổi Trẻ'`, `short: 'FireGroup'`.
- [ ] **Step 3:** run → PASS.

### Task 13.2 — Shared journey labels

**Files:** create `app/composables/useJourneyLabels.ts`; modify `app/pages/about/index.vue`.

**Interfaces:** Produces `useJourneyLabels(): ComputedRef<string[]>` (one per stop, stop order). Phase 16 reuses it for hover labels.

- [ ] Create:
```ts
// One short label per /about stop, in stop order — the rail and the scene
// hover labels share it.
export function useJourneyLabels() {
  const {t} = useI18n()
  const content = useProfile()
  return computed(() => [
    t('about.hello'),
    t('about.whatIDo'),
    ...content.value.timeline.map((entry) => entry.short),
    t('about.projects'),
    t('about.sayHello')
  ])
}
```
- [ ] `about/index.vue`: replace the `stopLabels` computed with `const stopLabels = useJourneyLabels()`.

### Task 13.3 — Rail of names

**Files:** `app/components/journey/Rail.vue`, `app/pages/about/index.vue` (journey padding), `e2e/about-journey.spec.ts`.

- [ ] **Step 1: failing e2e** — in `e2e/about-journey.spec.ts` replace the body of `'rail tracks the centred stop on desktop'` with:
```ts
    await page.goto('/en/about')
    await expect(page.locator('.rail-link')).toHaveText(['Hello', 'What I do', 'HCMUNRE', 'Applancer', 'Tuoi Tre', 'FireGroup', 'Projects', 'Say hello'])

    await page.locator('#stop-4').scrollIntoViewIfNeeded()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '4')
    await expect(page.locator('.rail-link[aria-current="step"]')).toHaveText('Tuoi Tre')

    await page.locator('.rail-link', {hasText: 'Say hello'}).click()
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '7')

    // The rail never sits on top of a panel.
    const rail = (await page.locator('nav.rail').boundingBox())!
    const panel = (await page.locator('#stop-7 .stop-panel').boundingBox())!
    expect(rail.x + rail.width).toBeLessThanOrEqual(panel.x)
```
and add a test:
```ts
  test('panels carry a section title only, no stage number', async ({page}) => {
    await page.goto('/about')
    await page.locator('#stop-0').waitFor()
    await expect(page.locator('.stop-stage')).toHaveCount(0)
  })
```
Run (dev on :3100) `E2E_BASE_URL=http://localhost:3100 npx playwright test e2e/about-journey.spec.ts --workers=1 -g "rail tracks|stage number"` → FAIL.

- [ ] **Step 2: `Rail.vue` template + script**
```vue
<template>
  <nav class="rail" :aria-label="t('about.stops')">
    <ol class="rail-list">
      <li v-for="(label, i) in labels" :key="i">
        <a :href="`#stop-${i}`" class="rail-link" :aria-current="i === active ? 'step' : undefined">
          <span class="rail-dot" aria-hidden="true"/>
          <span class="rail-label font-mono">{{ label }}</span>
        </a>
        <!-- Which project is picked inside the projects stop; the picker itself is the accessible control. -->
        <span v-if="sub && sub.stop === i" class="rail-sub" aria-hidden="true">
          <span v-for="k in sub.count" :key="k" class="rail-sub-dot" :class="{'is-on': sub.active === k - 1}"/>
        </span>
      </li>
    </ol>
  </nav>
</template>
```
(script unchanged.)
- [ ] **Step 3: `Rail.vue` styles** — replace the `@media` block body with:
```css
@media (width >= 60rem) and (height >= 42rem) {
  .rail {
    position: fixed;
    top: 50%;
    left: var(--space-md);
    z-index: 20;
    display: block;
    transform: translateY(-50%);
  }

  .rail-list {
    display: grid;
    gap: var(--space-3xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rail-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    min-height: 2rem;
    padding: 0 var(--space-xs) 0 var(--space-2xs);
    border-radius: var(--radius-pill);
    color: var(--color-muted);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
  }

  .rail-link:hover {
    color: var(--color-ink);
  }

  .rail-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .rail-link[aria-current="step"] {
    color: var(--color-ink);
    background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  }

  .rail-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentcolor;
  }

  .rail-link[aria-current="step"] .rail-dot {
    background: var(--color-accent);
    transform: scale(1.5);
  }

  .rail-label {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }

  .rail-sub {
    display: grid;
    gap: 3px;
    padding: var(--space-3xs) 0 var(--space-3xs) calc(var(--space-2xs) + 1px);
  }

  .rail-sub-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-rule);
  }

  .rail-sub-dot.is-on {
    background: var(--color-ink);
  }
}
```
Update the top comment: "N3 side-rail of section names… labels are the short names from `useJourneyLabels`."
- [ ] **Step 4: keep panels clear of the rail** — `about/index.vue` `<style scoped>` add:
```css
/* The fixed rail of names takes ~11rem on the left; push the journey column
   right by whatever part of that its own margin does not already cover. */
@media (width >= 60rem) and (height >= 42rem) {
  .journey {
    padding-inline-start: max(0px, calc(11rem - (100vw - 100%) / 2));
  }
}
```
- [ ] **Step 5:** update `e2e/i18n.spec.ts` "rail is labelled" test to also assert `.rail-link` first text `Xin chào` on `/about` and `Hello` on `/en/about`. Run → PASS.

### Task 13.4 — Glass panels, no stage number

**Files:** `app/components/journey/Stop.vue`, `e2e/contrast.spec.ts`, `e2e/about-journey.spec.ts`, `design.md`.

- [ ] **Step 1: failing e2e** (`about-journey.spec.ts`):
```ts
  test('journey panels are frosted glass over the scene', async ({page}) => {
    await page.goto('/about')
    const panel = page.locator('#stop-0 .stop-panel')
    await panel.waitFor()
    const {filter, alpha} = await panel.evaluate((el) => {
      const s = getComputedStyle(el)
      const m = s.backgroundColor.match(/[\d.]+/g)!.map(Number)
      return {filter: s.backdropFilter || (s as unknown as Record<string, string>).webkitBackdropFilter, alpha: m.length > 3 ? m[3] : 1}
    })
    expect(filter).toContain('blur')
    expect(alpha).toBeGreaterThanOrEqual(0.8)
    expect(alpha).toBeLessThanOrEqual(0.9)
  })
```
(Note: `color-mix(in oklch…)` computes to `oklch(L C H / 0.85)`; the regex takes the 4th number as alpha.) → FAIL.

- [ ] **Step 2: contrast spec handles translucency** — in `e2e/contrast.spec.ts` replace `backgroundOf` and its use:
```ts
  // Translucent backgrounds (the glass journey panels) are measured against the
  // worst case: composited over pure white and over pure black.
  const over = (top: number[], under: number[]) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]))
  const backgroundsOf = (el: Element | null): number[][] => {
    for (let e = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor)
      if (c[3] >= 0.99) return [c]
      if (c[3] > 0.5) return [over(c, [255, 255, 255]), over(c, [0, 0, 0])]
    }
    return [[255, 255, 255, 1]]
  }
```
and `const r = Math.min(...backgroundsOf(el).map((bg) => ratio(rgba(style.color), bg)))`.
- [ ] **Step 3: `Stop.vue`**
  - Template: delete the `<p class="stop-stage …">` line. Script: delete `stage` and the `props` binding (`withDefaults(defineProps…)` without `const props =`).
  - Styles: delete `.stop-stage`; in `.stop-panel` replace `background: var(--color-paper);` with
```css
  background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
```
  and add after the `.stop-panel` rule:
```css
/* No blur support, or the reader asked for less transparency: solid paper. */
@supports not (backdrop-filter: blur(1px)) {
  .stop-panel {
    background: var(--color-paper);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .stop-panel {
    background: var(--color-paper);
  }
}
```
  - Replace the panel comment "Opaque paper panel (glass is banned)" with "Frosted paper panel (85 % paper + 14 px blur, design.md § Surfaces); the scene shows through softly". Stamp line: `numbering=none (section titles)`.
- [ ] **Step 4:** run the new test + `e2e/contrast.spec.ts` (desktop) → PASS. If a vibe fails, raise that vibe's panel alpha to 0.9 via a token `--panel-alpha` (define per vibe in `tokens.css`, default 85 %) — record a ruling.
- [ ] **Step 5: `design.md`** — add a `## Surfaces` bullet: "Journey panels on `/about` are frosted glass: `color-mix(var(--color-paper) 85%, transparent)` + `blur(14px) saturate(1.2)`; solid paper without backdrop-filter support or under `prefers-reduced-transparency`. Glass is allowed nowhere else." In "What pages MUST share" replace "the stage-number pattern on `/about`" with "the rail of section names on `/about`".

### Task 13.5 — Gate
- [ ] Screenshots (3 vibes × light/dark × 1280 and 375) of `/about` stops 0, 3, 6 — check the blur reads, rail labels never overlap panels, phones unchanged except glass.
- [ ] h-scroll check at 320/414/768.
- [ ] `npx vitest run --coverage && npm run lint`; `lsof -ti tcp:3100 | xargs kill; npm run typecheck`; restart dev; `E2E_BASE_URL=http://localhost:3100 npx playwright test --workers=1`.
- [ ] Squash commit `feat(about): glass journey panels and a rail of section names`; push; PR #23 (base `vibes-12-terminal-projects`).

---

## Phase 14 — Galaxy: one planet per section, projects orbit Earth

Branch `feature/dainq/vibes-14-galaxy-planets` from 13. PR #24.

**Files:** create `app/scenes/galaxy/bodies.ts`, `app/scenes/galaxy/earth.ts`, `app/scenes/galaxy/chase.ts`; rewrite `app/scenes/galaxy/index.ts`; modify `streaks.ts` (store `from`); delete `constellation.ts` and `test/galaxyProjects.spec.ts`; create `test/galaxyPlanets.spec.ts`, `test/galaxyChase.spec.ts`.

**Anchors (stop → body):** 0 Hello → Sun · 1 What I do → Mercury · 2 HCMUNRE → Venus · 3 Applancer → Mars · 4 Tuổi Trẻ → Jupiter (ringed) · 5 FireGroup → Saturn (ringed) · **6 Projects → Earth** · 7 Contact → Neptune.

### Task 14.1 — Chase framing (pure)

**Interfaces:** `chaseShot(target: Vector3, radius: number, aspect: number): {eye: Vector3; look: Vector3}`.

- [ ] **Failing test** `test/galaxyChase.spec.ts`:
```ts
import * as THREE from 'three'
import {expect, test} from 'vitest'
import {chaseShot} from '~/scenes/galaxy/chase'

const project = (shot: ReturnType<typeof chaseShot>, p: THREE.Vector3, aspect: number) => {
  const cam = new THREE.PerspectiveCamera(50, aspect, 0.1, 400)
  cam.position.copy(shot.eye)
  cam.lookAt(shot.look)
  cam.updateMatrixWorld()
  return p.clone().project(cam)
}

test('the body sits in the right half on wide screens, above the panel on phones', () => {
  const target = new THREE.Vector3(8, 0.5, -3)
  const wide = project(chaseShot(target, 0.5, 16 / 9), target, 16 / 9)
  expect(wide.x).toBeGreaterThan(0.1)
  expect(wide.x).toBeLessThan(0.8)
  const phone = project(chaseShot(target, 0.5, 0.5), target, 0.5)
  expect(Math.abs(phone.x)).toBeLessThan(0.25)
  expect(phone.y).toBeGreaterThan(0.15)
})

test('bigger bodies are framed from farther away', () => {
  const t = new THREE.Vector3(10, 0, 0)
  expect(chaseShot(t, 0.9, 1.6).eye.distanceTo(t)).toBeGreaterThan(chaseShot(t, 0.3, 1.6).eye.distanceTo(t))
})

test('the camera stands on the sunlit side of a planet', () => {
  const t = new THREE.Vector3(10, 0, 0)
  const {eye} = chaseShot(t, 0.5, 1.6)
  expect(eye.x).toBeLessThan(t.x) // between the planet and the sun at the origin
})
```
- [ ] **Implement** `app/scenes/galaxy/chase.ts`:
```ts
import * as THREE from 'three'
import {panelAim} from '../framing'

// Where the camera stands to frame one body of the system: on its sunlit
// side, a little above and to the side, farther for bigger bodies; aimed so
// the body clears the /about panel.
const DISTANCE = {base: 1.4, perRadius: 7}
const UP = new THREE.Vector3(0, 1, 0)
const SUN_VIEW = new THREE.Vector3(0.4, 0.35, 1).normalize()
const FRAME = {shift: 0.42, drop: 0.3} // fractions of the camera distance

export function chaseShot(target: THREE.Vector3, radius: number, aspect: number): {eye: THREE.Vector3; look: THREE.Vector3} {
  const toSun = target.lengthSq() < 1e-6 ? SUN_VIEW.clone() : target.clone().negate().normalize()
  const side = new THREE.Vector3().crossVectors(toSun, UP).normalize()
  const dir = toSun.multiplyScalar(0.7).addScaledVector(side, 0.55).addScaledVector(UP, 0.45).normalize()
  const distance = DISTANCE.base + radius * DISTANCE.perRadius
  const eye = target.clone().addScaledVector(dir, distance)
  const look = panelAim(target, eye, aspect, {shift: distance * FRAME.shift, drop: distance * FRAME.drop})
  return {eye, look}
}
```
Run → PASS (tune `FRAME` until the three assertions hold; ruling if changed).

### Task 14.2 — Bodies (sun + planets incl. Earth)

**Interfaces:** `buildBodies(colors, random): {group; anchors: THREE.Object3D[]; radii: number[]; sun: THREE.Mesh; halo: THREE.Mesh; earth: THREE.Mesh; update(dt: number): void}` — `anchors[i]` is the body for stop i, named `galaxy-anchor-${i}`.

- [ ] **Failing test** (in `test/galaxyPlanets.spec.ts`):
```ts
import * as THREE from 'three'
import {describe, expect, test} from 'vitest'
import {journeyStations, projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createGalaxyScene} from '~/scenes/galaxy'

const POINTER = {x: 0, y: 0}
const STOPS = journeyStations(PROFILE_CONTENT.en).length
const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)
const PROJECTS = PROFILE_CONTENT.en.projects
const build = (reduceMotion = false, aspect = 16 / 9) => createGalaxyScene({isDark: true, aspect, loadAssets: false, reduceMotion})
const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())
const ndc = (built: ReturnType<typeof build>, o: THREE.Object3D) => {
  built.camera.updateMatrixWorld()
  return world(o).project(built.camera)
}

describe('galaxy journey anchored to bodies', () => {
  test('one anchor per stop; the projects stop is earth', () => {
    const built = build()
    for (let i = 0; i < STOPS; i++) expect(built.scene.getObjectByName(`galaxy-anchor-${i}`)).toBeTruthy()
    expect(built.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)?.userData.body).toBe('earth')
  })

  test('each stop frames its body right of the panel from the first frame', () => {
    for (let i = 0; i < STOPS; i++) {
      const built = build(true)
      built.update(0, 0, 0, POINTER, i, null)
      const p = ndc(built, built.scene.getObjectByName(`galaxy-anchor-${i}`)!)
      expect(p.x, `stop ${i}`).toBeGreaterThan(0.05)
      expect(p.x, `stop ${i}`).toBeLessThan(0.85)
      expect(Math.abs(p.y), `stop ${i}`).toBeLessThan(0.7)
    }
  })

  test('moving between stops eases (no jumps)', () => {
    const built = build()
    for (let i = 0; i < 120; i++) built.update(1 / 60, i / 60, 0, POINTER, 2, null)
    let prev = built.camera.position.clone()
    for (let i = 0; i < 240; i++) {
      built.update(1 / 60, 2 + i / 60, 0, POINTER, 5, null)
      expect(built.camera.position.distanceTo(prev)).toBeLessThan(2)
      prev = built.camera.position.clone()
    }
  })
})
```
→ FAIL.
- [ ] **Implement** `app/scenes/galaxy/bodies.ts` (move `PlanetSpec`, planet building, belt out of `index.ts`):
```ts
import * as THREE from 'three'

// The solar system, with one body per /about stop. Orbits are slow (the
// camera chases a body's live position) and seeded so it looks the same on
// every visit.
export interface BodySpec {
  name: string
  radius: number
  distance: number
  speed: number
  tilt: number
  color: number
  ring?: boolean
  clouds?: boolean
}

export const BODIES: readonly BodySpec[] = [
  {name: 'mercury', radius: 0.28, distance: 3.2, speed: 0.5, tilt: 0.05, color: 0xc98b5e},
  {name: 'venus', radius: 0.42, distance: 4.6, speed: 0.36, tilt: -0.08, color: 0xd9b96b},
  {name: 'earth', radius: 0.55, distance: 6.4, speed: 0.28, tilt: 0.04, color: 0x3f7fd0, clouds: true},
  {name: 'mars', radius: 0.36, distance: 8.2, speed: 0.22, tilt: 0.12, color: 0xd9744e},
  {name: 'jupiter', radius: 0.95, distance: 11.4, speed: 0.13, tilt: -0.04, color: 0xc9a27e, ring: true},
  {name: 'saturn', radius: 0.8, distance: 14.2, speed: 0.1, tilt: 0.1, color: 0xe0c58a, ring: true},
  {name: 'neptune', radius: 0.5, distance: 17, speed: 0.07, tilt: -0.14, color: 0x5f86d9}
]

/** Stop index → body name; 'sun' for Hello. Order: Hello, What I do, 4 career stages, Projects, Contact. */
export const STOP_BODIES = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'earth', 'neptune'] as const

export const SUN_RADIUS = 1.2
const ORBIT_SLOWDOWN = 0.15
const BELT = {count: 600, inner: 9.6, outer: 10.4}
```
  plus `buildBodies(colors, random)` creating, for each `BodySpec`: pivot (`rotation.x = tilt`, `rotation.y = random() * 2π`), `MeshStandardMaterial` sphere at `x = distance`, optional ring (as today), optional cloud shell (`SphereGeometry(radius * 1.04)`, white, `transparent`, `opacity 0.35`, `depthWrite false`), orbit ring (as today); sun + halo as today (`sun.name = 'sun'`); belt as today but between Mars and Jupiter (`9.6–10.4` stays). `anchors = STOP_BODIES.map((name, i) => { const o = name === 'sun' ? sun : planetMeshes[name]; o.name = `galaxy-anchor-${i}`; o.userData.body = name; return o })`; `radii` likewise (`SUN_RADIUS` for the sun). `update(dt)`: `pivot.rotation.y += dt * speed * ORBIT_SLOWDOWN`, planet self-spin `dt * 0.4`, clouds `dt * 0.15`, belt `dt * 0.01`. Throw at build if `STOP_BODIES.length !== journeyStations(PROFILE_CONTENT.en).length` (guards future journey changes) — covered by the "one anchor per stop" test.

### Task 14.3 — Earth system (ten orbiters)

**Interfaces:** `buildEarthSystem(projects, colors, loadAssets): {group; orbiters: THREE.Object3D[]; radii: number[]; update(dt, focus)}` — group is added as a child of the Earth mesh (orbits move with Earth); orbiter k named `orbiter-${k}`, `userData.kind`.

- [ ] **Failing tests** (append to `galaxyPlanets.spec.ts`):
```ts
describe('projects orbit earth', () => {
  test('ten orbiters of mixed kinds around earth', () => {
    const built = build()
    const earth = built.scene.getObjectByName(`galaxy-anchor-${PROJECTS_STOP}`)!
    const kinds = PROJECTS.map((_, k) => {
      const o = built.scene.getObjectByName(`orbiter-${k}`)!
      expect(world(o).distanceTo(world(earth))).toBeLessThan(4)
      return o.userData.kind
    })
    expect(new Set(kinds)).toEqual(new Set(['moon', 'satellite', 'station', 'meteor', 'probe']))
  })

  test('picking a project zooms the camera onto its orbiter', () => {
    const size = (focus: number | null) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, PROJECTS_STOP, focus)
      const o = built.scene.getObjectByName('orbiter-4')!
      return o.userData.radius / built.camera.position.distanceTo(world(o))
    }
    expect(size(4)).toBeGreaterThan(size(null) * 3)
  })

  test('the picked orbiter lands where every picked orbiter lands', () => {
    const at = (k: number) => {
      const built = build(true)
      built.update(0, 0, 0, POINTER, PROJECTS_STOP, k)
      return ndc(built, built.scene.getObjectByName(`orbiter-${k}`)!)
    }
    expect(Math.abs(at(0).x - at(9).x)).toBeLessThan(0.15)
  })

  test('a picked orbiter holds still while picked', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, PROJECTS_STOP, 2)
    const o = built.scene.getObjectByName('orbiter-2')!
    const before = o.position.clone()
    for (let i = 0; i < 120; i++) built.update(1 / 60, i / 60, 0, POINTER, PROJECTS_STOP, 2)
    expect(o.position.distanceTo(before)).toBeLessThan(1e-9)
  })
})
```
- [ ] **Implement** `app/scenes/galaxy/earth.ts`:
```ts
import * as THREE from 'three'

// The Projects stop: Earth with one orbiter per project. Kinds cycle so the
// sky around Earth reads as varied traffic, not a row of identical dots.
export type OrbiterKind = 'moon' | 'satellite' | 'station' | 'meteor' | 'probe'
const KINDS: readonly OrbiterKind[] = ['moon', 'satellite', 'station', 'meteor', 'probe']
const ORBIT = {inner: 1.25, step: 0.22, speed: 0.35, tilt: 0.5}
const SIZE: Readonly<Record<OrbiterKind, number>> = {moon: 0.16, satellite: 0.12, station: 0.15, meteor: 0.11, probe: 0.1}
```
  - one builder per kind using `MeshStandardMaterial` (metal parts `metalness 0.6, roughness 0.4`): moon = `SphereGeometry(r, 16, 12)` grey; satellite = `BoxGeometry(r, r*0.6, r*0.6)` body + two `PlaneGeometry(r*1.6, r*0.6)` panels (blue `0x3b5bdb`, `DoubleSide`) at ±x; station = two crossed `CylinderGeometry(r*0.15, r*0.15, r*2.2)` + a `TorusGeometry(r*0.7, r*0.08)`; meteor = `IcosahedronGeometry(r, 0)` faceted + a `ConeGeometry(r*0.6, r*3)` tail (additive, `opacity 0.4`) pointing back along its orbit; probe = `ConeGeometry(r*0.5, r*1.2)` + `CircleGeometry(r*0.7)` dish.
  - orbiter k: `pivot.rotation.set(ORBIT.tilt * Math.sin(k * 1.7), (k / n) * 2π, 0)`, child at `x = ORBIT.inner + k * ORBIT.step`; `userData = {kind: KINDS[k % 5], radius: SIZE[kind]}`; name `orbiter-${k}` on the child.
  - optional label sprite per orbiter (only when `loadAssets`, mono font, `colors.label`, height 0.12), visible only when picked.
  - `update(dt, focus)`: each pivot `rotation.y += dt * ORBIT.speed / (1 + k * 0.08)` **except** the picked one; labels `visible = k === focus`.
  - Orbiter world positions are read via `getWorldPosition` each frame (Earth moves).

### Task 14.4 — Rewrite `galaxy/index.ts`

**Interfaces:** Consumes `buildBodies`, `buildEarthSystem`, `chaseShot`, `createStreaks`.

- [ ] Implement (full shape):
```ts
export const createGalaxyScene: SceneFactory = ({isDark, aspect, reduceMotion = false, loadAssets = true}) => {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const random = mulberry32(SEED)
  // scene, background, ambient + sun point light as today
  const bodies = buildBodies(colors, random)
  const earthSystem = buildEarthSystem(PROJECTS, colors, loadAssets && typeof window !== 'undefined')
  bodies.earth.add(earthSystem.group)
  const streaks = createStreaks(colors.streak, colors.bg)
  scene.add(bodies.group, stars, streaks.group)

  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  let ready = false
  let lastFocus: number | null = null
  let nextAmbient = nextAmbientDelay(random)

  const target = (stop: number | null, focus: number | null) => {
    if (stop === null) return null // home: the existing overview
    const i = THREE.MathUtils.clamp(Math.round(stop), 0, bodies.anchors.length - 1)
    const picked = i === PROJECTS_STOP && focus !== null ? earthSystem.orbiters[focus] : undefined
    const o = picked ?? bodies.anchors[i]
    return {position: o.getWorldPosition(new THREE.Vector3()), radius: picked ? picked.userData.radius : bodies.radii[i]}
  }

  return {
    scene,
    camera,
    update(dt, elapsed, progress, pointer, stop, focus) {
      const still = reduceMotion ? 0 : dt
      bodies.update(still)
      earthSystem.update(still, stop === PROJECTS_STOP ? focus : null)
      bodies.group.updateMatrixWorld(true)

      const t = target(stop, focus)
      const shot = t ? chaseShot(t.position, t.radius, camera.aspect) : overviewShot(progress, pointer)
      const instant = !ready || reduceMotion
      const k = instant ? 1 : Math.min(1, dt * CAMERA_GLIDE)
      eye.lerp(shot.eye, k)
      look.lerp(shot.look, k)
      if (instant) { eye.copy(shot.eye); look.copy(shot.look) }
      camera.position.copy(eye)
      camera.lookAt(look)
      camera.updateMatrixWorld()

      const picked = stop === PROJECTS_STOP ? focus : null
      if (picked !== null && picked !== lastFocus && !instant) passBy(earthSystem.orbiters[picked], elapsed)
      lastFocus = picked
      if (!reduceMotion && elapsed >= nextAmbient) { ambient(elapsed); nextAmbient = elapsed + nextAmbientDelay(random) }
      streaks.update(elapsed)
      ready = true
    }
  }
}
```
  - `overviewShot(progress, pointer)` = the existing journey sweep (`CAMERA_START/END/SWEEP`, `LOOK_AT`) — used only on `/` (stop null).
  - `passBy(o, elapsed)`: `const p = o.getWorldPosition(v)`; `streaks.launch(p.clone().add(PASS).toArray(), p.clone().sub(PASS).toArray(), elapsed, PICK_DURATION)` with `PASS = new Vector3(-2.4, 1.6, -1)`; the streak crosses the orbiter.
  - `ambient(elapsed)` as today (camera-space start, `AMBIENT_TRAVEL`).
  - `CAMERA_GLIDE = 1.8`.
  - Stars use the seeded `random` (deterministic).
- [ ] `streaks.ts`: in `launch`, also set `slot.line.userData.from = from`. Add a test in `galaxyPlanets.spec.ts`:
```ts
  test('picking an orbiter sends a shooting star right past it', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, PROJECTS_STOP, 0)
    built.update(1 / 60, 0.1, 0, POINTER, PROJECTS_STOP, 6)
    const p = world(built.scene.getObjectByName('orbiter-6')!)
    const line = built.scene.getObjectByName('streaks')!.children.find((c) => c.visible && c.userData.from)!
    const a = new THREE.Vector3(...line.userData.from)
    const b = new THREE.Vector3(...line.userData.to)
    const closest = new THREE.Line3(a, b).closestPointToPoint(p, true, new THREE.Vector3())
    expect(closest.distanceTo(p)).toBeLessThan(0.6)
  })
```
- [ ] Delete `constellation.ts`, `test/galaxyProjects.spec.ts`; keep `test/streaks.spec.ts`. Update `scenes.spec.ts` only if a generic test breaks (it should not).
- [ ] Run `npx vitest run test/galaxyPlanets.spec.ts test/galaxyChase.spec.ts test/streaks.spec.ts test/scenes.spec.ts` → PASS.

### Task 14.5 — Calibrate + gate
- [ ] Screenshots galaxy light/dark 1280: `/`, `/about` stops 0–7, Projects picks 0, 4, 9; 375: stops 0, 6 (pick 3). Body visible right of (or above) the glass panel; orbiter readable; nothing the size of the screen. Tune `DISTANCE`, `FRAME`, `ORBIT` (rulings).
- [ ] BrowserOS fps (Projects stop) + heap over 21 switches.
- [ ] `design.md` Motion: replace the galaxy bullet with "Galaxy: each `/about` section is a body of the solar system (Sun, then planets); the camera glides to it. Projects is Earth with ten orbiters (moon, satellites, a station, meteors, probes); picking one zooms to it and a shooting star passes it."
- [ ] Gate as Phase 13; squash `feat(scene): galaxy journey anchored to planets, projects orbit earth`; PR #24.

---

## Phase 15 — Coding: system-design map

Branch `feature/dainq/vibes-15-terminal-architecture` from 14. PR #25.

**Files:** create `app/scenes/terminal/architecture.ts` (pure), `nodes.ts`, `packets.ts`, `labels.ts` (shared mono sprite — also used by galaxy earth labels if convenient); rewrite `app/scenes/terminal/index.ts`; delete `graph.ts`, `commitGraph.ts`, `test/commitGraph.spec.ts`; create `test/architecture.spec.ts`, `test/terminalMap.spec.ts`.

### Task 15.1 — Layout (pure)

**Interfaces:**
```ts
export type Vec3 = [number, number, number]
export type NodeKind = 'client' | 'gateway' | 'service' | 'cluster' | 'queue'
export interface ArchNode {kind: NodeKind; position: Vec3; label: string}
export interface Architecture {nodes: ArchNode[]; edges: Array<[number, number]>; pods: Array<{position: Vec3; pool: number}>; pools: string[]}
export function layoutArchitecture(stations: readonly {kind: StationKind}[], timeline: readonly {short: string}[], projects: readonly {group: string}[]): Architecture
```
- [ ] **Failing test** `test/architecture.spec.ts`:
```ts
import {expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {layoutArchitecture} from '~/scenes/terminal/architecture'

const {en} = PROFILE_CONTENT
const arch = layoutArchitecture(journeyStations(en), en.timeline, en.projects)
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

test('one node per stop, in stop order, of the right kind', () => {
  expect(arch.nodes.map((n) => n.kind)).toEqual(['client', 'gateway', 'service', 'service', 'service', 'service', 'cluster', 'queue'])
  expect(arch.nodes.slice(2, 6).map((n) => n.label)).toEqual(['svc/hcmunre', 'svc/applancer', 'svc/tuoi-tre', 'svc/firegroup'])
})

test('requests flow node to node along the journey', () => {
  expect(arch.edges).toEqual(arch.nodes.slice(1).map((_, i) => [i, i + 1]))
})

test('nodes keep their distance; pods sit inside the cluster, one pool per employer', () => {
  for (let a = 0; a < arch.nodes.length; a++) for (let b = a + 1; b < arch.nodes.length; b++) expect(dist(arch.nodes[a].position, arch.nodes[b].position)).toBeGreaterThanOrEqual(2.5)
  const cluster = arch.nodes[6].position
  expect(arch.pods).toHaveLength(en.projects.length)
  for (const pod of arch.pods) expect(dist(pod.position, cluster)).toBeLessThan(4)
  expect(arch.pools).toEqual(['FireGroup Technology', 'Tuoi Tre Newspaper'])
  arch.pods.forEach((pod, k) => expect(arch.pools[pod.pool]).toBe(en.projects[k].group))
})

test('the same map on every visit', () => {
  expect(layoutArchitecture(journeyStations(en), en.timeline, en.projects)).toEqual(arch)
})
```
- [ ] **Implement**:
```ts
import type {StationKind} from '~/data/journeyStations'

// The coding vibe's /about journey as a backend system: a request leaves the
// client, passes the gateway and one service per career stage, lands on the
// cluster that runs the projects, and ends in the contact queue. Two rows,
// left to right then back, floating over the flowing grid.
const SLOTS: readonly Vec3[] = [
  [-18, 3, -10], [-10, 3.5, -13], [-2, 3, -10], [6, 3.5, -13], [14, 3, -10],
  [18, 3.5, -24], [6, 3, -28], [-8, 3.5, -26]
]
const KIND: Readonly<Record<StationKind, NodeKind>> = {
  home: 'client', workshop: 'gateway', school: 'service', office: 'service', press: 'service', tower: 'service', yard: 'cluster', post: 'queue'
}
const POD = {columns: 5, spacing: 1.4, poolGap: 1.8}
const slug = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace('đ', 'd').replace('Đ', 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function layoutArchitecture(stations, timeline, projects): Architecture {
  if (stations.length > SLOTS.length) throw new Error(`architecture has ${SLOTS.length} slots for ${stations.length} stops`)
  let career = 0
  const nodes = stations.map((s, i): ArchNode => {
    const kind = KIND[s.kind]
    const label = kind === 'service' ? `svc/${slug(timeline[career++].short)}` : {client: 'client', gateway: 'api-gateway', cluster: 'k8s/projects', queue: 'queue/contact', service: ''}[kind]
    return {kind, position: SLOTS[i], label}
  })
  const edges = nodes.slice(1).map((_, i): [number, number] => [i, i + 1])
  const pools = projects.reduce<string[]>((all, p) => (all.includes(p.group) ? all : [...all, p.group]), [])
  const cluster = nodes[stations.findIndex((s) => s.kind === 'yard')].position
  const seen = pools.map(() => 0)
  const pods = projects.map((p) => {
    const pool = pools.indexOf(p.group)
    const col = seen[pool]++
    const position: Vec3 = [cluster[0] + (col - (POD.columns - 1) / 2) * POD.spacing, cluster[1] + 0.4, cluster[2] + (pool - (pools.length - 1) / 2) * POD.poolGap]
    return {position, pool}
  })
  return {nodes, edges, pods, pools}
}
```
(Types annotated in the real file.) Run → PASS.

### Task 15.2 — Node meshes + pods

**Interfaces:** `buildArchitecture(arch, colors, loadAssets): {group; anchors: THREE.Object3D[]; pods: THREE.Object3D[]; scales: number[]; setFocus(k: number | null): void}` — anchor i named `arch-anchor-${i}`, pod k named `pod-${k}` with `userData.radius`.

- [ ] Meshes (all `MeshBasicMaterial`, grid colour; solid fill colour `colors.solid` for bodies under wireframes, like today's icosahedron):
  - client: `IcosahedronGeometry(1.1, 1)` solid + wireframe shell (the former hero icosahedron, now a node).
  - gateway: `CylinderGeometry(1, 1, 0.7, 6)` (hex prism) solid + `EdgesGeometry` lines.
  - service: `BoxGeometry(1.4, 1.4, 1.4)` solid + edges; label sprite above (`node.label`).
  - cluster: rounded platform `BoxGeometry(8, 0.25, 4.4)` edges + solid at 0.25 opacity; pool labels (`pools[i]`, short form via the timeline `short` of the matching employer, else the group) at each row's left end; pods = `BoxGeometry(0.55, 0.55, 0.55)` each its own small Mesh with its own material (10 meshes — cheap) so `setFocus` can dim.
  - queue: `CapsuleGeometry(0.5, 2.2, 4, 8)` rotated to lie along x, plus three `TorusGeometry(0.55, 0.04)` rings.
  - edges between nodes: one `Line` per edge, grid colour, opacity 0.5.
  - labels: `labels.ts` `monoLabel(text, color, height)` (same canvas technique as before); only when `loadAssets`.
- [ ] `setFocus(k)`: pod materials opacity 1 for k (and all when null), 0.25 otherwise; picked pod `scale 1.25`.
- [ ] `scales`: framing scale per anchor — client 1, gateway 1, service 1, cluster 1.7, queue 1.1.

### Task 15.3 — Packets

**Interfaces:** `createPackets(arch, colors, detail): {mesh: THREE.InstancedMesh; update(elapsed: number, dt: number): void; burst(from: number, to: number, elapsed: number): void}`; pure `packetAt(a: Vec3, b: Vec3, t: number): Vec3` (lerp, `t` clamped 0..1).

- [ ] Failing tests (in `test/terminalMap.spec.ts`): `packetAt` endpoints/midpoint; after 2 s of updates instance matrices changed; `reduceMotion` scene: matrices unchanged after updates; on stop change 3→4 a burst is active on edge [3,4] (`packets.mesh.userData.burst` = `[3, 4]`).
- [ ] Implement: steady packets = 1 per edge (`detail low`) / 2 per edge (`high`), each loops `t = (elapsed * SPEED / edgeLength + phase) % 1`; burst = 5 extra instances staggered by 0.12 along one edge for 1.2 s, then hidden (scale 0). Cube `0.18`, grid colour.

### Task 15.4 — Rewrite `terminal/index.ts`

- [ ] **Failing tests** `test/terminalMap.spec.ts` (mirror the galaxy ones): one `arch-anchor-i` per stop; each stop frames its anchor in NDC x ∈ (0.05, 0.85) at 16:9 on frame one (reduced motion); easing has no jump > 2 units/frame; Projects stop with focus k: `pod-k` apparent size (radius / distance) ≥ 2.5× the size without focus, and pods 0 and 9 land within 0.15 NDC x of each other; `pod-k` opacity 1, others 0.25.
- [ ] Implement camera: `shot(i, focus)`:
```ts
const OFFSET = new THREE.Vector3(0, 3.5, 9)
const POD_SCALE = 0.42
const FRAME = {shift: 3.6, drop: 2.2}
// …
const o = picked ?? map.anchors[i]
const scale = picked ? POD_SCALE : map.scales[i]
const at = o.getWorldPosition(new THREE.Vector3())
const eye = at.clone().addScaledVector(OFFSET, scale)
const look = panelAim(at, eye, camera.aspect, {shift: FRAME.shift * scale, drop: FRAME.drop * scale})
```
  Stop null (home): overview `eye (6, 15, 16)`, `look (-5, 0, -22)` (calibrate so the map sits right of the hero), plus pointer sway as today. Eye/look lerp `k = min(1, dt * 2)`; instant on first frame / reduced motion. Grid tiles keep flowing (unchanged code). Remove the icosahedron and the commit graph. On stop change (prev !== null, new !== null, adjacent or not) call `packets.burst(min, max)` along the edge into the new stop (`[new - 1, new]` when moving forward, `[new, new + 1]` backward; skip if out of range).
- [ ] Run terminal + scenes specs → PASS; delete commit-graph files/tests.

### Task 15.5 — Calibrate + gate
- [ ] Screenshots terminal light/dark 1280: `/`, stops 0–7, Projects picks 0, 5, 9; 375: stops 0, 6. Labels legible (light palette line contrast ≥ 3:1 vs bg).
- [ ] BrowserOS fps + heap.
- [ ] `design.md` Motion: replace the terminal bullet with "Terminal: the `/about` journey is a system-design map over the flowing grid — client, gateway, one service per career stage, the projects cluster, the contact queue; request packets flow along the wires and burst along the edge you just travelled; picking a project zooms to its pod."
- [ ] Gate; squash `feat(scene): coding vibe journey as a system-design map`; PR #25.

---

## Phase 16 — Clickable scenes

Branch `feature/dainq/vibes-16-clickable` from 15. PR #26.

**Files:** `app/scenes/types.ts`; create `app/scenes/picking.ts`, `app/composables/useSceneAction.ts`, `app/composables/useSceneNavigation.ts`; modify `app/components/VibeScene.vue`, `app/layouts/default.vue`, `app/components/journey/ProjectPicker.vue`, `app/pages/about/index.vue`, every scene (`cartoon/index.ts`, `cartoon/train.ts`, `cartoon/world.ts`, `galaxy/index.ts`, `terminal/index.ts`), `i18n/locales/*.json`; tests `test/picking.spec.ts`, `test/pickables.spec.ts`, `e2e/scene-click.spec.ts`.

### Task 16.1 — Contract + pure resolution

- [ ] `types.ts`:
```ts
export type SceneAction = {type: 'stop'; stop: number} | {type: 'project'; project: number} | {type: 'fun'; id: string}

export interface VibeScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /** Objects the pointer can hit; each (or an ancestor) carries userData.action. */
  pickables: THREE.Object3D[]
  update(…): void
  /** Play a decorative reaction (train whistle, solar flare…). */
  play(id: string, elapsed: number): void
}
```
- [ ] **Failing test** `test/picking.spec.ts`:
```ts
import * as THREE from 'three'
import {expect, test} from 'vitest'
import {resolveAction, shouldHandleClick} from '~/scenes/picking'

test('resolveAction walks up to the nearest object that carries an action', () => {
  const station = new THREE.Group()
  station.userData.action = {type: 'stop', stop: 3}
  const wall = new THREE.Mesh()
  station.add(wall)
  expect(resolveAction(wall)).toEqual({type: 'stop', stop: 3})
  expect(resolveAction(new THREE.Mesh())).toBeNull()
  expect(resolveAction(null)).toBeNull()
})

test('clicks on page UI never reach the scene', () => {
  document.body.innerHTML = `
    <main><div class="stop-panel"><p id="copy">x</p></div><a id="link" href="#"><span id="inner">a</span></a></main>
    <div id="bare"></div>`
  for (const id of ['copy', 'link', 'inner']) expect(shouldHandleClick(document.getElementById(id))).toBe(false)
  expect(shouldHandleClick(document.getElementById('bare'))).toBe(true)
  expect(shouldHandleClick(document.body)).toBe(true)
})
```
- [ ] Implement `app/scenes/picking.ts`:
```ts
import type * as THREE from 'three'
import type {SceneAction} from './types'

// Page UI always wins over the scene underneath it.
const PAGE_UI = 'a, button, input, select, textarea, label, summary, [role="button"], .stop-panel, header, footer, nav, .rail'

export function shouldHandleClick(target: Element | null): boolean {
  return !target?.closest(PAGE_UI)
}

export function resolveAction(hit: THREE.Object3D | null): SceneAction | null {
  for (let o = hit; o; o = o.parent) {
    const action = o.userData.action as SceneAction | undefined
    if (action) return action
  }
  return null
}

/** Tag an object as clickable. */
export function pickable<T extends THREE.Object3D>(object: T, action: SceneAction): T {
  object.userData.action = action
  return object
}
```

### Task 16.2 — Every scene exposes pickables

- [ ] **Failing test** `test/pickables.spec.ts`:
```ts
import {describe, expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {resolveAction} from '~/scenes/picking'
import {createTerminalScene} from '~/scenes/terminal'

const STOPS = journeyStations(PROFILE_CONTENT.en).length
const PROJECTS = PROFILE_CONTENT.en.projects.length
const FUN = {cartoon: ['whistle', 'spin'], galaxy: ['comet'], terminal: ['burst']}

describe.each([['cartoon', createCartoonScene], ['galaxy', createGalaxyScene], ['terminal', createTerminalScene]] as const)('%s pickables', (name, factory) => {
  const built = factory({isDark: false, aspect: 16 / 9, loadAssets: false})
  const actions = built.pickables.map((o) => resolveAction(o)!)

  test('every pickable resolves to an action', () => expect(actions.every(Boolean)).toBe(true))
  test('every stop is reachable', () => {
    expect(new Set(actions.flatMap((a) => (a.type === 'stop' ? [a.stop] : [])))).toEqual(new Set(Array.from({length: STOPS}, (_, i) => i)))
  })
  test('every project is reachable', () => {
    expect(new Set(actions.flatMap((a) => (a.type === 'project' ? [a.project] : [])))).toEqual(new Set(Array.from({length: PROJECTS}, (_, i) => i)))
  })
  test('easter eggs play without errors', () => {
    expect(new Set(actions.flatMap((a) => (a.type === 'fun' ? [a.id] : [])))).toEqual(new Set(FUN[name]))
    for (const id of FUN[name]) expect(() => built.play(id, 1)).not.toThrow()
  })
})
```
- [ ] Implement per scene:
  - **cartoon** (`index.ts`): `pickables = [...stations.anchors.map((_, i) => pickable(scene.getObjectByName(`station-${i}`)!, {type: 'stop', stop: i})), ...platforms likewise (same action), ...billboards (`billboard-k` → project k), pickable(train.group, {type: 'fun', id: 'whistle'}), pickable(world.windmill, {type: 'fun', id: 'spin'})]`. Billboards are children of the yard station: tag billboards *after* the station so `resolveAction` (nearest ancestor) returns the project, not the stop. Expose `world.windmill` (the mill group) from `buildWorld`.
    - `train.ts`: add `toot(elapsed)` → `tootUntil = elapsed + 1.2`; in `place`, when `elapsed < tootUntil` (pass `elapsed` into `place`) smoke `activity = 1` and puff life advances ×2.
    - `world.ts`: `spin(elapsed)` → blade speed boost `BLADE_SPEED * 6` decaying to normal over 2 s.
    - `play(id, elapsed)`: `if (reduceMotion) return`; `whistle` → `train.toot(elapsed)`; `spin` → `world.spin(elapsed)`.
  - **galaxy** (easter egg is a dedicated object, so it never competes with a section anchor): a small comet (`IcosahedronGeometry(0.25)` head + additive cone tail) on a long elliptical path through the outer system, one lap per ~40 s. Pickables: `galaxy-anchor-i` → stop i (sun = stop 0); `orbiter-k` → project k (orbiters are children of Earth, so `resolveAction`'s nearest-ancestor rule returns the project); comet → `{type: 'fun', id: 'comet'}`. `play('comet')`: launch 6 streaks fanning out from the comet's position (a shower), skipped under reduced motion. Tiny orbiters get an invisible hit sphere child (radius 0.35, `new MeshBasicMaterial({visible: false})` — `Mesh.raycast` ignores `material.visible`, so it still hits) so they are clickable. `FUN.galaxy = ['comet']`, i18n key `scene.fun.comet`.
  - **terminal**: grid tiles → `{type: 'fun', id: 'burst'}` (big, easy target under the map); nodes sit above the grid so the nearest hit is the node when the pointer is on one.
  - **terminal** pickables: `arch-anchor-i` → stop i, `pod-k` → project k (pods are children of the cluster node; nearest ancestor wins), grid tiles → fun burst. `play('burst')` → `packets.burst` along every edge, staggered 0.15 s per edge.

### Task 16.3 — Pointer in `VibeScene.vue`

- [ ] `app/composables/useSceneAction.ts`:
```ts
import type {SceneAction} from '~/scenes/types'

// The last thing clicked in the 3D scene. `at` makes repeated identical clicks fire.
export const useSceneAction = () => useState<{action: SceneAction; at: number} | null>('scene-action', () => null)
```
- [ ] `VibeScene.vue` additions:
```ts
import {resolveAction, shouldHandleClick} from '~/scenes/picking'
const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
const sceneAction = useSceneAction()
const labels = useJourneyLabels()
const content = useProfile()
const {t} = useI18n()
const hover = reactive({label: '', x: 0, y: 0})

function hitAt(event: PointerEvent | MouseEvent) {
  if (!active || !canvas.value) return null
  ndc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, active.camera)
  const hit = raycaster.intersectObjects(active.pickables, true)[0]
  return hit ? resolveAction(hit.object) : null
}

function labelFor(action: SceneAction): string {
  if (action.type === 'stop') return labels.value[action.stop] ?? ''
  if (action.type === 'project') return content.value.projects[action.project]?.alt ?? ''
  return t(`scene.fun.${action.id}`)
}

function onClick(event: MouseEvent) {
  if (!shouldHandleClick(event.target as Element)) return
  const action = hitAt(event)
  if (!action) return
  if (action.type === 'fun') active?.play(action.id, elapsed)
  else sceneAction.value = {action, at: performance.now()}
}

function onHover(event: PointerEvent) {
  const action = shouldHandleClick(event.target as Element) ? hitAt(event) : null
  hover.label = action ? labelFor(action) : ''
  hover.x = event.clientX
  hover.y = event.clientY
  document.documentElement.style.cursor = action ? 'pointer' : ''
}
```
  - `onPointerMove` (existing, sway) also calls `onHover` throttled to one per animation frame (`hoverPending` flag cleared in `tick`); under reduced motion register a separate `pointermove` listener that only does `onHover`.
  - `window.addEventListener('click', onClick)` in `onMounted` after the scene exists; remove both in `onBeforeUnmount`; reset cursor on unmount.
  - Template adds a tooltip next to the canvas:
```vue
  <div v-if="hover.label" class="scene-tip font-mono" aria-hidden="true" :style="{transform: `translate(${hover.x + 14}px, ${hover.y + 14}px)`}">{{ hover.label }}</div>
```
```css
.scene-tip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  padding: var(--space-3xs) var(--space-xs);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-paper) 90%, transparent);
  color: var(--color-ink);
  font-size: var(--text-sm);
  white-space: nowrap;
  pointer-events: none;
}
```
  - Dev-only e2e hook (stripped in production by `import.meta.dev`):
```ts
if (import.meta.dev) {
  ;(window as unknown as {__qdjrScene?: unknown}).__qdjrScene = {
    screenPointOf(name: string) {
      const o = active?.scene.getObjectByName(name)
      if (!o || !active) return null
      const p = o.getWorldPosition(new THREE.Vector3()).project(active.camera)
      return {x: ((p.x + 1) / 2) * window.innerWidth, y: ((1 - p.y) / 2) * window.innerHeight}
    }
  }
}
```
- [ ] i18n keys `scene.fun.whistle` ("Kéo còi tàu" / "Blow the whistle"), `scene.fun.spin` ("Quay cối xay gió" / "Spin the windmill"), `scene.fun.comet` ("Bắt sao chổi" / "Catch the comet"), `scene.fun.burst` ("Gửi một loạt request" / "Send a burst of requests").

### Task 16.4 — Navigation from actions

- [ ] `app/composables/useSceneNavigation.ts` (called once from `app/layouts/default.vue`):
```ts
// Turns scene clicks into page navigation. On /about it scrolls to the stop
// (and picks the project); elsewhere it opens /about at that stop.
export function useSceneNavigation() {
  const action = useSceneAction()
  const focus = useJourneyFocus()
  const route = useRoute()
  const localePath = useLocalePath()
  const getRouteBaseName = useRouteBaseName()
  const reduce = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  watch(action, async (current) => {
    if (!current || current.action.type === 'fun') return
    const stop = current.action.type === 'stop' ? current.action.stop : projectsStopIndex(PROFILE_CONTENT.en)
    if (getRouteBaseName(route) !== 'about') {
      await navigateTo(`${localePath('/about')}#stop-${stop}`)
      return
    }
    document.getElementById(`stop-${stop}`)?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'})
    if (current.action.type === 'project') focus.value = current.action.project
  })
}
```
- [ ] `about/index.vue`: on mount, honour a `#stop-i` hash (SPA mounts stops after load):
```ts
onMounted(() => {
  const id = useRoute().hash.slice(1)
  if (id.startsWith('stop-')) nextTick(() => document.getElementById(id)?.scrollIntoView({block: 'center'}))
})
```
- [ ] `ProjectPicker.vue`: sync from the shared focus too (scene picks):
```ts
watch(focus, (value) => {
  if (value !== null && value !== selected.value && value >= 0 && value < props.projects.length) selected.value = value
})
```
- [ ] e2e `e2e/scene-click.spec.ts` (desktop only, each vibe):
```ts
import {expect, test} from '@playwright/test'

const VIBES = {cartoon: {stop: 'station-3', project: 'billboard-4'}, galaxy: {stop: 'galaxy-anchor-3', project: 'orbiter-4'}, terminal: {stop: 'arch-anchor-3', project: 'pod-4'}}

for (const [vibe, names] of Object.entries(VIBES)) {
  test(`clicking the ${vibe} scene navigates and picks`, async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'pointer + rail layout')
    await page.addInitScript((v) => localStorage.setItem('vibe', v), vibe)
    await page.goto('/about')
    const point = (name: string) => page.evaluate((n) => (window as unknown as {__qdjrScene: {screenPointOf(n: string): {x: number; y: number} | null}}).__qdjrScene.screenPointOf(n), name)

    // Stand on stop 2 so stop 3's object is in view, then click it.
    await page.locator('#stop-2').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)
    const s = (await point(names.stop))!
    await page.mouse.click(s.x, s.y)
    await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '3')

    await page.locator('#stop-6').scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)
    const p = (await point(names.project))!
    await page.mouse.click(p.x, p.y)
    await expect(page.locator('#stop-6 .picker-item').nth(4)).toHaveAttribute('aria-pressed', 'true')
  })
}

test('a click on a panel never triggers the scene', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one run is enough')
  await page.goto('/about')
  await page.locator('#stop-6').scrollIntoViewIfNeeded()
  await page.locator('#stop-6 .stop-title').click()
  await page.waitForTimeout(800)
  await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', '6')
})
```
  If a target point lies under the panel, the test must first assert the point is outside every `.stop-panel` box, and pick a different stop object if not (calibration ruling).

### Task 16.5 — Gate
- [ ] BrowserOS manual pass per vibe: hover shows a name and pointer cursor; clicks navigate/pick/play; no click-through from panels; fps unchanged (raycast only on pointer events).
- [ ] `design.md` Microinteractions: "Scene objects are clickable shortcuts (pointer only; the rail and picker remain the accessible controls): a section object goes to its section, a project object picks it, an easter egg per vibe (cartoon: train whistle, windmill; galaxy: comet; terminal: request burst). Hover shows the name in a small mono tooltip."
- [ ] Gate; squash `feat(scene): click scene objects to navigate, pick projects and play`; PR #26. Update project memory (PRs #23–#26, port 3100 note).

## Verification (every phase)
1. `npx vitest run --coverage` — branches ≥ 80 %; `npm run lint`; `lsof -ti tcp:3100 | xargs kill; npm run typecheck`.
2. `npx nuxt dev --port 3100` then `E2E_BASE_URL=http://localhost:3100 npx playwright test --workers=1`.
3. Screenshots listed per phase (3 vibes × light/dark × 1280/375); 320/414/768 horizontal-scroll check.
4. BrowserOS: ≥ 50 fps on the Projects stop, heap plateau over 21 vibe switches, no console errors.
5. Each phase: squash to one commit, push, open its stacked PR with a test-plan body.
