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
