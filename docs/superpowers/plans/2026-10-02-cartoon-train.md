# Cartoon diorama + journey train — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the cartoon vibe a detailed train-diorama island (track, train with smoke, stations, windmill, pond, forest, flowers, balloon, clouds), and on `/about` drive the train to a station for each journey stop, the way train-diorama.vercel.app follows its train.

**Architecture:** The cartoon scene grows from one 140-line file into a small module folder (`app/scenes/cartoon/`). A closed Catmull-Rom track loops over a bigger floating island; one station per `/about` stop sits beside it, in stop order, with a building that matches the section (home, workshop, school, offices, newspaper, tower, one billboard per project showing its logo, post office). The centred stop index reaches the scene through a second shared state next to the existing progress (`useJourneyStop()`), so `/` (no stop: the train loops) and `/about` (a stop: the train runs there and parks) are distinguishable. Train motion is a pure, unit-tested function (braking curve, shortest way round the loop, no overshoot, reduced-motion snap).

**Tech Stack:** three 0.186 (already installed; no new dependency), Nuxt 4 SPA, Vitest + happy-dom, Playwright.

**Spec:** this file, § Context.

---

## Context

### What the user asked (verbatim)

> [screenshot of the cartoon home scene] Can you make it more detail?
> And in about page, can make a train run to each place has info (like https://train-diorama.vercel.app/)
> Can use train for theme cartoon.
> /hallmark

### What exists today (read before changing)

- `app/scenes/cartoon.ts` (140 lines): one octagonal island, 5 cone trees, one house, 4 clouds; the island bobs and spins; the camera orbits by `progress`.
- `app/scenes/types.ts`: `VibeScene.update(dt, elapsed, progress, pointer)`. `progress` is `activeStop / (stops − 1)`, smoothed in `app/components/VibeScene.vue` (`approach(progress, journey.value, dt, 3)`). It is `0` on `/` **and** on about-stop 0, so a scene cannot tell the two apart.
- `app/composables/useJourney.ts` sets `useJourneyProgress()` from an IntersectionObserver centre band; resets to 0 on unmount.
- `/about` has 17 stops: Hello · What I do · 4 career stages · 10 projects · Say hello (`app/pages/about/index.vue`, derived from `useProfile()`; section lengths are equal in vi/en, pinned by `test/profile.spec.ts`).
- `VibeScene.vue` disposes every geometry/material/texture reachable from the scene on rebuild (textures found via `Object.values(material)`, so `map`/`gradientMap` are freed).
- Research teardown of train-diorama (`docs/research/2026-10-01-threejs-profile-redesign.md` § B): vanilla three, floating square island with cliffs, forest, lake, bridge, windmill, hot-air balloon, flat-shaded clouds, looping train with smoke; camera presets including "train follow"; palette `#fbf4e2 #3f2a1f #5a3b2a #ca4e36 #3f7d5a #5aa843 #cfe6f4`.

### Decisions (defaults taken; say if you want otherwise)

- **Train only in the cartoon vibe.** Terminal and galaxy keep their current camera paths (they ignore the new stop argument).
- **On `/` the train loops** around the island at cruising speed; the camera holds an overview with the island to the right of the hero text.
- **On `/about` the train runs to the centred stop's station** along the shorter way round the loop, brakes, and parks; a chase camera follows it and frames the station building on the right half of the screen (the text panel is on the left).
- **Projects** get one billboard station each showing the project logo (`/images/projects/*.webp`), matching the one-stop-per-project journey.
- `prefers-reduced-motion`: the train and camera jump straight to the station; nothing animates (existing single-frame mode).
- Phones (`pointer: coarse`): fewer trees/flowers/rocks (`detail: 'low'`).

### Hallmark discipline (design.md is the locked system)

- Cartoon palette stays the design.md cartoon register; three.js hexes mirror it and train-diorama's warm diorama hues (terracotta train `#ca4e36`, two greens, cream sky). No new UI chrome; the only DOM change is none (the scene is behind the existing panels).
- Honest copy: station signs show only the stop number; no invented text.
- Canvas stays `aria-hidden`; reduced motion respected; animate only inside WebGL.

### What this plan deliberately does NOT change

- Terminal and galaxy scenes (only their `update` signature gains an unused parameter).
- The about page markup, copy, rail and observer behaviour.
- The renderer, disposal, pause and WebGL-missing logic in `VibeScene.vue` (only the options and the extra argument are added).

---

## Phase 8 — branch `feature/dainq/vibes-8-train`

Cut from `feature/dainq/vibes-7-blog-i18n`. One PR to `main` after Phase 7 merges.

| Task | Ships | Done when |
| --- | --- | --- |
| 24 | `journeyStations()` — one station descriptor per about stop | unit test green |
| 25 | `stepTrain()` — pure train motion | unit tests green |
| 26 | Stop index plumbing (`useJourneyStop`, scene options, update argument) | unit + e2e green, other vibes unchanged |
| 27 | Cartoon diorama modules (kit, track, buildings, stations, train, world, scene) | scene tests green, screenshots reviewed |
| 28 | Calibration, e2e, docs, gate | full suites green, PR-ready |

## Global Constraints

- No new dependencies. three 0.186 APIs only (`CatmullRomCurve3`, `TubeGeometry`, `ExtrudeGeometry`, `InstancedMesh`, `CanvasTexture`, `TextureLoader`, `MeshToonMaterial`).
- Every file under 300 lines; functions under ~50 lines where practical.
- Animate only transforms/opacity inside the scene; no DOM animation added.
- Stop the dev server before `npm run typecheck` with `lsof -ti tcp:3000 | xargs kill` (a bare `pkill -f "nuxt dev"` leaves the worker running and the content dump gets emptied).
- Playwright `--workers=1`.
- Commits: conventional, lowercase subject after the type, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Jumping from stop 0 to stop 16** (rail click): the train must take the short way across the loop seam, not run the whole island. Pinned by motion test "takes the short way across the loop seam".
2. **Reversing:** scrolling back up while the train is moving forward must brake, reverse and still park exactly at the station with no overshoot. Pinned by "reverses smoothly…" and the no-overshoot assertion.
3. **Switching vibe while on `/about` stop k:** the rebuilt cartoon scene must end with the train at station k (camera snaps on first frame). Pinned by scene test "runs to the centred stop and parks at its station".
4. **Reduced motion:** first frame already shows the train parked at the station. Pinned by scene test "is at the station on the first frame".
5. **Memory:** logo and sign textures are freed on every vibe switch. Verified by the existing heap check (20 switches) in Task 28.

---

## File structure

| Path | Status | Responsibility |
| --- | --- | --- |
| `app/data/journeyStations.ts` + `test/journeyStations.spec.ts` | create | stop → station kind/image mapping |
| `app/scenes/cartoon/motion.ts` + `test/trainMotion.spec.ts` | create | pure train motion along `u ∈ [0, 1)` |
| `app/scenes/types.ts` | modify | `SceneOptions.reduceMotion/detail/loadAssets`, `update(…, stop)` |
| `app/composables/useJourneyProgress.ts` | modify | add `useJourneyStop()` |
| `app/composables/useJourney.ts` | modify | write the stop index; reset to `null` |
| `app/components/VibeScene.vue` | modify | pass options + stop; redraw on stop change in reduced motion |
| `app/scenes/cartoon.ts` | **delete** | replaced by the folder below (same import path `~/scenes/cartoon`) |
| `app/scenes/cartoon/kit.ts` | create | palette, cached toon materials, faceted meshes, seeded RNG |
| `app/scenes/cartoon/track.ts` | create | loop curve, rails, sleepers, ballast |
| `app/scenes/cartoon/buildings.ts` | create | one builder per station kind |
| `app/scenes/cartoon/stations.ts` | create | platforms, lamps, number signs, buildings beside the track |
| `app/scenes/cartoon/train.ts` | create | locomotive + 2 wagons, wheels, smoke, headlight |
| `app/scenes/cartoon/world.ts` | create | island, forest, flowers, rocks, pond, windmill, clouds, balloon |
| `app/scenes/cartoon/index.ts` | create | scene factory: lights, composition, motion, cameras |
| `test/scenes.spec.ts` | modify | new options/argument; cartoon train tests |
| `e2e/about-journey.spec.ts` | modify | cartoon run-through has no errors |
| `design.md` | modify | Motion: cartoon train |

---

### Task 24: One station per journey stop

**Files:** create `app/data/journeyStations.ts`, `test/journeyStations.spec.ts`.

**Interfaces:** Produces `type StationKind = 'home' | 'workshop' | 'school' | 'office' | 'press' | 'tower' | 'kiosk' | 'post'`, `interface JourneyStation {kind: StationKind; image?: string}`, `journeyStations(content: ProfileContent): JourneyStation[]`.

- [ ] **Step 1: Branch and failing test**

```bash
cd /private/var/www/html/personal/qdjr
git checkout feature/dainq/vibes-7-blog-i18n && git checkout -b feature/dainq/vibes-8-train
```

```ts
// test/journeyStations.spec.ts
import {describe, expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'

const {vi, en} = PROFILE_CONTENT

describe('journeyStations', () => {
  test('one station per /about stop, in stop order', () => {
    const stations = journeyStations(en)
    expect(stations).toHaveLength(2 + en.timeline.length + en.projects.length + 1)
    expect(stations[0].kind).toBe('home')
    expect(stations[1].kind).toBe('workshop')
    expect(stations.at(-1)?.kind).toBe('post')
  })

  test('career stages: school for education, a tower for the current job', () => {
    const kinds = journeyStations(en).slice(2, 2 + en.timeline.length).map((s) => s.kind)
    expect(kinds).toEqual(['school', 'office', 'press', 'tower'])
  })

  test('every project is a billboard showing its logo', () => {
    const kiosks = journeyStations(en).filter((s) => s.kind === 'kiosk')
    expect(kiosks.map((k) => k.image)).toEqual(en.projects.map((p) => p.image))
  })

  test('both languages produce the same stations', () => {
    expect(journeyStations(vi)).toEqual(journeyStations(en))
  })
})
```
Run `npx vitest run test/journeyStations.spec.ts` → FAIL (module missing).

- [ ] **Step 2: `app/data/journeyStations.ts`**

```ts
import type {ProfileContent, TimelineEntry} from './profile'

export type StationKind = 'home' | 'workshop' | 'school' | 'office' | 'press' | 'tower' | 'kiosk' | 'post'

export interface JourneyStation {
  kind: StationKind
  /** Project logo shown on a billboard station. */
  image?: string
}

/**
 * One station per /about stop, in stop order: Hello · What I do · one per
 * career stage · one per project · Say hello. The about page and the cartoon
 * scene both follow this order, so the train always has a station for the
 * centred stop.
 */
export function journeyStations(content: ProfileContent): JourneyStation[] {
  const jobs = content.timeline.filter((entry) => entry.kind === 'work')
  const careerKind = (entry: TimelineEntry): StationKind => {
    if (entry.kind === 'education') return 'school'
    const index = jobs.indexOf(entry)
    if (index === jobs.length - 1) return 'tower'
    return index % 2 === 0 ? 'office' : 'press'
  }

  return [
    {kind: 'home'},
    {kind: 'workshop'},
    ...content.timeline.map((entry) => ({kind: careerKind(entry)})),
    ...content.projects.map((project) => ({kind: 'kiosk' as const, image: project.image})),
    {kind: 'post'}
  ]
}
```
Run → `4 passed`. Commit `feat(scene): one journey station per about stop`.

### Task 25: Train motion (pure)

**Files:** create `app/scenes/cartoon/motion.ts`, `test/trainMotion.spec.ts`.

**Interfaces:** Produces `interface TrainMotion {u: number; velocity: number}` (velocity in u/s), `interface MotionConfig {length: number; cruise: number; maxSpeed: number; accel: number}` (world units), `DEFAULT_MOTION`, `wrapU(u)`, `signedLoopDistance(from, to)`, `stepTrain(state, target, dt, config, reduceMotion?)`.

- [ ] **Step 1: Failing test `test/trainMotion.spec.ts`**

```ts
import {describe, expect, test} from 'vitest'
import {DEFAULT_MOTION, signedLoopDistance, stepTrain, wrapU, type TrainMotion} from '~/scenes/cartoon/motion'

const CONFIG = {length: 120, ...DEFAULT_MOTION}
const DT = 1 / 60

function run(start: TrainMotion, target: number | null, seconds: number) {
  const trace: TrainMotion[] = []
  let state = start
  for (let i = 0; i < seconds * 60; i++) {
    state = stepTrain(state, target, DT, CONFIG)
    trace.push(state)
  }
  return {state, trace}
}

describe('loop geometry', () => {
  test('wrapU keeps u in [0, 1)', () => {
    expect(wrapU(1.25)).toBeCloseTo(0.25)
    expect(wrapU(-0.25)).toBeCloseTo(0.75)
  })

  test('signedLoopDistance takes the short way round', () => {
    expect(signedLoopDistance(0.1, 0.3)).toBeCloseTo(0.2)
    expect(signedLoopDistance(0.03, 0.97)).toBeCloseTo(-0.06)
  })
})

describe('stepTrain', () => {
  test('loops forward on the home page and stays in [0, 1)', () => {
    const {state, trace} = run({u: 0.9, velocity: 0}, null, 30)
    expect(trace.every((s) => s.u >= 0 && s.u < 1)).toBe(true)
    expect(state.velocity).toBeCloseTo(CONFIG.cruise / CONFIG.length)
  })

  test('reaches a station ahead and parks without overshooting', () => {
    const target = 0.3
    const {state, trace} = run({u: 0.03, velocity: 0}, target, 20)
    expect(trace.every((s) => signedLoopDistance(s.u, target) >= 0)).toBe(true)
    expect(state.u).toBe(target)
    expect(state.velocity).toBe(0)
  })

  test('gets there in a few seconds, not a crawl', () => {
    const {trace} = run({u: 0.03, velocity: 0}, 0.3, 20)
    const arrived = trace.findIndex((s) => s.u === 0.3 && s.velocity === 0)
    expect(arrived).toBeGreaterThan(0)
    expect(arrived / 60).toBeLessThan(9)
  })

  test('takes the short way across the loop seam', () => {
    const {state, trace} = run({u: 0.03, velocity: 0}, 0.97, 10)
    expect(trace[30].u).toBeGreaterThan(0.9) // went backwards past 0
    expect(state.u).toBe(0.97)
  })

  test('reverses smoothly when the station is behind a moving train', () => {
    const {state, trace} = run({u: 0.5, velocity: 6 / CONFIG.length}, 0.45, 20)
    const velocities = trace.map((s) => s.velocity)
    expect(Math.min(...velocities)).toBeLessThan(0)
    expect(state.u).toBe(0.45)
    expect(state.velocity).toBe(0)
  })

  test('reduced motion jumps straight to the station; at home it stays put', () => {
    expect(stepTrain({u: 0.1, velocity: 0}, 0.6, DT, CONFIG, true)).toEqual({u: 0.6, velocity: 0})
    expect(stepTrain({u: 0.1, velocity: 0}, null, DT, CONFIG, true)).toEqual({u: 0.1, velocity: 0})
  })

  test('a zero-length frame changes nothing', () => {
    expect(stepTrain({u: 0.2, velocity: 0}, 0.4, 0, CONFIG)).toEqual({u: 0.2, velocity: 0})
  })
})
```
Run → FAIL (module missing).

- [ ] **Step 2: `app/scenes/cartoon/motion.ts`**

```ts
// Train motion along the closed track, in normalised arc length u ∈ [0, 1).
// Pure: no three.js, no clock. Speeds and accelerations are in world units so
// they read the same whatever the track length; velocity is stored in u/s.

export interface TrainMotion {
  u: number
  velocity: number
}

export interface MotionConfig {
  length: number // world units around the loop
  cruise: number // home-page looping speed, units/s
  maxSpeed: number // top speed between stations, units/s
  accel: number // acceleration and braking, units/s²
}

export const DEFAULT_MOTION = {cruise: 2.2, maxSpeed: 9, accel: 5} as const

const ARRIVE_DISTANCE = 0.03 // units
const ARRIVE_SPEED = 0.2 // units/s

export const wrapU = (u: number) => ((u % 1) + 1) % 1

/** Shortest signed distance in u from `from` to `to` around the loop, in (−0.5, 0.5]. */
export function signedLoopDistance(from: number, to: number): number {
  const d = wrapU(to - from)
  return d > 0.5 ? d - 1 : d
}

function approachSpeed(current: number, desired: number, maxDelta: number): number {
  const delta = desired - current
  return Math.abs(delta) <= maxDelta ? desired : current + Math.sign(delta) * maxDelta
}

/**
 * One frame of motion. `target` is the station's u on /about, or null on the
 * home page (loop forward at cruising speed).
 */
export function stepTrain(
  state: TrainMotion,
  target: number | null,
  dt: number,
  config: MotionConfig,
  reduceMotion = false
): TrainMotion {
  const {length, cruise, maxSpeed, accel} = config
  if (target === null) {
    if (reduceMotion || dt === 0) return state
    const velocity = approachSpeed(state.velocity, cruise / length, (accel / length) * dt)
    return {u: wrapU(state.u + velocity * dt), velocity}
  }
  if (reduceMotion) return {u: wrapU(target), velocity: 0}
  if (dt === 0) return state

  const d = signedLoopDistance(state.u, target)
  if (Math.abs(d * length) < ARRIVE_DISTANCE && Math.abs(state.velocity * length) < ARRIVE_SPEED) {
    return {u: wrapU(target), velocity: 0}
  }

  // Braking curve: the fastest speed from which the train can still stop at the station.
  const braking = Math.sqrt(2 * accel * Math.abs(d * length))
  const desired = (Math.sign(d) * Math.min(maxSpeed, braking)) / length
  const velocity = approachSpeed(state.velocity, desired, (accel / length) * dt)
  const u = state.u + velocity * dt

  // Never run past the station in a single frame.
  const after = signedLoopDistance(wrapU(u), target)
  if (after !== 0 && Math.sign(after) !== Math.sign(d)) return {u: wrapU(target), velocity: 0}
  return {u: wrapU(u), velocity}
}
```
Run → `9 passed`. If "reverses smoothly" fails on the overshoot guard (the train still moving forward when `d < 0` makes `after` and `d` share a sign, which is correct), fix the implementation, not the test. Commit `feat(scene): pure train motion with braking and shortest-way routing`.

### Task 26: Let scenes know the centred stop

**Files:** modify `app/scenes/types.ts`, `app/composables/useJourneyProgress.ts`, `app/composables/useJourney.ts`, `app/components/VibeScene.vue`, `test/scenes.spec.ts`.

**Interfaces:** `SceneOptions` gains `reduceMotion?: boolean`, `detail?: 'high' | 'low'`, `loadAssets?: boolean`; `VibeScene.update(dt, elapsed, progress, pointer, stop: number | null)`; `useJourneyStop(): Ref<number | null>`.

- [ ] **Step 1: `app/scenes/types.ts`** — FIND
```ts
export interface SceneOptions {
  isDark: boolean
  aspect: number
}
```
REPLACE
```ts
export interface SceneOptions {
  isDark: boolean
  aspect: number
  /** Jump to end states instead of animating (prefers-reduced-motion). */
  reduceMotion?: boolean
  /** 'low' on coarse-pointer devices: fewer decorative instances. */
  detail?: 'high' | 'low'
  /** Load images and draw canvas textures; false in unit tests (no network, no 2D canvas). */
  loadAssets?: boolean
}
```
FIND `   * @param pointer smoothed pointer, −1..1\n   */\n  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer): void`
REPLACE
```ts
   * @param pointer smoothed pointer, −1..1
   * @param stop index of the centred /about stop, or null when no journey page is mounted
   */
  update(dt: number, elapsed: number, progress: number, pointer: ScenePointer, stop: number | null): void
```

- [ ] **Step 2: `app/composables/useJourneyProgress.ts` — full file**

```ts
// The channels between the /about page and the layout-level VibeScene.
// progress: 0 on /, i / (stops − 1) while a journey stop is centred on /about.
export const useJourneyProgress = () => useState<number>('journey-progress', () => 0)

// stop: index of the centred /about stop, or null when no journey page is
// mounted (lets a scene tell the home page from the first journey stop).
export const useJourneyStop = () => useState<number | null>('journey-stop', () => null)
```

- [ ] **Step 3: `app/composables/useJourney.ts`** — FIND `  const progress = useJourneyProgress()` REPLACE `  const progress = useJourneyProgress()\n  const stop = useJourneyStop()`. FIND `          activeStop.value = index\n` REPLACE `          activeStop.value = index\n          stop.value = index\n`. FIND `    progress.value = 0 // back on /, the scene returns to waypoint 0` REPLACE `    progress.value = 0 // back on /, the scene returns to waypoint 0\n    stop.value = null`.

- [ ] **Step 4: `app/components/VibeScene.vue`**
  - FIND `const journey = useJourneyProgress()` REPLACE `const journey = useJourneyProgress()\nconst journeyStop = useJourneyStop()`.
  - FIND `let reduceMotion = false` REPLACE `let reduceMotion = false\nlet detail: 'high' | 'low' = 'high'`.
  - FIND `  active.update(dt, elapsed, progress, pointer)` REPLACE `  active.update(dt, elapsed, progress, pointer, journeyStop.value)`.
  - FIND `  active = FACTORIES[store.vibe]({isDark: store.isDarkMode, aspect: aspectOf(canvas.value)})` REPLACE `  active = FACTORIES[store.vibe]({isDark: store.isDarkMode, aspect: aspectOf(canvas.value), reduceMotion, detail})`.
  - FIND `  const coarsePointer = window.matchMedia('(pointer: coarse)').matches` REPLACE `  const coarsePointer = window.matchMedia('(pointer: coarse)').matches\n  detail = coarsePointer ? 'low' : 'high'`.
  - FIND
```ts
watch(journey, (value) => {
  if (!reduceMotion) return
  progress = value
  renderFrame(0)
})
```
REPLACE
```ts
watch([journey, journeyStop], ([value]) => {
  if (!reduceMotion) return
  progress = value
  renderFrame(0)
})
```

- [ ] **Step 5: `test/scenes.spec.ts`** — every `factory({…})` call gains `loadAssets: false`; every `built.update(…)` call gains a final `null` argument. Run `npx vitest run test/scenes.spec.ts` → green (no behaviour change yet). `npm run lint`, then (dev stopped) `npm run typecheck`. Commit `refactor(scene): pass the centred journey stop and motion options to scenes`.

### Task 27: Cartoon diorama modules

**Files:** delete `app/scenes/cartoon.ts`; create `app/scenes/cartoon/{kit,track,buildings,stations,train,world,index}.ts`; extend `test/scenes.spec.ts`.

**Interfaces:** `createCartoonScene: SceneFactory` (same import path `~/scenes/cartoon`). Object names used by tests: `train-loco`, `platform-<i>`, `station-<i>`.

- [ ] **Step 1: Failing scene tests — append to `test/scenes.spec.ts`**

```ts
describe('cartoon train', () => {
  const build = (reduceMotion = false) => createCartoonScene({isDark: false, aspect: 16 / 9, loadAssets: false, reduceMotion})
  const distanceToPlatform = (built: ReturnType<typeof build>, stop: number) => {
    const loco = built.scene.getObjectByName('train-loco')!
    const platform = built.scene.getObjectByName(`platform-${stop}`)!
    return loco.getWorldPosition(new THREE.Vector3()).distanceTo(platform.getWorldPosition(new THREE.Vector3()))
  }

  test('builds one platform and one station building per journey stop', () => {
    const built = build()
    for (let i = 0; i < 17; i++) {
      expect(built.scene.getObjectByName(`platform-${i}`)).toBeTruthy()
      expect(built.scene.getObjectByName(`station-${i}`)).toBeTruthy()
    }
  })

  test('runs to the centred stop and parks at its station', () => {
    const built = build()
    for (let i = 0; i < 60 * 20; i++) built.update(1 / 60, i / 60, 0, POINTER, 5)
    expect(distanceToPlatform(built, 5)).toBeLessThan(1.6)
  })

  test('with reduced motion it is at the station on the first frame', () => {
    const built = build(true)
    built.update(0, 0, 0, POINTER, 12)
    expect(distanceToPlatform(built, 12)).toBeLessThan(1.6)
  })

  test('keeps moving round the loop on the home page', () => {
    const built = build()
    built.update(1 / 60, 0, 0, POINTER, null)
    const loco = built.scene.getObjectByName('train-loco')!
    const start = loco.position.clone()
    for (let i = 0; i < 180; i++) built.update(1 / 60, i / 60, 0, POINTER, null)
    expect(loco.position.distanceTo(start)).toBeGreaterThan(1)
  })
})
```
Add `import * as THREE from 'three'` at the top of the file. Also change the generic "moves the camera between journey start and end" test so it drives both channels: run 600 frames with `(progress 0, stop 0)`, record the camera, then 600 frames with `(progress 1, stop 16)`, and assert the distance is > 1 (terminal/galaxy respond to progress, cartoon to stop). Run → FAIL (no `train-loco`).

- [ ] **Step 2: `git rm app/scenes/cartoon.ts` and create `app/scenes/cartoon/kit.ts`**

```ts
import * as THREE from 'three'

// Hex because THREE.Color cannot parse oklch(). The warm diorama register:
// cream sky, terracotta, two greens (design.md cartoon + train-diorama).
export interface Colors {
  sky: number
  ground: number
  cliff: number
  grass: number
  leaf: number
  leafDark: number
  trunk: number
  wall: number
  roof: number
  accent: number
  rail: number
  sleeper: number
  ballast: number
  platform: number
  water: number
  cloud: number
  stone: number
  window: number
  glow: number
  train: number
  trainDark: number
  metal: number
  flowers: readonly number[]
}

export const PALETTE: Readonly<Record<'light' | 'dark', Colors>> = {
  light: {
    sky: 0xf6ecd8, ground: 0x8d5e43, cliff: 0x6f4a35, grass: 0x9bc77a, leaf: 0x5d9c57, leafDark: 0x3f7d5a,
    trunk: 0x6b4631, wall: 0xfff6e1, roof: 0xd9704a, accent: 0xca4e36, rail: 0x5a5f66, sleeper: 0x7a5236,
    ballast: 0xc9bca4, platform: 0xd9c9a8, water: 0x6fb3d9, cloud: 0xffffff, stone: 0xb9b2a5, window: 0x3d4a5c,
    glow: 0xffc36b, train: 0xca4e36, trainDark: 0x3f2a1f, metal: 0x4a4f57,
    flowers: [0xef704c, 0xf2c14e, 0xffffff, 0xc8453a, 0x9b7fd6]
  },
  dark: {
    sky: 0x2b2320, ground: 0x5e3f2d, cliff: 0x4a3224, grass: 0x6f9a57, leaf: 0x4f8a4b, leafDark: 0x356a4b,
    trunk: 0x5a3b2a, wall: 0xe9d9b8, roof: 0xb9583a, accent: 0xca4e36, rail: 0x6c7178, sleeper: 0x5e3f2a,
    ballast: 0x8f8470, platform: 0xa8977a, water: 0x2f5d7a, cloud: 0xb9aea3, stone: 0x8c857a, window: 0xffb15c,
    glow: 0xffc36b, train: 0xb9472f, trainDark: 0x2b1c14, metal: 0x3a3e45,
    flowers: [0xc9604a, 0xc9a24a, 0xd9cfc4, 0xa83a30, 0x7d68ad]
  }
}

const SEED = 20261002

/** Small deterministic PRNG so the island looks the same on every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Three-band toon ramp shared by every material in the scene. */
function toonRamp(): THREE.DataTexture {
  const texture = new THREE.DataTexture(new Uint8Array([90, 160, 230, 255]), 4, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

/** Faceted (low-poly) normals: un-index the geometry so each face shades flat. */
export function faceted(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  if (!geometry.index) {
    geometry.computeVertexNormals()
    return geometry
  }
  const flat = geometry.toNonIndexed()
  flat.computeVertexNormals()
  geometry.dispose()
  return flat
}

export interface Kit {
  colors: Colors
  isDark: boolean
  material(color: number, side?: THREE.Side): THREE.MeshToonMaterial
  windowMaterial(): THREE.MeshToonMaterial
  glowMaterial(): THREE.MeshToonMaterial
  mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh
  random(): number
}

export function createKit(isDark: boolean): Kit {
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const gradientMap = toonRamp()
  const cache = new Map<string, THREE.MeshToonMaterial>()
  const cached = (key: string, make: () => THREE.MeshToonMaterial) => {
    const hit = cache.get(key)
    if (hit) return hit
    const made = make()
    cache.set(key, made)
    return made
  }
  // Night: windows and lamps glow; day: they are plain surfaces.
  const lit = (color: number, intensity: number) =>
    new THREE.MeshToonMaterial({color, gradientMap, emissive: isDark ? colors.glow : 0x000000, emissiveIntensity: isDark ? intensity : 0})

  return {
    colors,
    isDark,
    material: (color, side = THREE.FrontSide) => cached(`${color}:${side}`, () => new THREE.MeshToonMaterial({color, gradientMap, side})),
    windowMaterial: () => cached('window', () => lit(colors.window, 1.1)),
    glowMaterial: () => cached('glow', () => lit(colors.glow, 2)),
    mesh: (geometry, material) => new THREE.Mesh(faceted(geometry), material),
    random: mulberry32(SEED)
  }
}
```

- [ ] **Step 3: `app/scenes/cartoon/track.ts`**

```ts
import * as THREE from 'three'
import type {Kit} from './kit'

// A winding closed loop over the island (island spans x −20..20, z −16..16).
// Calibration knob: move these points if a station building lands on a curve.
const CONTROL: ReadonlyArray<readonly [number, number]> = [
  [-15, 9], [-7, 12], [3, 10], [13, 11.5], [16.5, 3], [11, -2.5], [15, -10], [6, -12.5],
  [-2, -8], [-9, -12.5], [-16.5, -7], [-13, 1]
]

export const RAIL_HEIGHT = 0.12
const GAUGE = 0.36
const RAIL_RADIUS = 0.045
const SLEEPER_SPACING = 0.55
const BALLAST_HALF_WIDTH = 0.75
const SAMPLES = 600

export interface Track {
  curve: THREE.CatmullRomCurve3
  length: number
  /** Evenly spaced points along the loop, for keeping props off the line. */
  samples: THREE.Vector3[]
  group: THREE.Group
}

export function trackCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(CONTROL.map(([x, z]) => new THREE.Vector3(x, RAIL_HEIGHT, z)), true, 'catmullrom', 0.5)
}

/** Unit vector in the ground plane, perpendicular to the track at u. */
export function sideAt(curve: THREE.Curve<THREE.Vector3>, u: number, target = new THREE.Vector3()): THREE.Vector3 {
  const t = curve.getTangentAt(u)
  return target.set(-t.z, 0, t.x).normalize()
}

function rail(curve: THREE.CatmullRomCurve3, offset: number, material: THREE.Material): THREE.Mesh {
  const side = new THREE.Vector3()
  const points = Array.from({length: SAMPLES}, (_, i) => {
    const u = i / SAMPLES
    return curve.getPointAt(u).addScaledVector(sideAt(curve, u, side), offset).setY(RAIL_HEIGHT + 0.06)
  })
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true), SAMPLES, RAIL_RADIUS, 4, true), material)
}

function sleepers(kit: Kit, curve: THREE.CatmullRomCurve3, length: number): THREE.InstancedMesh {
  const count = Math.floor(length / SLEEPER_SPACING)
  // Long axis on x; rotating local +z onto the tangent lays each sleeper across the track.
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.05, 0.07, 0.22), kit.material(kit.colors.sleeper), count)
  const matrix = new THREE.Matrix4()
  const rotation = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const scale = new THREE.Vector3(1, 1, 1)
  for (let i = 0; i < count; i++) {
    const u = i / count
    const t = curve.getTangentAt(u)
    rotation.setFromAxisAngle(up, Math.atan2(t.x, t.z))
    matrix.compose(curve.getPointAt(u).setY(RAIL_HEIGHT), rotation, scale)
    mesh.setMatrixAt(i, matrix)
  }
  return mesh
}

/** A flat gravel strip under the sleepers. */
function ballast(kit: Kit, curve: THREE.CatmullRomCurve3): THREE.Mesh {
  const positions: number[] = []
  const indices: number[] = []
  const side = new THREE.Vector3()
  for (let i = 0; i <= SAMPLES; i++) {
    const u = (i % SAMPLES) / SAMPLES
    const p = curve.getPointAt(u)
    sideAt(curve, u, side)
    positions.push(p.x + side.x * BALLAST_HALF_WIDTH, 0.03, p.z + side.z * BALLAST_HALF_WIDTH)
    positions.push(p.x - side.x * BALLAST_HALF_WIDTH, 0.03, p.z - side.z * BALLAST_HALF_WIDTH)
  }
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, kit.material(kit.colors.ballast, THREE.DoubleSide))
}

export function buildTrack(kit: Kit): Track {
  const curve = trackCurve()
  const length = curve.getLength()
  const group = new THREE.Group()
  group.name = 'track'
  const railMaterial = kit.material(kit.colors.rail)
  group.add(ballast(kit, curve), sleepers(kit, curve, length), rail(curve, -GAUGE, railMaterial), rail(curve, GAUGE, railMaterial))
  return {curve, length, samples: curve.getSpacedPoints(SAMPLES), group}
}
```

- [ ] **Step 4: `app/scenes/cartoon/buildings.ts`**

```ts
import * as THREE from 'three'
import type {JourneyStation, StationKind} from '~/data/journeyStations'
import type {Kit} from './kit'

// Every builder returns a group whose origin is the ground centre of the
// building and whose front faces +z (stations.ts turns it to face the track).

type Builder = (kit: Kit, station: JourneyStation, loadAssets: boolean) => THREE.Group

function box(kit: Kit, size: [number, number, number], material: THREE.Material, at: [number, number, number]): THREE.Mesh {
  const mesh = kit.mesh(new THREE.BoxGeometry(...size), material)
  mesh.position.set(...at)
  return mesh
}

function post(kit: Kit, height: number, color: number, at: [number, number]): THREE.Mesh {
  const mesh = kit.mesh(new THREE.CylinderGeometry(0.05, 0.05, height, 6), kit.material(color))
  mesh.position.set(at[0], height / 2, at[1])
  return mesh
}

/** Four-sided pyramid roof sized to a w × d footprint, sitting at height y. */
function hipRoof(kit: Kit, w: number, d: number, h: number, color: number, y: number): THREE.Group {
  const cone = kit.mesh(new THREE.ConeGeometry(1, 1, 4), kit.material(color))
  cone.rotation.y = Math.PI / 4
  const roof = new THREE.Group()
  roof.add(cone)
  roof.scale.set(w * 0.78, h, d * 0.78)
  roof.position.y = y + h / 2
  return roof
}

function windowsGrid(kit: Kit, columns: number[], rows: number[], z: number): THREE.Mesh[] {
  return rows.flatMap((y) => columns.map((x) => box(kit, [0.3, 0.34, 0.04], kit.windowMaterial(), [x, y, z])))
}

const home: Builder = (kit) => {
  const {wall, roof, trunk, trainDark} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.6, 1.1, 1.4], kit.material(wall), [0, 0.55, 0]),
    hipRoof(kit, 1.6, 1.4, 0.9, roof, 1.1),
    box(kit, [0.25, 0.6, 0.25], kit.material(trainDark), [0.45, 1.75, -0.25]),
    box(kit, [0.34, 0.6, 0.04], kit.material(trunk), [0, 0.3, 0.71]),
    ...windowsGrid(kit, [-0.5, 0.5], [0.66], 0.71)
  )
  return g
}

const workshop: Builder = (kit) => {
  const {wall, accent, trunk, metal} = kit.colors
  const gear = kit.mesh(new THREE.TorusGeometry(0.28, 0.08, 6, 10), kit.material(metal))
  gear.position.set(0.66, 0.7, 0.74)
  const g = new THREE.Group()
  g.add(
    box(kit, [2, 1, 1.4], kit.material(wall), [0, 0.5, 0]),
    hipRoof(kit, 2, 1.4, 0.7, accent, 1),
    box(kit, [0.8, 0.72, 0.04], kit.material(trunk), [-0.3, 0.36, 0.71]),
    gear,
    box(kit, [0.4, 0.4, 0.4], kit.material(trunk), [1.3, 0.2, 0.35]),
    box(kit, [0.3, 0.3, 0.3], kit.material(trunk), [1.3, 0.15, -0.15])
  )
  return g
}

const school: Builder = (kit) => {
  const {wall, roof, stone, metal, accent} = kit.colors
  const columns = [-1.1, -0.5, 0.5, 1.1].map((x) => {
    const column = kit.mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 6), kit.material(wall))
    column.position.set(x, 0.5, 0.95)
    return column
  })
  const g = new THREE.Group()
  g.add(
    box(kit, [2.8, 1.2, 1.6], kit.material(wall), [0, 0.6, 0]),
    hipRoof(kit, 3, 2, 0.6, roof, 1.2),
    box(kit, [1.6, 0.12, 0.4], kit.material(stone), [0, 0.06, 1.15]),
    ...columns,
    post(kit, 2.3, metal, [1.7, 0.6]),
    box(kit, [0.5, 0.3, 0.02], kit.material(accent), [1.96, 2.1, 0.6]),
    ...windowsGrid(kit, [-0.8, 0, 0.8], [0.7], 0.81)
  )
  return g
}

const office: Builder = (kit) => {
  const {wall, trainDark} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.8, 1.9, 1.5], kit.material(wall), [0, 0.95, 0]),
    box(kit, [1.95, 0.12, 1.65], kit.material(trainDark), [0, 1.96, 0]),
    ...windowsGrid(kit, [-0.5, 0, 0.5], [0.6, 1.35], 0.76)
  )
  return g
}

const press: Builder = (kit) => {
  const {wall, accent, trainDark} = kit.colors
  const stack = kit.mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), kit.material(trainDark))
  stack.position.set(-0.55, 3.1, -0.4)
  const g = new THREE.Group()
  g.add(
    box(kit, [1.7, 2.5, 1.6], kit.material(wall), [0, 1.25, 0]),
    box(kit, [1.4, 0.45, 0.08], kit.material(accent), [0, 2.85, 0.45]),
    stack,
    ...windowsGrid(kit, [-0.45, 0.45], [0.8, 1.6], 0.81)
  )
  return g
}

const tower: Builder = (kit) => {
  const {wall, accent, metal} = kit.colors
  const antenna = kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), kit.material(metal))
  antenna.position.y = 3.95
  const g = new THREE.Group()
  g.add(
    box(kit, [1.5, 3.4, 1.5], kit.material(wall), [0, 1.7, 0]),
    box(kit, [1.6, 0.25, 1.6], kit.material(accent), [0, 3.4, 0]),
    antenna,
    ...windowsGrid(kit, [-0.35, 0.35], [0.7, 1.4, 2.1, 2.8], 0.76)
  )
  return g
}

/** Billboard showing the project's logo. */
const kiosk: Builder = (kit, station, loadAssets) => {
  const {wall, trunk, roof} = kit.colors
  const g = new THREE.Group()
  g.add(
    post(kit, 1.5, trunk, [-0.65, 0]),
    post(kit, 1.5, trunk, [0.65, 0]),
    box(kit, [1.6, 1.15, 0.1], kit.material(wall), [0, 1.75, 0]),
    box(kit, [1.8, 0.08, 0.32], kit.material(roof), [0, 2.38, 0.05])
  )
  if (loadAssets && station.image) {
    const texture = new THREE.TextureLoader().load(station.image)
    texture.colorSpace = THREE.SRGBColorSpace
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshBasicMaterial({map: texture, toneMapped: false}))
    logo.position.set(0, 1.75, 0.056)
    g.add(logo)
  }
  return g
}

const postOffice: Builder = (kit) => {
  const {wall, accent, metal} = kit.colors
  const g = new THREE.Group()
  g.add(
    box(kit, [1.6, 1, 1.3], kit.material(wall), [0, 0.5, 0]),
    hipRoof(kit, 1.6, 1.3, 0.7, accent, 1),
    post(kit, 0.6, metal, [1.05, 0.6]),
    box(kit, [0.32, 0.42, 0.26], kit.material(accent), [1.05, 0.8, 0.6]),
    ...windowsGrid(kit, [-0.45, 0.45], [0.6], 0.66)
  )
  return g
}

export const BUILDERS: Readonly<Record<StationKind, Builder>> = {
  home,
  workshop,
  school,
  office,
  press,
  tower,
  kiosk,
  post: postOffice
}
```

- [ ] **Step 5: `app/scenes/cartoon/stations.ts`**

```ts
import * as THREE from 'three'
import type {JourneyStation} from '~/data/journeyStations'
import {BUILDERS} from './buildings'
import type {Kit} from './kit'
import {sideAt} from './track'

// Calibration knobs: how far platform and building sit from the track centre.
const PLATFORM_OFFSET = 1.25
const BUILDING_OFFSET = 3.4
const LAMP_ALONG = 1.1
const SIGN_ALONG = -1.1

export interface StationAnchor {
  u: number
  platform: THREE.Vector3
  building: THREE.Vector3
  /** Ground-plane unit vector from the track towards the building (island-inward). */
  inward: THREE.Vector3
}

/** Stations sit at even arc-length spacing, half a gap in from the loop seam. */
export const stationU = (index: number, count: number) => (index + 0.5) / count

function numberSign(label: string, loadAssets: boolean): THREE.Material | null {
  if (!loadAssets || typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#fbf4e2'
  ctx.fillRect(0, 0, 128, 64)
  ctx.fillStyle = '#3f2a1f'
  ctx.font = 'bold 40px Fraunces, Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 64, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshBasicMaterial({map: texture, toneMapped: false})
}

function lamp(kit: Kit, at: THREE.Vector3): THREE.Group {
  const pole = kit.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 5), kit.material(kit.colors.metal))
  pole.position.y = 0.87
  const bulb = kit.mesh(new THREE.SphereGeometry(0.1, 6, 4), kit.glowMaterial())
  bulb.position.y = 1.56
  const g = new THREE.Group()
  g.add(pole, bulb)
  g.position.copy(at)
  return g
}

function sign(kit: Kit, label: string, at: THREE.Vector3, facing: number, loadAssets: boolean): THREE.Group {
  const pole = kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 5), kit.material(kit.colors.metal))
  pole.position.y = 0.72
  const face = numberSign(label, loadAssets) ?? kit.material(kit.colors.wall)
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), face)
  board.position.y = 1.3
  const g = new THREE.Group()
  g.add(pole, board)
  g.position.copy(at)
  g.rotation.y = facing
  return g
}

export function buildStations(
  kit: Kit,
  curve: THREE.CatmullRomCurve3,
  list: readonly JourneyStation[],
  loadAssets: boolean
): {group: THREE.Group; anchors: StationAnchor[]} {
  const group = new THREE.Group()
  group.name = 'stations'

  const anchors = list.map((station, i) => {
    const u = stationU(i, list.length)
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    const inward = sideAt(curve, u)
    if (inward.dot(new THREE.Vector3(-p.x, 0, -p.z)) < 0) inward.negate()
    const along = Math.atan2(t.x, t.z)
    const facingTrack = Math.atan2(-inward.x, -inward.z)

    const platformAt = p.clone().addScaledVector(inward, PLATFORM_OFFSET).setY(0)
    const buildingAt = p.clone().addScaledVector(inward, BUILDING_OFFSET).setY(0)

    const platform = kit.mesh(new THREE.BoxGeometry(0.9, 0.22, 2.6), kit.material(kit.colors.platform))
    platform.position.copy(platformAt).setY(0.11)
    platform.rotation.y = along
    platform.name = `platform-${i}`

    const building = BUILDERS[station.kind](kit, station, loadAssets)
    building.position.copy(buildingAt)
    building.rotation.y = facingTrack
    building.name = `station-${i}`

    group.add(
      platform,
      building,
      lamp(kit, platformAt.clone().addScaledVector(t, LAMP_ALONG)),
      sign(kit, String(i).padStart(2, '0'), platformAt.clone().addScaledVector(t, SIGN_ALONG), facingTrack, loadAssets)
    )
    return {u, platform: platformAt, building: buildingAt, inward}
  })

  return {group, anchors}
}
```

- [ ] **Step 6: `app/scenes/cartoon/train.ts`**

```ts
import * as THREE from 'three'
import type {Kit} from './kit'
import {wrapU} from './motion'
import {RAIL_HEIGHT} from './track'

// Models face +x with the origin on the rail centre line.
const CAR_SPACING = 1.75 // world units between car centres
const WHEEL_RADIUS = 0.22
const SMOKE_PUFFS = 8
const SMOKE_LIFE = 1.6 // seconds
const SMOKE_RISE = 0.9 // units/s
const CHIMNEY = new THREE.Vector3(0.65, 1.5, 0)

export interface Train {
  group: THREE.Group
  /** Place the train at u, moving at `speed` units/s (signed). */
  place(curve: THREE.CatmullRomCurve3, length: number, u: number, speed: number, dt: number): void
}

function wheels(kit: Kit, xs: number[]): THREE.Mesh[] {
  return xs.flatMap((x) =>
    [-0.4, 0.4].map((z) => {
      const wheel = kit.mesh(new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.08, 10), kit.material(kit.colors.metal))
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, WHEEL_RADIUS + 0.03, z)
      wheel.userData.wheel = true
      return wheel
    })
  )
}

function part(kit: Kit, geometry: THREE.BufferGeometry, material: THREE.Material, at: [number, number, number]): THREE.Mesh {
  const mesh = kit.mesh(geometry, material)
  mesh.position.set(...at)
  return mesh
}

function locomotive(kit: Kit): THREE.Group {
  const {train, trainDark} = kit.colors
  const boiler = part(kit, new THREE.CylinderGeometry(0.33, 0.33, 1.2, 10), kit.material(train), [0.25, 0.72, 0])
  boiler.rotation.z = Math.PI / 2
  const catcher = part(kit, new THREE.ConeGeometry(0.32, 0.35, 4), kit.material(trainDark), [1.08, 0.28, 0])
  catcher.rotation.z = -Math.PI / 2
  const loco = new THREE.Group()
  loco.name = 'train-loco'
  loco.add(
    part(kit, new THREE.BoxGeometry(2, 0.2, 0.75), kit.material(trainDark), [0, 0.32, 0]),
    boiler,
    part(kit, new THREE.BoxGeometry(0.7, 0.9, 0.8), kit.material(train), [-0.55, 0.87, 0]),
    part(kit, new THREE.BoxGeometry(0.85, 0.1, 0.95), kit.material(trainDark), [-0.55, 1.37, 0]),
    part(kit, new THREE.CylinderGeometry(0.12, 0.16, 0.45, 8), kit.material(trainDark), [0.65, 1.2, 0]),
    part(kit, new THREE.SphereGeometry(0.09, 6, 4), kit.glowMaterial(), [0.9, 0.85, 0]),
    catcher,
    ...wheels(kit, [-0.6, 0, 0.6])
  )
  if (kit.isDark) {
    const headlight = new THREE.PointLight(kit.colors.glow, 3, 8, 2)
    headlight.position.set(1.4, 0.9, 0)
    loco.add(headlight)
  }
  return loco
}

function wagon(kit: Kit, body: number): THREE.Group {
  const {trainDark, roof} = kit.colors
  const g = new THREE.Group()
  g.add(
    part(kit, new THREE.BoxGeometry(1.5, 0.2, 0.75), kit.material(trainDark), [0, 0.32, 0]),
    part(kit, new THREE.BoxGeometry(1.4, 0.65, 0.8), kit.material(body), [0, 0.72, 0]),
    part(kit, new THREE.BoxGeometry(1.55, 0.1, 0.9), kit.material(roof), [0, 1.1, 0]),
    ...wheels(kit, [-0.45, 0.45])
  )
  return g
}

function smoke(kit: Kit): THREE.Mesh[] {
  return Array.from({length: SMOKE_PUFFS}, (_, i) => {
    const material = new THREE.MeshToonMaterial({color: kit.colors.cloud, transparent: true, opacity: 0, depthWrite: false})
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), material)
    puff.userData.life = i / SMOKE_PUFFS
    return puff
  })
}

export function buildTrain(kit: Kit): Train {
  const group = new THREE.Group()
  group.name = 'train'
  const cars = [locomotive(kit), wagon(kit, kit.colors.wall), wagon(kit, kit.colors.accent)]
  const puffs = smoke(kit)
  group.add(...cars, ...puffs)

  const chimney = new THREE.Vector3()
  let wheelAngle = 0

  return {
    group,
    place(curve, length, u, speed, dt) {
      cars.forEach((car, k) => {
        const uk = wrapU(u - (k * CAR_SPACING) / length)
        const t = curve.getTangentAt(uk)
        car.position.copy(curve.getPointAt(uk)).setY(RAIL_HEIGHT)
        car.rotation.y = Math.atan2(-t.z, t.x)
      })

      wheelAngle -= (speed * dt) / WHEEL_RADIUS
      group.traverse((o) => {
        if (o.userData.wheel) o.rotation.y = wheelAngle
      })

      // Puffs drift up from the chimney; they thin out when the train stands still.
      cars[0].localToWorld(chimney.copy(CHIMNEY))
      const activity = Math.min(1, 0.25 + Math.abs(speed) / 4)
      for (const puff of puffs) {
        let life = puff.userData.life + dt / SMOKE_LIFE
        if (life >= 1) {
          life -= 1
          puff.position.copy(chimney)
        }
        puff.userData.life = life
        puff.position.y += SMOKE_RISE * dt
        puff.scale.setScalar(0.5 + life * 1.6)
        ;(puff.material as THREE.MeshToonMaterial).opacity = (1 - life) * 0.7 * activity
      }
    }
  }
}
```
Note: wheels are cylinders turned onto the z axis (`rotation.x = π/2`); spinning them about their own axis after that turn is `rotation.y` in Euler XYZ order. If they visibly wobble instead of rolling, nest each wheel in a group (outer group `rotation.x = π/2`, inner mesh spins on `rotation.y`) and record a ruling.

- [ ] **Step 7: `app/scenes/cartoon/world.ts`**

```ts
import * as THREE from 'three'
import {faceted, type Kit} from './kit'
import type {StationAnchor} from './stations'
import type {Track} from './track'

const ISLAND = {width: 40, depth: 32, radius: 7, thickness: 2.4}
const EDGE_MARGIN = 1.2
const POND = {x: -1, z: 1.5, radius: 2.4}
const WINDMILL = {x: -6.5, z: -1.5}
const BALLOON = {x: 13, y: 7, z: -8}
const COUNTS = {high: {trees: 90, flowers: 160, rocks: 26}, low: {trees: 40, flowers: 60, rocks: 12}}
const CLEAR = {track: 1.8, building: 2.6, platform: 1.6}
const CLOUDS: ReadonlyArray<readonly [number, number, number]> = [
  [-20, 10, -10], [-9, 12, 6], [2, 9, -14], [12, 11, 8], [22, 10, -4], [-2, 13, 14], [16, 12, -16]
]
const CLOUD_SPEED = 0.6
const CLOUD_WRAP = 30
const BLADE_SPEED = 0.9

export interface World {
  group: THREE.Group
  update(dt: number, elapsed: number): void
}

type IsFree = (x: number, z: number, margin: number) => boolean

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Grass top with cliff sides, floating on an inverted rock. */
function island(kit: Kit): THREE.Group {
  const geometry = new THREE.ExtrudeGeometry(roundedRect(ISLAND.width, ISLAND.depth, ISLAND.radius), {
    depth: ISLAND.thickness,
    bevelEnabled: false,
    curveSegments: 6
  })
  geometry.rotateX(-Math.PI / 2) // extrusion now runs up +y; shape y maps to −z
  const top = new THREE.Mesh(geometry, [kit.material(kit.colors.grass), kit.material(kit.colors.cliff)])
  top.position.y = -ISLAND.thickness
  const under = kit.mesh(new THREE.CylinderGeometry(ISLAND.width * 0.42, 3, 9, 8), kit.material(kit.colors.ground))
  under.scale.z = ISLAND.depth / ISLAND.width
  under.position.y = -ISLAND.thickness - 4.5
  const g = new THREE.Group()
  g.add(top, under)
  return g
}

function insideIsland(x: number, z: number, margin: number): boolean {
  const r = ISLAND.radius
  const cx = THREE.MathUtils.clamp(x, -ISLAND.width / 2 + r, ISLAND.width / 2 - r)
  const cz = THREE.MathUtils.clamp(z, -ISLAND.depth / 2 + r, ISLAND.depth / 2 - r)
  return (x - cx) ** 2 + (z - cz) ** 2 <= (r - margin) ** 2
}

function freeSpace(track: Track, anchors: StationAnchor[]): IsFree {
  const blocked = [
    ...anchors.flatMap((a) => [{p: a.building, r: CLEAR.building}, {p: a.platform, r: CLEAR.platform}]),
    {p: new THREE.Vector3(POND.x, 0, POND.z), r: POND.radius + 0.8},
    {p: new THREE.Vector3(WINDMILL.x, 0, WINDMILL.z), r: 1.8}
  ]
  return (x, z, margin) => {
    if (!insideIsland(x, z, EDGE_MARGIN + margin)) return false
    const near = (p: THREE.Vector3, r: number) => (p.x - x) ** 2 + (p.z - z) ** 2 < (r + margin) ** 2
    return !track.samples.some((s) => near(s, CLEAR.track)) && !blocked.some((b) => near(b.p, b.r))
  }
}

function scatter(kit: Kit, count: number, isFree: IsFree, margin: number, gap: number): THREE.Vector2[] {
  const out: THREE.Vector2[] = []
  for (let i = 0; i < count * 14 && out.length < count; i++) {
    const x = (kit.random() - 0.5) * ISLAND.width
    const z = (kit.random() - 0.5) * ISLAND.depth
    if (isFree(x, z, margin) && out.every((o) => (o.x - x) ** 2 + (o.y - z) ** 2 > gap * gap)) out.push(new THREE.Vector2(x, z))
  }
  return out
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh {
  return new THREE.InstancedMesh(geometry, material, Math.max(1, count))
}

function forest(kit: Kit, spots: THREE.Vector2[]): THREE.Group {
  const trunks = instanced(faceted(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 5)), kit.material(kit.colors.trunk), spots.length)
  const crowns = [kit.colors.leaf, kit.colors.leafDark].map((c) =>
    instanced(faceted(new THREE.ConeGeometry(0.62, 1.4, 6)), kit.material(c), spots.length)
  )
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0)
  spots.forEach((spot, i) => {
    const size = 0.75 + kit.random() * 0.6
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), kit.random() * Math.PI)
    s.setScalar(size)
    trunks.setMatrixAt(i, m.compose(new THREE.Vector3(spot.x, 0.3 * size, spot.y), q, s))
    const pick = i % 2
    crowns[pick].setMatrixAt(i, m.compose(new THREE.Vector3(spot.x, 1.25 * size, spot.y), q, s))
    crowns[1 - pick].setMatrixAt(i, hidden)
  })
  const g = new THREE.Group()
  g.add(trunks, ...crowns)
  return g
}

function scatterMesh(kit: Kit, geometry: THREE.BufferGeometry, color: number, spots: THREE.Vector2[], y: number, tint?: readonly number[]): THREE.InstancedMesh {
  const mesh = instanced(faceted(geometry), kit.material(tint ? 0xffffff : color), spots.length)
  const m = new THREE.Matrix4()
  const c = new THREE.Color()
  spots.forEach((spot, i) => {
    const size = 0.7 + kit.random() * 0.6
    mesh.setMatrixAt(i, m.makeScale(size, size, size).setPosition(spot.x, y * size, spot.y))
    if (tint) mesh.setColorAt(i, c.setHex(tint[i % tint.length]))
  })
  return mesh
}

function windmill(kit: Kit): {group: THREE.Group; blades: THREE.Group} {
  const {wall, roof, trunk} = kit.colors
  const tower = kit.mesh(new THREE.ConeGeometry(0.65, 2.6, 6), kit.material(wall))
  tower.position.y = 1.3
  const cap = kit.mesh(new THREE.ConeGeometry(0.55, 0.6, 6), kit.material(roof))
  cap.position.y = 2.85
  const blades = new THREE.Group()
  for (let k = 0; k < 4; k++) {
    const blade = kit.mesh(new THREE.BoxGeometry(0.16, 1.4, 0.04), kit.material(trunk))
    blade.position.y = 0.7
    const arm = new THREE.Group()
    arm.rotation.z = (k * Math.PI) / 2
    arm.add(blade)
    blades.add(arm)
  }
  blades.position.set(0, 2.4, 0.62)
  const group = new THREE.Group()
  group.add(tower, cap, blades)
  group.position.set(WINDMILL.x, 0, WINDMILL.z)
  group.rotation.y = 0.6
  return {group, blades}
}

function cloud(kit: Kit, [x, y, z]: readonly [number, number, number]): THREE.Group {
  const g = new THREE.Group()
  for (const [px, py, r] of [[0, 0, 0.9], [0.95, 0.15, 0.7], [-0.9, -0.05, 0.65], [0.3, 0.45, 0.6]] as const) {
    const puff = kit.mesh(new THREE.SphereGeometry(r, 8, 6), kit.material(kit.colors.cloud))
    puff.position.set(px, py, 0)
    g.add(puff)
  }
  g.position.set(x, y, z)
  return g
}

function balloon(kit: Kit): THREE.Group {
  const envelope = kit.mesh(new THREE.SphereGeometry(0.9, 10, 8), kit.material(kit.colors.accent))
  envelope.scale.y = 1.15
  const band = kit.mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.25, 10), kit.material(kit.colors.wall))
  band.position.y = -0.45
  const basket = kit.mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), kit.material(kit.colors.trunk))
  basket.position.y = -1.35
  const g = new THREE.Group()
  g.add(envelope, band, basket)
  g.position.set(BALLOON.x, BALLOON.y, BALLOON.z)
  return g
}

export function buildWorld(kit: Kit, track: Track, anchors: StationAnchor[], detail: 'high' | 'low'): World {
  const counts = COUNTS[detail]
  const isFree = freeSpace(track, anchors)
  const pond = kit.mesh(new THREE.CylinderGeometry(POND.radius, POND.radius, 0.08, 12), kit.material(kit.colors.water))
  pond.position.set(POND.x, 0.02, POND.z)
  const mill = windmill(kit)
  const clouds = CLOUDS.map((spot) => cloud(kit, spot))
  const air = balloon(kit)

  const group = new THREE.Group()
  group.name = 'world'
  group.add(
    island(kit),
    forest(kit, scatter(kit, counts.trees, isFree, 0.4, 1.1)),
    scatterMesh(kit, new THREE.IcosahedronGeometry(0.09, 0), 0, scatter(kit, counts.flowers, isFree, 0, 0.35), 0.09, kit.colors.flowers),
    scatterMesh(kit, new THREE.DodecahedronGeometry(0.28, 0), kit.colors.stone, scatter(kit, counts.rocks, isFree, 0.2, 1), 0.12),
    pond,
    mill.group,
    air,
    ...clouds
  )

  return {
    group,
    update(dt, elapsed) {
      mill.blades.rotation.z += dt * BLADE_SPEED
      air.position.y = BALLOON.y + Math.sin(elapsed * 0.6) * 0.4
      for (const c of clouds) {
        c.position.x += dt * CLOUD_SPEED
        if (c.position.x > CLOUD_WRAP) c.position.x = -CLOUD_WRAP
      }
    }
  }
}
```
- [ ] **Step 8: `app/scenes/cartoon/index.ts`**

```ts
import * as THREE from 'three'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'
import type {SceneFactory} from '../types'
import {createKit} from './kit'
import {DEFAULT_MOTION, stepTrain, type TrainMotion} from './motion'
import {buildStations} from './stations'
import {buildTrack, sideAt} from './track'
import {buildTrain} from './train'
import {buildWorld} from './world'

// Station kinds and logos are language-independent (test/journeyStations.spec.ts).
const STATIONS = journeyStations(PROFILE_CONTENT.en)

const CAMERA_FOV = 42
const FOG = {near: 38, far: 95}
// Calibration knobs, tuned by screenshot: the overview keeps the island to the
// right of the hero text on /, the chase camera frames each station on the
// right half of the screen beside the /about panel.
const OVERVIEW = {position: new THREE.Vector3(10, 24, 36), look: new THREE.Vector3(-8, -2, 1)}
const OVERVIEW_NARROW = {position: new THREE.Vector3(0, 32, 46), look: new THREE.Vector3(0, -2, 0)}
const CHASE = {distance: 7.5, height: 4.2, back: 2.5, lookShift: 2.4, lookRise: 0.8, frame: 12}
const CAMERA_SMOOTHING = 2.5
const POINTER_SWAY = 1.2

export const createCartoonScene: SceneFactory = ({isDark, aspect, reduceMotion = false, detail = 'high', loadAssets = true}) => {
  const kit = createKit(isDark)
  const {colors} = kit

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(colors.sky)
  scene.fog = new THREE.Fog(colors.sky, FOG.near, FOG.far)
  scene.add(new THREE.HemisphereLight(colors.sky, colors.ground, isDark ? 0.45 : 1.1))
  const sun = new THREE.DirectionalLight(0xffffff, isDark ? 0.35 : 1.4)
  sun.position.set(12, 20, 8)
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 220)

  const track = buildTrack(kit)
  const stations = buildStations(kit, track.curve, STATIONS, loadAssets && typeof window !== 'undefined')
  const world = buildWorld(kit, track, stations.anchors, detail)
  const train = buildTrain(kit)
  scene.add(world.group, track.group, stations.group, train.group)

  const config = {length: track.length, ...DEFAULT_MOTION}
  let motion: TrainMotion = {u: 0, velocity: 0}
  let cameraReady = false
  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()
  const wantEye = new THREE.Vector3()
  const wantLook = new THREE.Vector3()
  const inward = new THREE.Vector3()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  const overview = (pointer: {x: number; y: number}) => {
    const shot = camera.aspect < 1 ? OVERVIEW_NARROW : OVERVIEW
    wantEye.copy(shot.position).add(new THREE.Vector3(pointer.x * POINTER_SWAY, -pointer.y * POINTER_SWAY * 0.5, 0))
    wantLook.copy(shot.look)
  }

  const chase = (stop: number) => {
    const anchor = stations.anchors[Math.min(stop, stations.anchors.length - 1)]
    const trainAt = track.curve.getPointAt(motion.u)
    sideAt(track.curve, motion.u, inward)
    if (inward.dot(new THREE.Vector3(-trainAt.x, 0, -trainAt.z)) < 0) inward.negate()
    const tangent = track.curve.getTangentAt(motion.u)

    // Stand on the outer side of the train, a little behind, looking across it at the station.
    wantEye.copy(trainAt).addScaledVector(inward, -CHASE.distance).addScaledVector(tangent, -CHASE.back)
    wantEye.y = CHASE.height
    const nearness = THREE.MathUtils.clamp(1 - trainAt.distanceTo(anchor.building) / CHASE.frame, 0, 1)
    wantLook.copy(trainAt).lerp(anchor.building, 0.5 * nearness)
    wantLook.y += CHASE.lookRise

    // Shift the aim left so the subject sits right of centre, clear of the text panel.
    const shift = CHASE.lookShift * THREE.MathUtils.clamp((camera.aspect - 0.8) / 0.8, 0, 1)
    right.subVectors(wantLook, wantEye).cross(up).normalize()
    wantLook.addScaledVector(right, -shift)
  }

  return {
    scene,
    camera,
    update(dt, elapsed, _progress, pointer, stop) {
      const target = stop === null ? null : stations.anchors[Math.min(stop, stations.anchors.length - 1)].u
      motion = stepTrain(motion, target, dt, config, reduceMotion)
      train.place(track.curve, track.length, motion.u, motion.velocity * track.length, dt)
      world.update(dt, elapsed)

      if (stop === null) overview(pointer)
      else chase(stop)
      if (!cameraReady || reduceMotion) {
        eye.copy(wantEye)
        look.copy(wantLook)
        cameraReady = true
      } else {
        const k = Math.min(1, dt * CAMERA_SMOOTHING)
        eye.lerp(wantEye, k)
        look.lerp(wantLook, k)
      }
      camera.position.copy(eye)
      camera.lookAt(look)
    }
  }
}
```

- [ ] **Step 9: Run tests, lint, typecheck**

```bash
npx vitest run test/scenes.spec.ts test/trainMotion.spec.ts test/journeyStations.spec.ts
npm run lint
lsof -ti tcp:3000 | xargs kill; npm run typecheck
```
Expected: all green. Commit `feat(scene): cartoon diorama island with a journey train`.

### Task 28: Calibrate by screenshot, e2e, docs, gate

**Files:** calibration constants in `app/scenes/cartoon/{index,track,stations}.ts`; `e2e/about-journey.spec.ts`; `design.md`.

- [ ] **Step 1: Screenshots** — start dev (`(npm run dev > /tmp/dev.log 2>&1 &)`), then with Playwright (SwiftShader flags as in earlier scratchpad scripts) capture, for cartoon light and dark:
  - `/` at 1280×800 and 375×740;
  - `/about` at 1280×800 for stops 0, 1, 2, 5, 6, 11, 16 — scroll each stop into view, wait 8 s so the train arrives, capture the full viewport.
  Check: island on the right of the hero; on every stop the train is parked at a platform and the station building is visible right of the text panel; no building intersects the track, another building, or the island edge; trees not on rails. Adjust `OVERVIEW`, `CHASE`, `PLATFORM_OFFSET`/`BUILDING_OFFSET` or a `CONTROL` point, re-run, and record each change as a ruling.

- [ ] **Step 2: e2e — append to `e2e/about-journey.spec.ts`**

```ts
  test('the cartoon train can be driven through the whole journey without errors', async ({page}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'one run is enough')
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.addInitScript(() => localStorage.setItem('vibe', 'cartoon'))

    await page.goto('/about')
    await expect(page.locator('canvas.vibe-scene')).toHaveCount(1)
    for (const stop of [3, 9, 16, 0, 12]) {
      await page.locator(`#stop-${stop}`).scrollIntoViewIfNeeded()
      await expect(page.locator('.journey')).toHaveAttribute('data-active-stop', String(stop))
    }
    await page.waitForTimeout(3000)
    expect(errors).toEqual([])
  })
