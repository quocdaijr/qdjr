<template>
  <canvas ref="canvas" class="vibe-scene" aria-hidden="true"></canvas>
  <!-- Hover name for clickable scene objects; the rail and picker are the accessible controls. -->
  <div
    v-if="hover.label"
    class="scene-tip font-mono"
    aria-hidden="true"
    :style="{transform: `translate(${hover.x + TIP_OFFSET}px, ${hover.y + TIP_OFFSET}px)`}"
  >{{ hover.label }}</div>
  <SceneViewControls :moved="orbit.moved.value" @zoom="orbit.zoom" @reset="orbit.reset"/>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import {createCartoonScene} from '~/scenes/cartoon'
import {createGalaxyScene} from '~/scenes/galaxy'
import {createFrameWatch, readDeviceTier, TIER_SETTINGS, type DeviceTier} from '~/scenes/deviceTier'
import {disposeScene} from '~/scenes/dispose'
import {resolveAction, shouldHandleClick} from '~/scenes/picking'
import {applyView} from '~/scenes/viewControl'
import {createTerminalScene} from '~/scenes/terminal'
import {createTripScene} from '~/scenes/trip'
import {findTrip} from '~/data/trips'
import {approach, type SceneAction, type SceneFactory, type ScenePointer, type VibeScene} from '~/scenes/types'
import type {Vibe} from '~/stores/theme'

const FACTORIES: Record<Vibe, SceneFactory> = {
  terminal: createTerminalScene,
  cartoon: createCartoonScene,
  galaxy: createGalaxyScene
}

const MAX_DT = 0.1 // seconds; a backgrounded tab resumes without a time jump
const PROGRESS_SMOOTHING = 3
const MAX_PIXEL_RATIO_FINE = 2
const MAX_PIXEL_RATIO_COARSE = 1.5 // phones: fill-rate bound, and nobody sees the difference
const TIP_OFFSET = 14 // px from the pointer

const canvas = ref<HTMLCanvasElement | null>(null)
const store = useThemeStore()
const journey = useJourneyProgress()
const journeyStop = useJourneyStop()
const journeyFocus = useJourneyFocus()
const sceneAction = useSceneAction()
const labels = useJourneyLabels()
const content = useProfile()
const {t} = useI18n()
const hover = reactive({label: '', x: 0, y: 0})
const raycaster = new THREE.Raycaster()
const ndc = new THREE.Vector2()
let hoverQueued: PointerEvent | null = null
const orbit = useSceneOrbit()
const activeTrip = useActiveTrip()
const tripProgress = useTripProgress()
const tripControl = useTripControl()

let renderer: THREE.WebGLRenderer | null = null
let active: VibeScene | null = null
let resizeObserver: ResizeObserver | null = null
let rafId = 0
let lastFrame = 0
let elapsed = 0
let progress = 0
let reduceMotion = false
let detail: 'high' | 'low' = 'high'
const pointer: ScenePointer = {x: 0, y: 0} // held still: no mouse-follow sway
const PIXEL_RATIO_CAP: Record<DeviceTier, number> = {high: MAX_PIXEL_RATIO_FINE, low: MAX_PIXEL_RATIO_COARSE, minimal: 1}
let watchFrames: ((dt: number) => boolean) | null = null

/** The device can't hold 20 fps: drop the pixel ratio first, then the scene detail. */
function downgrade() {
  if (!renderer) return
  if (renderer.getPixelRatio() > 1) {
    renderer.setPixelRatio(1)
    return
  }
  // ponytail: one way down, never back up; add re-upgrading if slow spells turn out to be transient.
  watchFrames = null
  if (detail === 'high') {
    detail = 'low'
    buildScene()
  }
}

function aspectOf(el: HTMLCanvasElement): number {
  return el.clientWidth / Math.max(1, el.clientHeight)
}

function renderFrame(dt: number) {
  if (!renderer || !active) return
  active.update(dt, elapsed, progress, pointer, journeyStop.value, journeyFocus.value)
  applyView(active.camera, orbit.view.value) // the reader's drag / zoom on top of the scene's shot
  renderer.render(active.scene, active.camera)
}

function buildScene() {
  if (!renderer || !canvas.value) return
  if (active) {
    disposeScene(active.scene)
    renderer.renderLists.dispose()
  }
  // A trip page swaps the vibe scene for its road trip (always the cartoon board).
  const wanted = activeTrip.value
  const trip = wanted && findTrip(wanted.slug)
  const factory = trip
    ? createTripScene({trip, vehicle: wanted.vehicle, locale: wanted.locale, control: () => tripControl.value, onProgress: (p) => (tripProgress.value = p)})
    : FACTORIES[store.vibe]
  active = factory({isDark: store.isDarkMode, aspect: aspectOf(canvas.value), reduceMotion, detail, stopLabels: labels.value})
  elapsed = 0
  progress = journey.value // a vibe change jumps to the current stop instead of easing from 0
  renderFrame(0)
}

