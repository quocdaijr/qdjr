import * as THREE from 'three'
import {cloudMaterial, glowMaterial, ringMaterial, sunMaterial, surfaceMaterial, type SurfaceStyle} from './paint'

// The solar system with one body per /about stop, painted in a storybook
// style (paint.ts). Orbits are slow (the camera chases a body's live
// position) and seeded so the sky is the same on every visit.
export interface BodySpec {
  name: string
  radius: number
  distance: number
  speed: number // radians per second around the sun, before ORBIT_SLOWDOWN
  tilt: number
  surface: SurfaceStyle
  /** Atmosphere glow colour, if any. */
  atmosphere?: number
  clouds?: boolean
  ring?: {a: number; b: number}
}

export const BODIES: readonly BodySpec[] = [
  {name: 'mercury', radius: 0.28, distance: 3.2, speed: 0.5, tilt: 0.05, surface: {kind: 'rocky', colors: [0x8f8a86, 0x6e6a68, 0x4f4b49, 0xb8b2ad], seed: 1.3}},
  {name: 'venus', radius: 0.42, distance: 4.6, speed: 0.36, tilt: -0.08, surface: {kind: 'swirls', colors: [0xe0b464, 0xb8763a, 0, 0], seed: 2.1}},
  {
    name: 'earth', radius: 0.55, distance: 6.4, speed: 0.28, tilt: 0.04,
    surface: {kind: 'earth', colors: [0x1f5fbf, 0x3fa3e0, 0x4caf50, 0xd9c27a], seed: 4.7},
    atmosphere: 0x7cc4ff, clouds: true
  },
  {name: 'mars', radius: 0.36, distance: 8.2, speed: 0.22, tilt: 0.12, surface: {kind: 'mars', colors: [0xd2543a, 0x8e2a1c, 0, 0], seed: 3.3}},
  {name: 'jupiter', radius: 0.95, distance: 11.4, speed: 0.13, tilt: -0.04, surface: {kind: 'bands', colors: [0xd98b5a, 0xf0d2a8, 0xa5502e, 0xc0392b], seed: 5.9, spot: true}},
  {
    name: 'saturn', radius: 0.8, distance: 14.2, speed: 0.1, tilt: 0.1,
    surface: {kind: 'bands', colors: [0xb59ad6, 0xf2e3f5, 0x8a6cb5, 0], seed: 6.4},
    ring: {a: 0x9fc4f0, b: 0xe8dcf5}
  },
  {name: 'neptune', radius: 0.5, distance: 17, speed: 0.07, tilt: -0.14, surface: {kind: 'bands', colors: [0x2e6fd9, 0x6fb4ff, 0x1f4fa8, 0], seed: 7.8}, atmosphere: 0x8fd0ff}
]

/** Stop → body: Hello, What I do, the four career stages, Projects, Contact. */
export const STOP_BODIES = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'earth', 'neptune'] as const

export const SUN_RADIUS = 1.2
const ORBIT_SLOWDOWN = 0.15
const SPIN = 0.4
const BELT = {count: 600, inner: 9.6, outer: 10.4, spin: 0.01}
const CORONA = {scale: 2.2, strength: 0.9, power: 3}
const ATMOSPHERE = {scale: 1.14, strength: 0.9, power: 4}
const CLOUD_SCALE = 1.025
const RING = {inner: 1.35, outer: 2.3}

export interface BodyColors {
  sun: number
  flare: number
  orbit: number
  /** Light on a body's night side (0..1). */
  ambient: number
}

export interface Bodies {
  group: THREE.Group
  sun: THREE.Mesh
  earth: THREE.Mesh
  /** anchors[i] is the body for stop i, named galaxy-anchor-<i>. */
  anchors: THREE.Object3D[]
  radii: number[]
  update(dt: number): void
}

function shell(radius: number, material: THREE.Material, name: string): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), material)
  mesh.name = name
  return mesh
}

function planet(spec: BodySpec, colors: BodyColors, random: () => number) {
  const pivot = new THREE.Object3D()
  pivot.rotation.x = spec.tilt
  pivot.rotation.y = random() * Math.PI * 2
  const body = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 48, 32), surfaceMaterial(spec.surface, colors.ambient))
  body.position.x = spec.distance
  pivot.add(body)

  const clouds = spec.clouds ? cloudMaterial(spec.surface.seed, colors.ambient) : null
  if (clouds) body.add(shell(spec.radius * CLOUD_SCALE, clouds, `${spec.name}-clouds`))
  if (spec.atmosphere !== undefined) {
    body.add(shell(spec.radius * ATMOSPHERE.scale, glowMaterial(spec.atmosphere, ATMOSPHERE.strength, ATMOSPHERE.power), `${spec.name}-atmosphere`))
  }
  if (spec.ring) {
    const [inner, outer] = [spec.radius * RING.inner, spec.radius * RING.outer]
    const ring = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 96), ringMaterial(spec.ring.a, spec.ring.b, inner, outer))
    ring.name = `${spec.name}-ring`
    ring.rotation.x = Math.PI / 2.4
    body.add(ring)
  }
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(spec.distance - 0.02, spec.distance + 0.02, 192),
    new THREE.MeshBasicMaterial({color: colors.orbit, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false})
  )
  orbit.rotation.x = Math.PI / 2
  pivot.add(orbit)
  return {pivot, body, clouds, speed: spec.speed}
}

function belt(color: number, random: () => number): THREE.Points {
  const positions = new Float32Array(BELT.count * 3)
  for (let i = 0; i < BELT.count; i++) {
    const r = BELT.inner + random() * (BELT.outer - BELT.inner)
    const a = random() * Math.PI * 2
    positions.set([Math.cos(a) * r, (random() - 0.5) * 0.3, Math.sin(a) * r], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(geometry, new THREE.PointsMaterial({color, size: 0.12, transparent: true, opacity: 0.8, depthWrite: false}))
}

export function buildBodies(colors: BodyColors, random: () => number): Bodies {
  const group = new THREE.Group()
  group.name = 'bodies'
  const surface = sunMaterial(colors.sun, colors.flare)
  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 48, 32), surface)
  sun.add(shell(SUN_RADIUS * CORONA.scale, glowMaterial(colors.flare, CORONA.strength, CORONA.power), 'sun-corona'))
  const planets = BODIES.map((spec) => ({spec, ...planet(spec, colors, random)}))
  const rocks = belt(colors.orbit, random)
  group.add(sun, rocks, ...planets.map((p) => p.pivot))

  const byName = new Map(planets.map((p) => [p.spec.name, p]))
  const anchors = STOP_BODIES.map((name, i) => {
    const o = name === 'sun' ? sun : byName.get(name)!.body
    o.name = `galaxy-anchor-${i}`
    o.userData.body = name
    return o
  })
  const radii = STOP_BODIES.map((name) => (name === 'sun' ? SUN_RADIUS : byName.get(name)!.spec.radius))
  let time = 0

  return {
    group,
    sun,
    earth: byName.get('earth')!.body,
    anchors,
    radii,
    update(dt) {
      time += dt
      surface.uniforms.uTime.value = time
      for (const p of planets) {
        p.pivot.rotation.y += dt * p.speed * ORBIT_SLOWDOWN
        p.body.rotation.y += dt * SPIN
        if (p.clouds) p.clouds.uniforms.uTime.value = time
      }
      rocks.rotation.y += dt * BELT.spin
    }
  }
}