```

- [ ] **Step 3: Performance and memory in a real browser (BrowserOS neo)** — on `/about` cartoon at 1280 px, sample frame rate for 3 s with `requestAnimationFrame` in an evaluate (expect ≥ 50 fps on desktop; if lower, halve `COUNTS.high` and the rail `SAMPLES`). Switch vibes 20× and read `performance.memory.usedJSHeapSize` before/after (expect a plateau, as in Phase 2).

- [ ] **Step 4: `design.md`** — under `## Motion`, add: "- Cartoon: a train loops the diorama island on `/`; on `/about` it runs to the centred stop's station (braking curve, shortest way round) with a chase camera; reduced motion parks it instantly."

- [ ] **Step 5: Gate**

```bash
npx vitest run --coverage && npm run lint
lsof -ti tcp:3000 | xargs kill; npm run typecheck
(npm run dev > /tmp/dev.log 2>&1 &); sleep 30
npx playwright test --workers=1 --reporter=line
git push -u origin feature/dainq/vibes-8-train
```
Expected: all green. Commit `docs: cartoon train motion`.

---

## Verification (end-to-end)

1. Unit: `journeyStations`, `stepTrain` (9 cases incl. seam, reverse, no overshoot, reduced motion), cartoon scene (17 stations, parks at stop 5, reduced-motion first frame, loops at home).
2. E2E: full suite serially, including the cartoon run-through and the existing contrast and vibe specs.
3. Visual: screenshots listed in Task 28 reviewed in light and dark.
4. Real browser: frame rate and heap plateau.

## Execution notes

- Calibration constants are expected to change after the first screenshots; that is what they are for.
- If `ExtrudeGeometry` group order puts cliff colour on the top cap, swap the material array.
