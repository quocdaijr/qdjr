# Projects sub-section — Implementation Plan (Phase 9)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, chosen pattern for this repo). Steps use `- [ ]`.

**Goal:** Replace the ten one-per-project journey stops on `/about` with ONE "Projects" stop that holds a project picker (grouped logo list + detail panel), so the journey reads Hello · Skills · 4 career stages · Projects · Contact (8 stops instead of 17).

**Architecture:** A new `JourneyProjectPicker` component renders inside a single `JourneyStop`. Selection lives in a new shared state `useJourneyFocus()` (selected project index, or null when the picker is not mounted) next to `useJourneyStop()`. Scenes receive it as a 6th `update` argument. The cartoon scene collapses ten kiosk stations into one "project yard" station (ten billboards on a plaza); the chase camera aims at the selected billboard. Terminal and galaxy ignore the new argument.

**Tech stack:** Nuxt 4 SPA, Vue 3.5, `@nuxtjs/i18n`, three 0.186, Vitest (happy-dom), Playwright. No new dependency.

---

## Context

User (verbatim): *"I see that have too many projects and split each project in a journey too spam. Help me make it better, can build a sub section for that /hallmark"*. Chosen shape (AskUserQuestion): **One stop + project picker** — logo list on one side, detail on the other, projects grouped by employer, prev/next, rail shows Projects once with small sub-dots, cartoon gets one project yard whose camera pans to the selected billboard.

Today (`feature/dainq/vibes-8-train`):
- `app/pages/about/index.vue` renders `content.projects` as 10 `JourneyStop`s (indices 6–15); contact is stop 16. `stopLabels` lists every project name; `useJourney(stopLabels.length)`.
- `app/data/journeyStations.ts` emits one `kiosk` station per project (17 stations); `app/scenes/cartoon/stations.ts` places them evenly on the loop; `buildings.ts` `kiosk` builder draws one billboard with the logo.
- `app/components/journey/Rail.vue` draws one 2rem dot per stop.
- `Project` type (`app/data/profile.ts`) has no employer; projects 0–4 are FireGroup, 5–9 Tuổi Trẻ.

Decisions (defaults taken):
- Picker is a list of `<button aria-pressed>` (not ARIA tabs: group headings are not allowed inside a `tablist`). Arrow Up/Down (and Left/Right) + Home/End move selection and focus; the detail region is `aria-live="polite"`.
- Projects grouped by a new `Project.group` string (employer name, localized), groups rendered in data order.
- No URL deep-link for a project (not asked; add when wanted).
- Selection defaults to project 0; it persists while scrolling away and back (component state).
- Phones (< 40rem): list becomes a horizontal, scroll-snapped strip of logo chips above the detail; chip labels `nowrap` (gate 49).

## Branch
`feature/dainq/vibes-9-projects`, cut from `feature/dainq/vibes-8-train`. One PR to `main` after Phase 8 merges.

## Global Constraints
- Hallmark: design.md tokens only (no inline colours), no italic headings, hit targets ≥ 44px, focus ring 2px `--color-focus`, opacity/transform-only motion, reduced motion respected, honest copy (no invented numbers), no horizontal page scroll at 320/375/414/768.
- Vietnamese copy: job titles, product names, technical terms stay English; prose natural Vietnamese.
- UI strings in `i18n/locales/{vi,en}.json`; profile copy in `app/data/profile.{vi,en}.ts`.
- Files < 300 lines; stop dev by port (`lsof -ti tcp:3000 | xargs kill`) before `npm run typecheck`; Playwright `--workers=1`; commitlint lowercase subjects; trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus
1. Keyboard: Tab lands on the selected project button only (roving tabindex); arrows move selection and wrap; Home/End jump.
2. Switching project while the stop is centred must not change the stop height enough to scroll the page (detail panel has a stable min-height).
3. Vibe/theme switch while on the Projects stop with project k selected: the rebuilt cartoon scene aims at billboard k on its first frame.
4. Leaving `/about` resets focus to null (home page overview unaffected).
5. Phone width: chip strip scrolls inside itself; page has no horizontal scroll.