function tick(now: number) {
  const dt = Math.min(MAX_DT, Math.max(0, (now - lastFrame) / 1000))
  if (watchFrames?.(dt)) downgrade()
  lastFrame = now
  elapsed += dt
  progress = approach(progress, journey.value, dt, PROGRESS_SMOOTHING)
  renderFrame(dt)
  if (hoverQueued) {
    showHover(hoverQueued)
    hoverQueued = null
  }
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

/** The action under a screen point, if any. */
function actionAt(clientX: number, clientY: number): SceneAction | null {
  if (!active) return null
  ndc.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, active.camera)
  const hit = raycaster.intersectObjects(active.pickables, true)[0]
  return hit ? resolveAction(hit.object) : null
}

function labelFor(action: SceneAction): string {
  if (action.type === 'stop') return labels.value[action.stop] ?? ''
  if (action.type === 'project') return content.value.projects[action.project]?.alt ?? ''
  if (action.type === 'trip') return action.label
  return t(`scene.fun.${action.id}`)
}

function onClick(event: MouseEvent) {
  if (orbit.takeDragClick() || !shouldHandleClick(event.target as Element)) return
  const action = actionAt(event.clientX, event.clientY)
  if (!action) return
  if (action.type === 'trip') tripControl.value = {...tripControl.value, target: action.mark}
  else if (action.type === 'fun') active?.play(action.id, elapsed)
  else sceneAction.value = {action, at: performance.now()}
}

function showHover(event: PointerEvent) {
  const action = shouldHandleClick(event.target as Element) ? actionAt(event.clientX, event.clientY) : null
  hover.label = action ? labelFor(action) : ''
  hover.x = event.clientX
  hover.y = event.clientY
  document.documentElement.style.cursor = action ? 'pointer' : ''
}

// The scene no longer follows the mouse (the reader drags to look around);
// pointer moves only drive the hover names.
function onPointerMove(event: PointerEvent) {
  hoverQueued = event // raycast at most once per frame, from the loop
}

onMounted(() => {
  if (!canvas.value) return
  const tier = readDeviceTier()
  const settings = TIER_SETTINGS[tier]
  // The minimal tier reuses the reduced-motion path: one frame per state change.
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !settings.animate
  detail = settings.detail
  const pixelRatio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP[tier])

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      antialias: settings.antialias && pixelRatio <= 1.5,
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
  watchFrames = createFrameWatch()

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.value)
  resize()
  buildScene()

  window.addEventListener('click', onClick)
  if (import.meta.dev) {
    // e2e hook: where an object of the live scene is on screen (dev builds only).
    ;(window as unknown as {__qdjrScene?: unknown}).__qdjrScene = {
      screenPointOf(name: string) {
        const o = active?.scene.getObjectByName(name)
        if (!o || !active) return null
        // The centre of what is drawn (a billboard's origin is at the foot of its posts).
        const p = new THREE.Box3().setFromObject(o, true).getCenter(new THREE.Vector3()).project(active.camera)
        return {x: ((p.x + 1) / 2) * window.innerWidth, y: ((1 - p.y) / 2) * window.innerHeight, behind: p.z > 1}
      },
      actionAt,
      cameraPosition: () => active?.camera.position.toArray() ?? null
    }
  }
  if (reduceMotion) {
    // One frame per state change and no sway, but hover names still show.
    window.addEventListener('pointermove', showHover, {passive: true})
    return
  }
  window.addEventListener('pointermove', onPointerMove, {passive: true})
  lastFrame = performance.now()
  rafId = requestAnimationFrame(tick)
})

watch(() => [store.vibe, store.isDarkMode, labels.value, activeTrip.value?.slug, activeTrip.value?.vehicle, activeTrip.value?.locale] as const, buildScene)

watch(orbit.view, () => {
  if (reduceMotion) renderFrame(0)
})

// A picked place or a view switch on a trip page: without a frame loop, draw it once.
watch(tripControl, () => {
  if (reduceMotion) renderFrame(0)
}, {deep: true})

watch([journey, journeyStop, journeyFocus], ([value]) => {
  if (!reduceMotion) return
  progress = value
  renderFrame(0)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointermove', showHover)
  window.removeEventListener('click', onClick)
  document.documentElement.style.cursor = ''
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
</style>
