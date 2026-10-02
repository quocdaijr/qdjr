# Ghibli cartoon + project sub-sections for galaxy and terminal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline, this repo's pattern). Steps use `- [ ]`. TDD for every behaviour; one squashed commit per phase PR.

**Goal:** (A) give the cartoon vibe a painterly Studio-Ghibli look; (B) give the Projects stop on `/about` its own 3D sub-section in the galaxy vibe (constellations + shooting stars) and in the terminal/coding vibe (a 3D git commit graph), both driven by the existing project picker.

**Architecture:** Three phases, each its own stacked PR on `feature/dainq/vibes-9-projects`.
- Phase 10 rebuilds only the cartoon *look* (sky dome shader, cumulus clouds, wind-swayed foliage and grass, petals/fireflies, Ghibli palette). Track, stations, train, yard and cameras are untouched.
- Phase 11 adds two shared helpers (`projectsStopIndex`, `framing.ts`) and a galaxy constellation module driven by `stop` + `focus` (already passed to every scene).
- Phase 12 adds a terminal commit-graph module on the same helpers.

**Tech stack:** three 0.186 (`ShaderMaterial`, `onBeforeCompile`, `InstancedMesh`, `Points`, `LineSegments`, `CanvasTexture`), Nuxt 4 SPA, Vitest (happy-dom), Playwright. No new dependency.

## Context