---

## Task 1: Data — project groups, 8 stations

**Files:** `app/data/profile.ts`, `app/data/profile.{en,vi}.ts`, `app/data/journeyStations.ts`, `test/profile.spec.ts`, `test/journeyStations.spec.ts`.

- [ ] RED: `test/profile.spec.ts` — add:
```ts
test('projects are grouped by employer the same way in both languages', () => {
  const runs = (c: ProfileContent) => c.projects.map((p) => p.group).map((g, i, all) => (i === 0 || g !== all[i - 1] ? 'new' : 'same'))
  expect(runs(vi)).toEqual(runs(en))
  expect(new Set(en.projects.map((p) => p.group)).size).toBe(2)
  expect(en.projects.every((p) => en.timeline.some((t) => t.org === p.group))).toBe(true) // group names are timeline orgs
})
```
- [ ] RED: `test/journeyStations.spec.ts` — length `2 + timeline.length + 1 + 1`; replace the kiosk test with: `const yard = stations.find((s) => s.kind === 'yard'); expect(yard?.images).toEqual(en.projects.map((p) => p.image))`; yard sits at index `2 + timeline.length`.
- [ ] GREEN: `Project` gains `group: string`. en: `'FireGroup Technology'` ×5, `'Tuoi Tre Newspaper'` ×5; vi: `'FireGroup Technology'` ×5, `'Báo Tuổi Trẻ'` ×5 (match each file's timeline `org`).
- [ ] GREEN: `journeyStations.ts` — `StationKind` replaces `'kiosk'` with `'yard'`; `JourneyStation` becomes `{kind; images?: readonly string[]}`; the projects spread becomes `{kind: 'yard', images: content.projects.map((p) => p.image)}`. Update the doc comment (Hello · What I do · career · Projects · Say hello).
- [ ] `npx vitest run test/profile.spec.ts test/journeyStations.spec.ts` → green. Commit `feat(about): group projects by employer, one project yard station`.

## Task 2: Picker key logic (pure)

**Files:** create `app/components/journey/pickerKeys.ts`, `test/pickerKeys.spec.ts`.

- [ ] RED test:
```ts
import {nextPick} from '~/components/journey/pickerKeys'
test('arrows wrap, Home/End jump, other keys ignored', () => {
  expect(nextPick(0, 'ArrowDown', 10)).toBe(1)
  expect(nextPick(9, 'ArrowDown', 10)).toBe(0)
  expect(nextPick(0, 'ArrowUp', 10)).toBe(9)
  expect(nextPick(3, 'ArrowRight', 10)).toBe(4)
  expect(nextPick(3, 'ArrowLeft', 10)).toBe(2)
  expect(nextPick(5, 'Home', 10)).toBe(0)
  expect(nextPick(5, 'End', 10)).toBe(9)
  expect(nextPick(5, 'a', 10)).toBeNull()
})
```
- [ ] GREEN:
```ts
// Keyboard model for the project picker: arrows step and wrap, Home/End jump.
const STEP: Readonly<Record<string, number>> = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}
export function nextPick(current: number, key: string, count: number): number | null {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  const step = STEP[key]
  return step === undefined ? null : (current + step + count) % count
}
```
- [ ] Commit `feat(about): keyboard model for the project picker`.

## Task 3: Shared focus state + scene argument

**Files:** `app/composables/useJourneyProgress.ts`, `app/scenes/types.ts`, `app/components/VibeScene.vue`, `app/scenes/{terminal,galaxy}.ts` (signature only), `test/scenes.spec.ts` (add 6th `null` to every `update` call).

- [ ] `useJourneyProgress.ts` add:
```ts
// focus: selected project on the /about Projects stop, or null when the picker is not mounted.
export const useJourneyFocus = () => useState<number | null>('journey-focus', () => null)
```
- [ ] `VibeScene.update(dt, elapsed, progress, pointer, stop: number | null, focus: number | null)` with JSDoc `@param focus selected item inside the centred stop (the Projects picker), or null`.
- [ ] `VibeScene.vue`: `const journeyFocus = useJourneyFocus()`; pass `journeyFocus.value`; reduced-motion redraw watch becomes `watch([journey, journeyStop, journeyFocus], …)`.
- [ ] `npx vitest run test/scenes.spec.ts` green (no behaviour change). Commit `refactor(scene): pass the picker focus to scenes`.

## Task 4: `JourneyProjectPicker` component + about page

**Files:** create `app/components/journey/ProjectPicker.vue`; modify `app/pages/about/index.vue`, `app/components/journey/Rail.vue`, `i18n/locales/{vi,en}.json`; update `e2e/about-journey.spec.ts`.

- [ ] RED e2e (`e2e/about-journey.spec.ts`): `STOP_COUNT = 8`, `PROJECTS_STOP = 6`; update the first test (heading of stop 6 is `Projects`; 10 picker buttons); replace project-stop references in "only the centred stop is revealed" with stops 6/7; update the cartoon run-through stops to `[3, 6, 7, 0, 5]`. Add:
```ts
test('the projects picker switches the detail by click and keyboard', async ({page}) => {
  await page.goto('/en/about')
  const stop = page.locator(`#stop-${PROJECTS_STOP}`)
  await stop.scrollIntoViewIfNeeded()
  const buttons = stop.locator('.picker-item')
  await expect(buttons).toHaveCount(10)
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true')
  await expect(stop.locator('.picker-detail h3')).toHaveText(/OneMobile/)
  await buttons.nth(2).click()
  await expect(stop.locator('.picker-detail h3')).toHaveText(/Transcy/)
  await page.keyboard.press('ArrowDown')
  await expect(stop.locator('.picker-detail h3')).toHaveText(/Swift/)
  await expect(buttons.nth(3)).toBeFocused()
  await page.keyboard.press('End')
  await expect(stop.locator('.picker-detail h3')).toHaveText(/Tuoi Tre Internal/)
  await expect(stop.getByRole('heading', {level: 3, name: 'Tuoi Tre Newspaper'}).or(stop.locator('.picker-group', {hasText: 'Tuoi Tre Newspaper'}))).toBeVisible()
})

