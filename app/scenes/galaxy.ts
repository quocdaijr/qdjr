import * as THREE from 'three'
import type {SceneFactory} from './types'

const PALETTE = {
  dark: {bg: 0x0a0920, sun: 0xffb347, star: 0xcfd3ff, orbit: 0x5a5c8a, starOpacity: 0.9, ambient: 0.22},
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
const SUN_INTENSITY_DARK = 420
const SUN_INTENSITY_LIGHT = 260
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
// Looking left of and below the sun pushes the system to the lower right of the
// viewport, clear of the left-biased hero text on /.
const LOOK_AT = new THREE.Vector3(-6, -1.5, 0)

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