User (verbatim, `/hallmark`): *"can enhance UI with threeJS, vibe ghibli for cartoon. And enhance sub section (list projects) for galaxy and coding. galaxy: shooting stars. coding: suggest me"*.
Choices (AskUserQuestion): coding → **Git commit graph**; galaxy → **Constellations** (each project a star, two employer constellations, ambient shooting stars, picking fires a shooting star onto the project's star); Ghibli → **Full painterly pass**.

Current state (branch `feature/dainq/vibes-9-projects`):
- `VibeScene.update(dt, elapsed, progress, pointer, stop, focus)` (`app/scenes/types.ts`); `focus` = picked project from `useJourneyFocus()`.
- Projects stop index = the `'yard'` entry of `journeyStations(content)` (`app/data/journeyStations.ts`); 8 stops, Projects = 6.
- `app/scenes/galaxy.ts` (149 lines) and `app/scenes/terminal.ts` (92 lines) use only `progress`; the cartoon chase camera in `app/scenes/cartoon/index.ts` holds the "keep the subject right of the text panel / above it on phones" maths (`lookShift`, `narrowDrop`, `wide`).
- `design.md` § Per-page allowances: three.js "Tier A, primitives only, no GLTF/textures/Lottie". Canvas-drawn label textures and the yard's project logos already exist; shaders are primitives. No image files are added.

Hallmark: `design.md` is the locked system, so genre/theme/type are not re-picked. Component-scope does not apply (scene enrichment). Disciplines that apply: honest copy (no invented commit counts, dates or metrics on screen), locked tokens (scene hexes stay in each scene's palette block mirroring `tokens.css`), reduced motion, canvas `aria-hidden`, 320/375/414/768 checks.

## Global Constraints
- Files < 300 lines (split modules like `app/scenes/cartoon/`); functions < ~50 lines.
- Animate transforms/opacity/uniforms only; no DOM animation added.
- `prefers-reduced-motion`: one frame per state change (existing VibeScene contract) — wind, drift, particles and streaks freeze; picks still re-frame instantly.
- `detail: 'low'` (coarse pointer) roughly halves instance/particle counts.
- Desktop ≥ 50 fps in a real browser (BrowserOS) on each vibe's `/about` Projects stop; heap plateau over 20 vibe switches.
- Everything new is reachable from the scene graph so `disposeScene` frees it (ShaderMaterials, CanvasTextures, InstancedMesh).
- Stop dev by port before typecheck; Playwright `--workers=1`; commitlint lowercase subjects; trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus
1. Vibe/theme switch while a project is picked: the new scene frames that project on its first frame (all three vibes).
2. Leaving the Projects stop (focus becomes null / stop changes): galaxy and terminal ease back to their journey path, no stuck camera.
3. Reduced motion: no streaks spawn, wind uniform stays 0, picks still snap the camera.
4. Light vs dark: fireflies only at night, petals only by day; constellation lines and commit graph readable on the light palettes (contrast with background ≥ 3:1 for lines/labels).
5. Memory: ShaderMaterial + CanvasTexture + InstancedMesh freed on switch (heap plateau).

---

## Phase 10 — Ghibli cartoon (`feature/dainq/vibes-10-ghibli`)

### Task 10.1 Palette
**Files:** `app/scenes/cartoon/kit.ts`, `test/scenes.spec.ts`.
- [ ] `Colors` gains `skyTop`, `horizon`, `sunlight`, `petal`, `firefly`; retune existing entries to the Ghibli register:
  - light: skyTop `0x7fb8e6`, horizon `0xf3ead3`, grass `0x86bf4f`, leaf `0x4f9a3f`, leafDark `0x2f6e3c`, wall `0xfbf3e0`, roof `0xb8533b`, water `0x6fb7d6`, cloud `0xffffff`, sunlight `0xfff0d2`, petal `0xf7c6cf`.
  - dark (summer night): skyTop `0x141c46`, horizon `0x3c4777`, grass `0x46693a`, leaf `0x31593a`, leafDark `0x223f2c`, cloud `0x8f96bf`, sunlight `0x9fb2ff` (moonlight), firefly `0xf6f08a`.
- [ ] Keep `sky` = `horizon` (fog colour) so existing references stay valid.

### Task 10.2 Painted sky dome
**Files:** create `app/scenes/cartoon/sky.ts`.
- [ ] RED (scenes.spec): `scene.getObjectByName('sky')` is a Mesh with a `ShaderMaterial`, `side === THREE.BackSide`, radius ≥ camera far × 0.5; `scene.background` is null.
- [ ] GREEN: `buildSky(kit): THREE.Mesh` — `SphereGeometry(150, 32, 16)`, `ShaderMaterial({uniforms: {top, horizon, sunDir, sunColor}, side: BackSide, depthWrite: false, fog: false})`; fragment: `mix(horizon, top, smoothstep(-0.05, 0.6, h))` plus a soft sun/moon glow `pow(max(dot(dir, sunDir), 0.), 24.) * 0.6`; at night add hashed star specks above `h > 0.25`.
- [ ] `index.ts`: `scene.background = null`, add sky; fog colour = `horizon`; HemisphereLight(skyTop, grass); DirectionalLight(`sunlight`) low warm angle (afternoon) by day, cool moon by night.

### Task 10.3 Cumulus clouds (instanced)
**Files:** create `app/scenes/cartoon/clouds.ts`; remove `cloud()` + `CLOUDS` from `world.ts`.
- [ ] RED: `clouds` group holds ONE `InstancedMesh` named `cloud-puffs` with ≥ 60 instances (high) / ≥ 30 (low); after 10 s of updates the instance matrices changed (drift) and stay within `CLOUD_WRAP`.
- [ ] GREEN: 9 clusters (5 towering cumulus far behind the island at y 14–24, 4 small near ones); each cluster = 8–14 puffs, flat bottom (puff centres y ≥ cluster base, scale y 0.8), seeded by `kit.random()`. Drift = cluster offset in x; per frame rewrite the cluster's instance matrices (≤ 120 puffs).

### Task 10.4 Wind
**Files:** create `app/scenes/cartoon/wind.ts`; modify `world.ts` (forest crowns, flowers), `kit.ts`.
- [ ] RED (unit, pure): `windOffset(time, x, z, height)` returns 0 at height 0, is bounded by `WIND.amplitude * height`, and is periodic in time. RED (scene): after `update(…, elapsed = 3)` the shared `wind.uniforms.uTime.value === 3`; with `reduceMotion` it stays 0.
- [ ] GREEN: `createWind()` returns `{uniforms: {uTime}, patch(material)}`; `patch` uses `material.onBeforeCompile` to inject `uniform float uTime;` and, after `#include <begin_vertex>`, `transformed.xz += windOffset(...)` (GLSL mirror of the pure function; uses `instanceMatrix[3].xz` under `USE_INSTANCING` for per-tree phase). Patch only crown/grass/flower materials — create those via a new `kit.swayMaterial(color)` so the cached static materials (buildings) are unaffected; set `material.customProgramCacheKey = () => 'sway'`.

### Task 10.5 Grass tufts
**Files:** `world.ts` (new `meadow(kit, isFree, wind, detail)`).
- [ ] RED: `InstancedMesh` named `grass` with count 900 (high) / 350 (low); no instance within `CLEAR.track` of the track samples (reuse `freeSpace`).
- [ ] GREEN: blade = `ConeGeometry(0.05, 0.45, 3)` translated so its base sits at y 0; instance colours vary between grass and leaf; sway material.

### Task 10.6 Petals by day, fireflies at night
**Files:** create `app/scenes/cartoon/particles.ts`.
- [ ] RED: light scene has `Points` named `petals` and no `fireflies`; dark scene the reverse; after 5 s positions changed and every particle is inside the bounds box (wraps); reduced motion leaves positions unchanged.
- [ ] GREEN: petals — 80 (high) / 30 (low) points, `PointsMaterial({size: 0.18, color: petal, transparent, opacity: 0.85, depthWrite: false})`, drifting with the wind direction + slow fall, wrap at bounds. Fireflies — 60 / 24 points, `AdditiveBlending`, size pulsing via per-frame opacity on a few sub-groups (3 materials) so they twinkle out of phase.

### Task 10.7 Calibrate + gate
- [ ] Screenshots (light/dark, 1280 + 375): `/`, `/about` stops 0, 3, 6 (projects, pick 0 and 9), 7. Check: sky gradient visible behind the island on `/`; clouds never cover the hero text area on `/`; text panels keep AA contrast (they're opaque — unchanged); billboards still readable.
- [ ] BrowserOS: fps on `/about` cartoon ≥ 50; heap over 20 switches plateaus.
- [ ] `design.md` Motion bullet: "Cartoon is Ghibli-painterly: painted sky dome, cumulus clouds, wind sway on foliage and grass, petals by day / fireflies at night; all freeze under reduced motion."
- [ ] Full gate (vitest coverage ≥ 80 % branches, lint, typecheck, Playwright serial); squash to one commit `feat(scene): ghibli look for the cartoon diorama`; push; PR #20 based on `vibes-9-projects`.

---

## Phase 11 — Galaxy constellations (`feature/dainq/vibes-11-galaxy-projects`)

### Task 11.1 Shared helpers
**Files:** `app/data/journeyStations.ts`; create `app/scenes/framing.ts`; refactor `app/scenes/cartoon/index.ts` to use it; tests `test/journeyStations.spec.ts`, `test/framing.spec.ts`.
- [ ] RED: `projectsStopIndex(PROFILE_CONTENT.en) === 6`.
- [ ] GREEN: `export const projectsStopIndex = (c: ProfileContent) => journeyStations(c).findIndex((s) => s.kind === 'yard')`.
- [ ] RED (`framing.spec`): `panelAim(look, eye, aspect, {shift, drop})` moves `look` left (relative to the view) by `shift` at aspect ≥ 1.6, not at all at ≤ 0.8, and drops it by `drop` only at ≤ 0.8.
- [ ] GREEN: move the `wide`/`right`/`lookShift`/`narrowDrop` lines from the cartoon chase into `panelAim`; cartoon calls it (existing cartoon tests stay green = refactor proof).

### Task 11.2 Constellation module
**Files:** create `app/scenes/galaxy/constellation.ts` (and move `galaxy.ts` → `app/scenes/galaxy/index.ts`, import path unchanged `~/scenes/galaxy`).
- [ ] RED (scenes.spec): galaxy scene has `star-0`…`star-9`; `constellation-lines` is a `LineSegments` whose segments connect only stars of the same employer group; star positions are deterministic (same across two builds).
- [ ] GREEN: `buildConstellation(projects: readonly {group: string; alt: string}[], colors, loadAssets)`:
  - place group A stars on a seeded shape around `ANCHOR_A` (upper left of the far sky, 40 units out), group B around `ANCHOR_B`; mulberry32 seeding (reuse `mulberry32` from `cartoon/kit.ts` → move to `app/scenes/random.ts`).
  - each star = small `Sprite` with a radial-glow `CanvasTexture` (one shared texture; plain `SpriteMaterial` colour when `loadAssets` false) + a label sprite with `project.alt` in the mono face (only when `loadAssets`).
  - lines: each group's stars joined in order (open polyline), `LineBasicMaterial` with `colors.orbit`, opacity 0.5.
  - `setFocus(k | null, dt, reduceMotion)`: picked star scales to 1.8× and brightens (eased), others 1×.

### Task 11.3 Shooting stars (pure motion + pool)
**Files:** create `app/scenes/galaxy/streaks.ts`, `test/streaks.spec.ts`.
- [ ] RED (pure): `streakPoint(s, t)` = `start + (end − start) · ease(t/duration)`, clamped; `isDone(s, t)`; `nextAmbientDelay(rand)` ∈ [2.5, 6] s.
- [ ] RED (pool): `createStreaks(colors, pool = 6)` — `launch(from, to)` reuses a free slot; never more than `pool` alive; `update(dt)` advances; `ambient(dt, rand)` launches on its delay; with reduced motion `update`/`ambient` do nothing.
- [ ] GREEN: each streak = a thin quad (`PlaneGeometry(1, 0.06)`) stretched between head and a tail trailing 3 units behind the head, `MeshBasicMaterial` additive with a horizontal alpha gradient via vertex colours; head is a tiny glow sprite.

### Task 11.4 Galaxy wiring + camera
**Files:** `app/scenes/galaxy/index.ts`.
- [ ] RED (scenes.spec, like the cartoon yard test): on the projects stop with focus k, `star-k` lands at the same screen x for k = 0 and k = 9; a pick spawns a streak whose `end` equals `star-k` world position; with stop ≠ projects, the camera path equals the existing progress path (unchanged behaviour test: same position as a scene with `stop = null` after the same frames).
- [ ] GREEN: `update(dt, elapsed, progress, pointer, stop, focus)`:
  - `onProjects = stop === PROJECTS_STOP`; `blend = approach(blend, onProjects ? 1 : 0, dt, 2)` (snap when reduced motion or first frame).
  - journey camera as today → `journeyEye/journeyLook`; projects camera: eye = `constellationCentre + (0, 2, 18)` slid toward the picked star, look = picked star (or centre when null) → `panelAim`.
  - camera = lerp(journey, projects, blend).
  - focus change → `streaks.launch(randomEdgePoint(), starPosition(k))`; `constellation.setFocus(k)`.
  - ambient streaks always on (both `/` and `/about`), rate from `nextAmbientDelay`.
- [ ] Light palette check: streak and line colours from the light palette (`orbit`, a new `streak` entry `0x3b3d6b` light / `0xffffff` dark).

### Task 11.5 Calibrate + gate
- [ ] Screenshots galaxy light/dark 1280 + 375: `/` (ambient streak caught mid-flight — use `page.clock` to step), `/about` stop 5, stop 6 picks 0/4/9, stop 7. Check constellations sit right of the panel, labels legible, nothing behind the panel on phones (use `drop`).
- [ ] fps + heap (BrowserOS); `design.md` bullet; gate; squash `feat(scene): galaxy constellations and shooting stars for the projects stop`; PR #21 on `vibes-10-ghibli`.

---

## Phase 12 — Terminal commit graph (`feature/dainq/vibes-12-terminal-projects`)

### Task 12.1 Graph layout (pure)
**Files:** create `app/scenes/terminal/graph.ts` (move `terminal.ts` → `app/scenes/terminal/index.ts`), `test/commitGraph.spec.ts`.
- [ ] RED: `layoutGraph(projects)` returns two trunks (one per employer, older employer lower) and one branch per project; branch k forks off its employer's trunk at an even step, runs `BRANCH_COMMITS = 3` commits parallel to the trunk, then merges back; no two commit nodes closer than 0.9; layout deterministic; `tip(k)` = last commit position of branch k.
- [ ] GREEN: pure function returning `{trunks: Vec3[][], branches: {commits: Vec3[], fork: Vec3, merge: Vec3}[]}` (plain `[x, y, z]` tuples so it stays three-free and unit-testable). Commit counts are uniform and decorative — never shown as numbers (honest-copy discipline).

### Task 12.2 Graph meshes
**Files:** create `app/scenes/terminal/commitGraph.ts`.
- [ ] RED (scenes.spec): terminal scene has `branch-0`…`branch-9` groups and a `HEAD` object; `setFocus(k)` makes branch k's material opacity > every other branch's and moves `HEAD` to `tip(k)` (snap under reduced motion).
- [ ] GREEN: one `InstancedMesh` of commit cubes (`BoxGeometry(0.35)`, grid colour) for all commits; trunk + branch edges as `LineSegments` (one per branch so it can be highlighted); per-branch label sprite `project.alt` in the mono face (`loadAssets` only); `HEAD` = wireframe cube + small `HEAD ->` label; highlighted branch: line opacity 1, its cubes tinted via `setColorAt`, others dim to 0.25. The whole graph floats above the flowing grid at `GRAPH_ORIGIN` (right of the panel), slowly bobbing like the existing icosahedron (which hides while on the Projects stop).

### Task 12.3 Terminal wiring + camera
**Files:** `app/scenes/terminal/index.ts`.
- [ ] RED: same-screen-spot test for `branch-0` vs `branch-9` tips; not-on-projects camera unchanged (same test shape as galaxy); vibe rebuild with focus k frames tip(k) on frame one.
- [ ] GREEN: same `blend` pattern as galaxy; projects camera eye slides along the graph's x to the picked tip, look = tip → `panelAim`; picking also pulses the picked branch once (scale 1→1.15→1 over 300 ms; skipped under reduced motion).

### Task 12.4 Calibrate + gate
- [ ] Screenshots terminal light/dark 1280 + 375 (stops 5, 6 picks 0/5/9, 7); grid-colour contrast on the light palette (lines ≥ 3:1 against `bg`).
- [ ] fps + heap; `design.md` bullet; gate; squash `feat(scene): 3d commit graph for the coding vibe projects stop`; PR #22 on `vibes-11-galaxy-projects`.

## Verification (each phase)
1. Unit: new pure modules (`windOffset`, `streakPoint`/pool, `layoutGraph`, `panelAim`, `projectsStopIndex`) + scene-graph tests above.
2. E2E: existing suites (vibe switching with a live renderer logs no errors; cartoon run-through) plus, per phase, "drive the Projects stop in <vibe>: pick 0, 4, 9, switch vibe, no console errors".
3. Visual: the screenshot sets listed per phase, light and dark, desktop and phone.
4. Real browser: fps ≥ 50 on the Projects stop; heap plateau over 20 vibe switches.