test('switching projects does not move the page', async ({page}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one layout is enough')
  await page.goto('/en/about')
  const stop = page.locator(`#stop-${PROJECTS_STOP}`)
  await stop.scrollIntoViewIfNeeded()
  const before = await stop.boundingBox()
  for (const i of [5, 9, 1]) await stop.locator('.picker-item').nth(i).click()
  const after = await stop.boundingBox()
  expect(Math.abs(after!.height - before!.height)).toBeLessThan(2)
})
```
Run → FAIL (17 stops).

- [ ] i18n keys (both files): `about.projects` ("Dự án" / "Projects"), `about.projectsIntro` ("Các sản phẩm tôi đã xây dựng backend, theo từng công ty." / "Products I built the backend for, by company."), `about.prevProject` ("Dự án trước" / "Previous project"), `about.nextProject` ("Dự án tiếp" / "Next project"), `about.projectList` ("Danh sách dự án" / "Project list"). Keep `projectCount`, `internal`, `visitLive`.

- [ ] `ProjectPicker.vue` (props `projects: readonly Project[]`; writes `useJourneyFocus()`; resets it to null on unmount):
  - Layout: `.picker` grid `minmax(0, 15rem) minmax(0, 1fr)` at ≥ 48rem; single column below.
  - List: for each group (contiguous runs of `project.group`) a `<p class="picker-group font-mono">` + `<ul role="list">` of `<li><button class="picker-item" :aria-pressed :tabindex="i === selected ? 0 : -1" :aria-controls="detailId" @click="select(i)" @keydown="onKey">` containing the 2rem logo `<img alt="">` and `project.alt` (short name, `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`). Whole `<nav :aria-label="t('about.projectList')">`.
  - `onKey(e)`: `const n = nextPick(selected, e.key, count); if (n === null) return; e.preventDefault(); select(n); nextTick(() => buttons[n].focus())`.
  - Detail: `<div :id="detailId" class="picker-detail" aria-live="polite">` with `<Transition name="pick" mode="out-in">` keyed by index: kicker (`projectCount` + internal tag), logo 6rem, `<h3>` project name, description, role, `Visit live →` link; footer row: ◀ / ▶ icon buttons (`aria-label` prev/next, 44px) and `02 / 10` in mono.
  - `.picker-detail { min-height: 22rem }` (calibrate in Task 6 so the longest project fits; e2e above pins stability).
  - Motion: `.pick-enter-from, .pick-leave-to { opacity: 0; transform: translateY(6px) }`, `--dur-short` `--ease-out`; reduced motion → opacity only, 150ms.
  - States for `.picker-item`: default (muted ink) · hover (ink, `--color-paper-2` bg) · focus-visible (2px `--color-focus`, offset 2px) · active (translateY 1px) · pressed (`aria-pressed=true`: ink text, 3px left accent bar via `box-shadow: inset 3px 0 var(--color-accent)`, `--color-paper-2` bg). disabled/loading/error/success n/a (state comment like VibeSwitch).
  - Phones (< 48rem): each `ul` becomes `display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap`, chips `flex: 0 0 auto; min-height: 2.75rem`; group label inline before its chips; page stays clip (root already `overflow-x: clip`).
  - Stamp: `/* Hallmark · component: picker (list + detail) · genre: per design.md · states: default · hover · focus · active · pressed */`.

- [ ] `about/index.vue`:
  - Replace the project `v-for` stop with one `<JourneyStop :index="projectsIndex" :title="t('about.projects')" :active="activeStop === projectsIndex"><p class="journey-hint-lead">{{ t('about.projectsIntro') }}</p><JourneyProjectPicker :projects="content.projects"/></JourneyStop>`.
  - `projectsIndex = TIMELINE_START + timeline.length`; `contactIndex = projectsIndex + 1`; `stopLabels` uses `t('about.projects')` once; comment "Stop order: Hello · What I do · one per career stage · Projects · Say hello".
  - Move `.project-*` styles into the component; delete them here.
  - Projects stop panel is wider: pass a `wide` prop to `JourneyStop` (`.stop-panel.is-wide { max-width: 72rem }`) — add `wide?: boolean` to `Stop.vue`.

- [ ] `Rail.vue`: optional prop `sub?: {stop: number; count: number; active: number | null}`; under that stop's dot render `<span class="rail-sub" aria-hidden="true">` with `count` 4px dots, the active one `--color-ink`, others `--color-rule`, vertical stack, gap 3px. Page passes `{stop: projectsIndex, count: projects.length, active: focus}`.

- [ ] Run e2e for the file → green. `npm run lint`. Commit `feat(about): one projects stop with a grouped picker`.

## Task 5: Cartoon project yard

**Files:** `app/scenes/cartoon/buildings.ts`, `stations.ts`, `index.ts`, `test/scenes.spec.ts`.

- [ ] RED scene tests (replace 17 with `STATIONS.length` = 8; parking test uses stop 3; reduced-motion stop 5):
```ts
test('the project yard has one billboard per project', () => {
  const built = build()
  for (let k = 0; k < 10; k++) expect(built.scene.getObjectByName(`billboard-${k}`)).toBeTruthy()
})

