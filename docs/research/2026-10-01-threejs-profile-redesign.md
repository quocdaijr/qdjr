# Research: three.js profile redesign (date 2026-10-01)

Scope: redesign `/` (profile) with three.js and three switchable vibes (terminal/coding, cartoon-vintage-chill, galaxy/planets) and make `/about` a scroll-driven journey. Repo is Nuxt 4.5 / Vue 3.5.40 / Tailwind v4 / Pinia, `ssr: false` (SPA), Node 24 (`/private/var/www/html/personal/qdjr/package.json`). Already installed and relevant: `@tsparticles/slim` + `@tsparticles/vue3` (can be removed once three.js owns the background).

## Summary (decisions-oriented)

1. **Use raw three.js (0.186.1, MIT) in a `.client.vue` component, not TresJS.** TresJS core is fine (peer `vue >=3.4`, `three >=0.133`), but `@tresjs/cientos` pulls `three-stdlib` + `camera-controls` + `three-mesh-bvh` etc. (745 kB min / 203 kB gzip on bundlephobia) and its Nuxt module bundles `@nuxt/ui`. For 3 hand-built scenes that is weight without payoff. Sources: [npm registry three](https://registry.npmjs.org/three/latest), [bundlephobia cientos](https://bundlephobia.com/api/size?package=@tresjs/cientos@5.9.2), [Tresjs/tres packages/nuxt/package.json](https://raw.githubusercontent.com/Tresjs/tres/main/packages/nuxt/package.json).
2. **Every reference site that nails a vibe uses a plain DOM overlay for text, not in-canvas text.** train-diorama (Tailwind buttons over a static canvas), Bruno Simon (`div.game` + HTML panels), Singularity (fixed canvas `z=0`, fixed `main.content z=10`). Only Henry Heffernan uses CSS3DRenderer (an `<iframe>` inside a `perspective` div). Do the same: one fixed full-viewport canvas, Tailwind HTML on top.
3. **Scroll journey = Lenis (5.5 kB gzip) + a scroll-progress number driving the camera, no GSAP needed.** Singularity does exactly this (Lenis, three r185, no GSAP, 20 viewports of scroll, `position:absolute` 100vh sections, `prefers-reduced-motion` CSS). GSAP is now 100 % free (incl. ScrollTrigger) if pin/snap/scrub smoothing become necessary later. Sources: [bundlephobia lenis](https://bundlephobia.com/api/size?package=lenis@1.3.26), [gsap.com/pricing](https://gsap.com/pricing/).
4. **Native CSS scroll-driven animations are usable for the HTML layer** (Chrome 115+, Edge 115+, Safari 26+, Firefox 160+, 87 % global) but cannot drive a three.js camera, so JS progress is still needed. Source: [caniuse animation-timeline: scroll()](https://caniuse.com/mdn-css_properties_animation-timeline_scroll).
5. **Vibe switching is a theme, not three apps.** Shared renderer/camera/loop; each vibe exports `{ build(scene), update(dt, progress), dispose() }`. Dispose geometry/material/texture explicitly on switch; `scene.remove` does not free GPU memory. Source: [three.js manual: How to dispose of Objects](https://threejs.org/manual/#en/how-to-dispose-of-objects).
6. **Galaxy vibe: `Points` + `BufferGeometry` for the starfield, one `InstancedMesh` for planets (single draw call).** Bloom via `EffectComposer` + `UnrealBloomPass` + `OutputPass` from `three/addons`. Sources: [Points](https://threejs.org/docs/#api/en/objects/Points), [InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh), [post-processing manual](https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing).
7. **Cartoon-vintage vibe palette and type are already proven by train-diorama:** Fredoka (OFL) on cream `#fbf4e2`, brown text `#3f2a1f`/`#5a3b2a`, accent `#ca4e36`, greens `#3f7d5a`/`#5aa843`, sky `#cfe6f4`; night panel `rgba(25,41,67,.92)`. Pixel-art resolution + ink-line toggles are the cheap "vintage" trick (render at 540p and upscale).
8. **Terminal vibe type:** JetBrains Mono / IBM Plex Mono / VT323 are OFL on Google Fonts; Departure Mono is MIT. Henry Heffernan's reference is literally `monospace` white-on-black BIOS text, then a low-poly desk with a CRT. Source: [google/fonts METADATA](https://github.com/google/fonts/tree/main/ofl), [departure-mono LICENSE](https://github.com/rektdeckard/departure-mono).
9. **Assets:** Kenney Train Kit (100 models) and Space Kit (150 files, tagged `planet`) are CC0; Quaternius Ultimate Space Kit is CC0 glTF with planets; Poly Pizza is CC0/CC-BY `.glb` per model (check each). Sources below in C.5.
10. **Stay on `WebGLRenderer`.** `WebGPURenderer` is "the new alternative", auto-falls back to WebGL2, but postprocessing/TSL churn every release (r186 moved imports to `three/webgpu` + `three/tsl`, r187 changed light registration). Source: [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide), [WebGPURenderer.js header](https://raw.githubusercontent.com/mrdoob/three.js/dev/src/renderers/webgpu/WebGPURenderer.js).

## A. Reference sites

Legend: "overlay" = HTML positioned over a full-viewport canvas. Palette/fonts from computed styles unless marked (listing) = only the directory page was inspected.

### Vibe (a) terminal / coding

| Site | URL | Hook | 3D / HTML text | Scroll | Palette | Fonts |
|---|---|---|---|---|---|---|
| Henry Heffernan (2022) | https://henryheffernan.com/ | Low-poly desk + CRT; the monitor runs a real OS in an iframe (`os.henryheffernan.com`) | **CSS3DRenderer**: iframe inside `div[perspective:1541px]` with transforms, 2 canvases (WebGL + CSS3D) | No page scroll (`overflow:hidden`, sh = ih); click-to-zoom camera | `#000` bg, white BIOS text | `monospace` (system) |
| ASTRODITHER (landing.love) | https://astrodither.robertborghesi.is/ | Dithered WebGPU fluid sim, HUD text, "hold for speed" | Overlay; fixed parent, absolute canvas; Astro site, three r180 webgpu, Draco | No scroll (sh = ih), pointer interaction | bg `rgb(8,8,8)`, text `#f7f8f9`, pink dither accents | Azeret Mono |
| Singularity (awwwards) | https://singularity.engl.design/ | 12-chapter scroll essay through a neon particle tunnel | Overlay; `canvas.gl` fixed z=0, `main.content` fixed z=10, `.marker-labels` z=8; sections absolute 100vh | **Lenis** (`html.lenis`), three r185, no GSAP; sh ≈ 19.8 viewports; HUD "scroll to dive in" | `--bg #050507`, `--neon #245de7`, `--neon-hot #4f7dff`, `--ice #dce9ff`, `--gray #8a8f9c` | Space Grotesk (display, `clamp(46px,12.5vw,240px)`), Space Mono (captions 11-12px, `.12em` tracking) |
| Sean Currlin (awwwards, listing) | https://seancurrlin.com/ | Engineer portfolio, interactive 3D models, hidden `/secret` | Not inspected | GSAP + Three.js + React per awwwards tags | — | — |

### Vibe (b) cartoon vintage chill / diorama

| Site | URL | Hook | 3D / HTML text | Scroll | Palette | Fonts |
|---|---|---|---|---|---|---|
| Train Diorama | https://train-diorama.vercel.app/ | Isometric island diorama, looping train, day/evening/night, pixel-art + ink-line toggles | Overlay; Tailwind control panel `absolute bottom-4 left-1/2`, blur + 70-93 % white | No scroll; 4 camera presets (keys 1-4), orbit drag, WASD free cam | cream `#fbf4e2`, brown `#3f2a1f`/`#5a3b2a`, accent `#ca4e36`/`#ef704c`, greens `#3f7d5a`/`#5aa843`, sky `#cfe6f4`/`#4f8fde`; night panel `rgba(25,41,67,.92)` | Fredoka 400-700 (Google Fonts) |
| Bruno Simon | https://bruno-simon.com/ | Drive a toy car through a low-poly world; portfolio as playground | Overlay; `div.game` + HTML "Bruno's Home / Options / Achievements" panels | No scroll (`overflow:hidden`); WASD; three r183 **webgpu** via Vite | `html` radial gradient `rgb(37,31,43)`->`rgb(29,23,33)`, neon pink/purple vegetation, white UI, pink `rgb(255,206,202)` headings | Amatic SC 700 (headings), Nunito 400/700/900 (body), Pally (self-hosted) |
| Agrumea Farm (awwwards) | https://www.agrumeafarm.it/en | Sicilian jam jars tumble as you scroll; **Nuxt + three r160 + Lenis** (same stack as this repo) | 10 small absolute canvases (one per jar) inside normal flow, text in DOM | Lenis, "Scroll to discover", text reveal; `prefers-reduced-motion` rules present | `--color-white #fdf3eb`, `--color-border #762530`, `--color-orange #e94e1b`, `--color-yellow #f39200`, radius 15px | ivystyle-sans + ivymode (Adobe Fonts, paid) |
| Ricardo Chance (landing.love, listing) | https://www.ricardochance.com/ | Illustrated 3D portfolio | Not inspected | — | — | — |
| Jordan Breton (landing.love, listing) | https://jordan-breton.com/ | 3D portfolio | Not inspected | — | — | — |

### Vibe (c) galaxy / planets / space

| Site | URL | Hook | 3D / HTML text | Scroll | Palette | Fonts |
|---|---|---|---|---|---|---|
| 100,000 Stars (Chrome Experiment) | https://stars.chromeexperiments.com/ | Zoom from the Sun out to the Milky Way; star labels | Overlay: absolute `<span>` labels projected per star (DOM, not CSS3D); legacy `three.min.js` + `tween.js` | No page scroll; wheel = zoom slider on right edge; "Take a tour" autoplay | `#000` | Lora (serif UI), Lekton (mono labels, 24px) |
| Singularity | https://singularity.engl.design/ | Particle tunnel as a "journey" | see above | see above | see above | see above |
| ASTRODITHER | see above | Space-ish dither field | see above | — | — | — |
| Austensor (awwwards, listing) | https://www.awwwards.com/sites/austensor-ai-webgl-art | Generative tensor fields / quantum visuals in Three.js | Not inspected | — | — | — |
| Guillaume Zhu / G. Colombel (awwwards, listing) | https://www.awwwards.com/sites/guillaume-zhu , https://www.awwwards.com/sites/g-colombel-portfolio-2026 | Creative-dev portfolios, 3D + motion | Not inspected | — | — | — |

Directory notes: landing.love three.js collection (2156 sites) loaded fine; sites extracted via "Visit X Website" links ([collection](https://www.landing.love/collection/threejs/)). Awwwards three.js (2176 sites) also loaded; external URLs were read from detail pages ([directory](https://www.awwwards.com/websites/three-js/)). Awwwards detail pages tag Agrumea as Nuxt + GSAP + Lenis + Three.js, Singularity/Silvia Malavasi/Sean Currlin as GSAP + Three.js + React.

## B. train-diorama teardown

- **Stack:** vanilla ES modules, no framework. `three@0.186.0` from unpkg (`three.module.js`, `three.core.js`), addons `OrbitControls`, `PointerLockControls`, `BufferGeometryUtils`. App split into ~15 small files (`World.js` 27 kB, `Train.js`, `Materials.js`, `BirdSystem.js`, `BrakeSparks.js`, `LightGlows.js`, `StationWalker.js`, `VillageResidents.js`, `TrackSheep.js`, `Noise.js`, `StaticGeometry.js`). No React, no R3F, no GSAP, no Lenis. (performance.getEntriesByType('resource') on the live page.)
- **Scene:** floating square island with cliff sides, waterfall off one corner, forest, lake, red bridge, windmill, hot-air balloon, flat-shaded clouds on an x-marked gradient sky. Looping train with smoke; birds, sheep, villagers.
- **Camera:** 4 presets (Overview / Free / Train follow / Bridge) on keys 1-4, orbit drag, WASD + mouse free cam, "Turntable" auto-rotate. **No scroll at all**: `scrollHeight === innerHeight`, `overflow: visible`, single static `<canvas>` 1560x972.
- **Text/UI over 3D:** Tailwind v4 (`oklab()` colours, `--radius-*` vars). Bottom control panel `absolute bottom-4 left-1/2 -translate-x-1/2 rounded-3xl` with `backdrop-filter: blur(8-12px)`; day panel `rgba(251,244,226,.93)`, night panel `rgba(25,41,67,.92)`. Top-left "Shortcuts" card `pointer-events-none absolute left-5 top-5 max-w-xs`. `<kbd>` hints. Loading screen = logo SVG + `<progress>`.
- **Vintage tricks:** Time-of-day (Day / Evening / Night) relights the scene; "Pixel art resolution" select (Native / 720p / 540p / 360p) renders low-res then upscales; "Ink lines" outline toggle; "Train speed" + "Time scale" sliders.
- **Palette (CSS hexes):** `#fbf4e2 #3f2a1f #5a3b2a #4a3a30 #6b4a33 #ca4e36 #ef704c #c8453a #3f7d5a #5aa843 #cfe6f4 #4f8fde`; `--ui-active: #ca4e36`.
- **Fonts:** Google Fonts `Fredoka:wght@400;500;600;700&display=swap` with preconnects; body falls back to `system-ui`.
- **Performance feel:** loaded and interactive in a few seconds on desktop; the resolution select is the mobile escape hatch. No `prefers-reduced-motion` rule found.

## C. Technical facts

### C.1 three.js
- Latest `three` = **0.186.1**, published 2026-09-24, MIT, unpacked 20.4 MB (ships src + examples). [registry](https://registry.npmjs.org/three) 
- Package `exports`: `.` -> `build/three.module.js`, `./addons/*` -> `examples/jsm/*`, `./webgpu`, `./tsl`, `./src/*`; `"type":"module"`, `sideEffects: ["./src/nodes/**/*"]` so the core tree-shakes. [registry latest](https://registry.npmjs.org/three/latest)
- Bundlephobia full import: 736 kB min / **185 kB gzip** (`import * as THREE`); a tree-shaken scene is much smaller. [bundlephobia](https://bundlephobia.com/api/size?package=three@0.186.1)
- Import style: `import * as THREE from 'three'`; `import { OrbitControls } from 'three/addons/controls/OrbitControls.js'`. [Installation](https://threejs.org/docs/#manual/en/introduction/Installation)
- `WebGPURenderer` "is the new alternative of WebGLRenderer ... falls back to a WebGL 2 backend" (`forceWebGL` option). [source header](https://raw.githubusercontent.com/mrdoob/three.js/dev/src/renderers/webgpu/WebGPURenderer.js). r186: use `three/webgpu` and `three/tsl` entrypoints; r187: WebGPU light registration changed. [Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- Disposal: `BufferGeometry.dispose()`, `Material.dispose()`, `Texture.dispose()`, `WebGLRenderTarget.dispose()`; "Does removing a mesh from the scene also dispose its geometry and material? No"; check `renderer.info`. [manual](https://threejs.org/manual/#en/how-to-dispose-of-objects)
- Pixel ratio: manual says `renderer.setPixelRatio(window.devicePixelRatio)` is "strongly NOT RECOMMENDED"; instead compute `width = clientWidth * pixelRatio` and call `renderer.setSize(w, h, false)`. Cap the ratio on heavy scenes (3x DPR = 9x pixels). [Responsive Design](https://threejs.org/manual/#en/responsive)
- `InstancedMesh(geometry, material, count)`: `setMatrixAt`, `instanceMatrix.needsUpdate = true`, `setColorAt` / `instanceColor` -> one draw call for N planets. [docs](https://threejs.org/docs/#api/en/objects/InstancedMesh)
- `Points(BufferGeometry, PointsMaterial)` with `sizeAttenuation` for starfields. [docs](https://threejs.org/docs/#api/en/objects/Points)
- Post-processing: `EffectComposer`, `RenderPass`, `UnrealBloomPass(resolution, strength, radius, threshold)`, `OutputPass` from `three/addons/postprocessing/*`; call `composer.render()` instead of `renderer.render`. [manual](https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing)
- Third-party `postprocessing@6.39.5` (Zlib) peer-requires `three >= 0.168 < 0.187`, i.e. it lags each release. [registry](https://registry.npmjs.org/postprocessing/latest)

### C.2 TresJS
- Versions: `@tresjs/core` **5.9.2** (peer `vue >=3.4`, `three >=0.133`), `@tresjs/nuxt` **5.7.2** (peer `three >=0.133`; deps include `@nuxt/kit`, `@nuxt/ui`, `vite-plugin-glsl`), `@tresjs/cientos` **5.9.2** (peer `vue >=3.5.17`, `@tresjs/core ^5.9.1`). All MIT. [core](https://registry.npmjs.org/@tresjs/core/latest), [nuxt](https://registry.npmjs.org/@tresjs/nuxt/latest), [cientos](https://registry.npmjs.org/@tresjs/cientos/latest)
- Nuxt 4 / Vue 3.5: nothing pins a Nuxt major; the Nuxt module lives in the monorepo and depends on `@nuxt/kit`; Vue 3.5.40 satisfies both peers. The old `Tresjs/nuxt` repo is archived into `Tresjs/tres`. [archived README](https://raw.githubusercontent.com/Tresjs/nuxt/main/README.md), [monorepo package.json](https://raw.githubusercontent.com/Tresjs/tres/main/packages/nuxt/package.json)
- Install: `npm install three @tresjs/nuxt`, `modules: ['@tresjs/nuxt']`. Module gives auto-imports, "Client-only rendering for TresCanvas (no need for .client suffix or <ClientOnly />)" and Vue compiler config. [installation](https://docs.tresjs.org/getting-started/installation)
- `<TresCanvas>` props: `renderer`, `renderMode: 'always' | 'on-demand' | 'manual'`, `dpr: number | [min,max]` (reactive), `shadows`, `alpha`, `clearColor`, `toneMapping`, `windowSize`, `fpsLimit`, `enableProvideBridge`. [tres-canvas](https://docs.tresjs.org/api/components/tres-canvas)
- `useLoop()` -> `onBeforeRender(({ delta, elapsed }) => ..., priority)`, `onRender`, `render` (take over the loop), `pause/resume`; only usable inside `<TresCanvas>` children. `useRenderLoop` is not in the v5 API nav (replaced by `useLoop`). [use-loop](https://docs.tresjs.org/api/composables/use-loop), [API index](https://docs.tresjs.org/api)
- Suspense: async loaders (`useLoader`, `useGLTF`) are promise-based, so wrap loader components in `<Suspense>`; not needed for primitives. [use-loader](https://docs.tresjs.org/api/composables/use-loader)
- Cientos site (Stars, OrbitControls, Text3D, Html, useGLTF, Sky, Levioso, MouseParallax) is at https://cientos.tresjs.org/ (linked from the TresJS ecosystem footer; the specific guide pages returned 404 to a headless fetch, so component list is not verified here).
- Bundle: core 118 kB min / **38 kB gzip** plus deps (`@vueuse/core`, `@pmndrs/pointer-events`, `@vue/devtools-kit`); cientos 745 kB min / **203 kB gzip** incl. `three-stdlib` (594 kB), `three-mesh-bvh`, `camera-controls`, `stats-gl`. [core](https://bundlephobia.com/api/size?package=@tresjs/core@5.9.2), [cientos](https://bundlephobia.com/api/size?package=@tresjs/cientos@5.9.2)

### C.3 Raw three.js vs TresJS
- Raw: `components/ProfileScene.client.vue` + `await import('three')` inside `onMounted` -> three lives in its own chunk, zero cost on other routes; full control over dispose and DPR; no peer-version coupling.
- TresJS: declarative `<TresMesh>` is nice for static scenes, but vibe switching with custom shaders, bloom, instancing and manual camera paths is imperative anyway; adds ~40 kB gzip core (+ cientos 200 kB if used) and a second render-loop abstraction.
- Reference sites confirm: train-diorama, Singularity, 100,000 Stars, Henry Heffernan all run vanilla three.js; Agrumea runs three inside Nuxt without TresJS.

### C.4 Scroll-driven journey
- GSAP: "GSAP is now 100% free for all users, thanks to Webflow's support" (maintained by the original team at Webflow); standard license permits commercial use, only prohibits building no-code animation tools competing with Webflow. npm `gsap@3.15.0`, 70 kB min / 27 kB gzip core (ScrollTrigger extra). [pricing](https://gsap.com/pricing/), [standard license](https://gsap.com/standard-license/), [bundlephobia](https://bundlephobia.com/api/size?package=gsap@3.15.0)
- ScrollTrigger: `gsap.registerPlugin(ScrollTrigger)`, `scrub: true | seconds`, `pin`, `snap: { snapTo: 'labels' }`, `onUpdate: self => self.progress` (0-1) to drive a camera. [docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Lenis: package is `lenis` **1.3.26** (MIT, 18.8 kB min / **5.5 kB gzip**); `@studio-freight/lenis` is frozen at 1.0.42. Exports `lenis`, `lenis/vue`, `lenis/nuxt`, `lenis/snap`. Basic: `new Lenis(); requestAnimationFrame(raf)`; GSAP sync via `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`. [registry](https://registry.npmjs.org/lenis/latest), [old pkg](https://registry.npmjs.org/@studio-freight/lenis/latest), [GitHub README](https://github.com/darkroomengineering/lenis), [bundlephobia](https://bundlephobia.com/api/size?package=lenis@1.3.26)
- CSS `animation-timeline: scroll()` / `view()`: Chrome 115+, Edge 115+, Firefox 160+, Safari 26+ / iOS 26+, 87.2 % global; MDN still labels it "Limited availability" (not Baseline). Zero-JS for the HTML layer (progress bars, fade-ins), plus `animation-range`, `scroll-timeline-name`, `view-timeline-inset`. [caniuse](https://caniuse.com/mdn-css_properties_animation-timeline_scroll), [MDN property](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline), [MDN module](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- IntersectionObserver in Vue: VueUse `useIntersectionObserver(target, ([entry]) => ..., { threshold, rootMargin })` returns `{ isActive, stop }` (VueUse is not installed here; native `new IntersectionObserver` in `onMounted`/`onUnmounted` is ~10 lines). [VueUse](https://vueuse.org/core/useIntersectionObserver/)
- `prefers-reduced-motion`: `@media (prefers-reduced-motion: reduce)` and `matchMedia('(prefers-reduced-motion: reduce)').matches`; Baseline widely available since Jan 2020. Singularity ships `*{animation-duration:.01ms!important; scroll-behavior:auto!important}` under it. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- **Smallest viable stack:** native scroll + `window.scrollY / (scrollHeight - innerHeight)` -> `progress` ref -> camera `CatmullRomCurve3.getPointAt(progress)` in the RAF loop; sections are normal `min-h-screen` DOM blocks with Tailwind, revealed by IntersectionObserver or CSS `view()`. Add Lenis (5.5 kB) only for smoothing; add GSAP ScrollTrigger only if pin/snap are wanted.

### C.5 Free assets and fonts
- Kenney **Train Kit**: "Creative Commons CC0", 100 models. [kenney.nl/assets/train-kit](https://kenney.nl/assets/train-kit)
- Kenney **Space Kit**: CC0, 150 files, tagged `planet`; separate "Planets" pack exists. [kenney.nl/assets/space-kit](https://kenney.nl/assets/space-kit), [kenney.nl/assets/planets](https://kenney.nl/assets/planets)
- Quaternius **Ultimate Space Kit**: CC0, FBX/OBJ/Blend/**glTF**, 92 models incl. "planets". Also Modular Train Pack, Ultimate Furniture Pack, Stylized Nature MegaKit. [pack page](https://quaternius.com/packs/ultimatespacekit.html), [quaternius.com](https://quaternius.com/)
- Poly Pizza: 10,700+ low-poly models, CC0 and CC-BY per model, `.glb` download; API returns a direct CDN `.glb` URL. [poly.pizza](https://poly.pizza/), [API docs](https://poly.pizza/docs/api/v1.1), [third-party summary](https://github.com/jasonkneen/tiny-world-builder/blob/main/.agents/skills/poly-pizza-api/SKILL.md)
- Fonts, licence per `google/fonts` METADATA.pb: JetBrains Mono **OFL**, IBM Plex Mono **OFL**, VT323 **OFL**, Fredoka **OFL**, Baloo 2 **OFL**, Lilita One **OFL**, Chewy **Apache 2.0** (lives in `apache/chewy`). [ofl/](https://github.com/google/fonts/tree/main/ofl), [apache/chewy](https://github.com/google/fonts/tree/main/apache/chewy). Departure Mono: **MIT** (Helena Zhang & Tobias Fried). [repo](https://github.com/rektdeckard/departure-mono)

### C.6 Nuxt 4 specifics
- `<ClientOnly>`: renders default slot only in the browser; `#fallback` slot and `placeholderTag`/`fallbackTag`; default-slot content is tree-shaken from the server build. [docs](https://nuxt.com/docs/4.x/api/components/client-only)
- `.client.vue` suffix: component "rendered only after being mounted"; use `await nextTick()` inside `onMounted` to touch its DOM. `Lazy` prefix = dynamic import chunk; delayed hydration via `hydrate-on-visible`, `hydrate-on-idle`, `hydrate-never`, `hydrate-after`, `hydrate-when`. With `ssr:false` the hydration props are moot but `Lazy` still splits the chunk. [components](https://nuxt.com/docs/4.x/guide/directory-structure/app/components)
- `useHead({ link: [{ rel:'preconnect', href:'https://fonts.gstatic.com' }, { rel:'stylesheet', href:'https://fonts.googleapis.com/css2?family=...' }] })` is per-page and accepts refs/computed, so the vibe store can swap the font link reactively. [use-head](https://nuxt.com/docs/4.x/api/composables/use-head)
- Repo today: `app/pages/index.vue`, `app/pages/about/`, `app/components/*.vue`, Pinia stores in `app/stores/`, `compatibilityDate: '2026-08-16'`, `typescript.strict: false` (`/private/var/www/html/personal/qdjr/nuxt.config.ts`).

## D. Recommended minimal stack

| Layer | Choice | Gzip est. | Why |
|---|---|---|---|
| 3D | `three@^0.186` imported dynamically in `app/components/scene/ProfileScene.client.vue` | ~120-185 kB chunk, only on `/` and `/about` | Every reference site is vanilla three; full control of dispose/DPR; no peer churn. [bundlephobia](https://bundlephobia.com/api/size?package=three@0.186.1) |
| Vibe modules | `app/components/scene/vibes/{terminal,vintage,galaxy}.ts` exporting `{ build, update, dispose }` | in the same chunk, or `import()` per vibe | One renderer/loop/camera, swap scene graph + fonts + Tailwind theme class |
| Vibe state | existing Pinia store + `useHead` for the per-vibe Google Fonts link, `data-vibe` attribute on `<html>` for Tailwind v4 theme variables | 0 | Already in the repo |
| Text | Tailwind HTML overlay (fixed canvas z-0, content z-10) | 0 | train-diorama, Bruno Simon, Singularity pattern |
| Scroll (/about) | native scroll + progress ref; Lenis `lenis@^1.3` optional | 0 / +5.5 kB | Singularity does the whole journey with Lenis + three, no GSAP |
| Reveal | IntersectionObserver or CSS `animation-timeline: view()` with `@supports` | 0 | 87 % native support, degrades to visible |
| Post FX (galaxy only) | `three/addons/postprocessing` UnrealBloomPass | ~15 kB | Official addon tracks the three version |
| Reduced motion | `matchMedia('(prefers-reduced-motion: reduce)')` -> static frame, no autoplay camera | 0 | Baseline |
| Mobile | cap `pixelRatio` at 1.5-2, offer the train-diorama "resolution" fallback, render on demand when idle | 0 | three.js manual guidance |
| Remove | `@tsparticles/slim`, `@tsparticles/vue3` once galaxy starfield replaces them | negative | Dedupe particle engines |

Do not add: TresJS (+38 kB core, +203 kB cientos), GSAP (+27 kB, add only if pin/snap required), `postprocessing` npm (version-locked below 0.187).

## E. Open questions

1. Is the vibe switch per-session (localStorage) or per-visit random? Affects whether all three vibe chunks preload.
2. Should `/about` share the `/` canvas (persistent layout, camera flies between pages) or own a second scene? Shared = one WebGL context, needs a layout-level `.client.vue`.
3. Galaxy planet count target (10 hero planets with GLTF vs 200 instanced spheres) decides whether GLTFLoader + Draco (~30 kB more) is needed.
4. Terminal vibe: fake typed terminal in HTML (cheap, accessible) vs CRT texture on a 3D monitor (Heffernan style, needs CanvasTexture or CSS3DRenderer)?
5. Mobile budget: is a static poster fallback acceptable below a GPU/FPS threshold, like train-diorama's 360p mode?
6. Cientos component list could not be verified from the docs (404 to fetch); irrelevant if TresJS is skipped.
7. Awwwards sites not opened (Sean Currlin, Guillaume Zhu, G. Colombel, Austensor) may still hold a better terminal reference; Henry Heffernan is dated 2022 (three r137).

Browser tabs left open in BrowserOS group `claude-code/threejs-ui-research`: train-diorama, landing.love, awwwards, docs.tresjs.org, bruno-simon.com, henryheffernan.com, stars.chromeexperiments.com, threejs manual, singularity.engl.design, agrumeafarm.it, astrodither.