test('on the projects stop the camera aims at the selected billboard', () => {
  const aimAt = (focus: number) => {
    const built = build(true) // reduced motion: first frame is the final framing
    built.update(0, 0, 0, POINTER, 6, focus)
    const dir = built.camera.getWorldDirection(new THREE.Vector3())
    const toBoard = (k: number) => built.scene.getObjectByName(`billboard-${k}`)!.getWorldPosition(new THREE.Vector3()).sub(built.camera.position).normalize()
    return [0, 9].map((k) => dir.dot(toBoard(k)))
  }
  const [a0, a9] = aimAt(0)
  const [b0, b9] = aimAt(9)
  expect(a0).toBeGreaterThan(a9)
  expect(b9).toBeGreaterThan(b0)
})
```
  The footprint test keeps passing with the yard's larger footprint (fewer stations → ~13 units spacing).

- [ ] `buildings.ts`: rename `kiosk` → private `billboard(kit, image, loadAssets)` (same geometry, logo plane); add `yard` builder: a `platform`-coloured plaza `BoxGeometry(7.5, 0.06, 3.6)` and ten billboards in two rows of five (`x = (col - 2) * 1.45`, row 0 at `z = 0.6`, row 1 at `z = -1.0` raised `y + 0.35`), each named `billboard-${k}`, rotated 0 (front +z faces the track). `BUILDERS` key `kiosk` → `yard`; `Builder` signature receives `station.images`.
- [ ] `stations.ts`: `StationAnchor` gains `targets: THREE.Vector3[]` — world positions of `billboard-*` children (empty for other kinds), computed after the building is placed (`building.updateMatrixWorld(true)`).
- [ ] `index.ts`: `update(…, stop, focus)`; in `chase`, `const target = focus !== null && anchor.targets[focus] ? anchor.targets[focus] : anchor.building`; lerp the look toward `target` (same 0.7·nearness); when focus targets a billboard, also shorten `CHASE.distance` by `CHASE.yardZoom` (new knob, 3) so a single board reads. The camera snaps on first frame as today, so Review Focus 3 holds.
- [ ] `npx vitest run test/scenes.spec.ts` → green. Commit `feat(scene): one cartoon project yard; camera follows the picked project`.

## Task 6: Calibrate, docs, gate

- [ ] Dev server; screenshots (cartoon light/dark 1280, terminal 1280, galaxy 1280, cartoon 375): `/about` stop 6 with project 0, 4, 9 selected; stops 5 and 7 (neighbours); `/`. Check: panel + picker fit 800px height at 1280 (list of 10 + 2 group labels); yard billboards readable; selected billboard framed right of the panel; phone chips scroll, no page h-scroll. Tune `.picker-detail` min-height, `CHASE.yardZoom`, yard spacing; record each change as a ruling.
- [ ] Check widths 320/375/414/768 for horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] `design.md`: Motion bullet — "Projects: one stop with a picker; switching cross-fades the detail (opacity + 6px), cartoon camera eases to the picked billboard." Update the stop list wherever it says 17 stops / one stop per project (grep `17`, `per project`).
- [ ] Docs mirror: `docs/superpowers/plans/2026-10-02-projects-picker.md` (this plan).
- [ ] Gate:
```bash
npx vitest run --coverage && npm run lint
lsof -ti tcp:3000 | xargs kill; npm run typecheck
(npm run dev > /tmp/dev.log 2>&1 &); sleep 30; npx playwright test --workers=1 --reporter=line
```
  Expected: all green, branch coverage ≥ 80 %. Commit `docs: projects picker`; push `feature/dainq/vibes-9-projects`.

## Verification
1. Unit: profile groups, journeyStations (8, yard images), `nextPick`, cartoon yard billboards + focus aim, footprint clearance.
2. E2E: 8 stops; picker click/keyboard/focus; stable stop height; cartoon run-through no errors; existing contrast + i18n specs (stop 5 still FireGroup career).
3. Visual: screenshots from Task 6 in all three vibes, light/dark, desktop and phone.
4. Real browser (BrowserOS): keyboard-only pass through the picker; 60 fps on the projects stop in cartoon.
