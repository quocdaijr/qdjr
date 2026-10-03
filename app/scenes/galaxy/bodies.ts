import * as THREE from 'three'

// The solar system with one body per /about stop. Orbits are slow (the camera
// chases a body's live position) and seeded so the sky is the same on every
// visit.
export interface BodySpec {
  name: string
  radius: number
  distance: number
  speed: number // radians per second around the sun, before ORBIT_SLOWDOWN
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

/** Stop → body: Hello, What I do, the four career stages, Projects, Contact. */
export const STOP_BODIES = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'earth', 'neptune'] as const

export const SUN_RADIUS = 1.2
const ORBIT_SLOWDOWN = 0.15
const SPIN = 0.4
const CLOUD_SPIN = 0.15
const BELT = {count: 600, inner: 9.6, outer: 10.4, spin: 0.01}

export interface Bodies {
  group: THREE.Group
  sun: THREE.Mesh
  halo: THREE.Mesh
  earth: THREE.Mesh
  /** anchors[i] is the body for stop i, named galaxy-anchor-<i>. */
  anchors: THREE.Object3D[]
  radii: number[]
  update(dt: number): void
}

function planet(spec: BodySpec, orbitColor: number, random: () => number) {
  const pivot = new THREE.Object3D()
  pivot.rotation.x = spec.tilt
  pivot.rotation.y = random() * Math.PI * 2
  const body = new THREE.Mesh(new THREE.SphereGeometry(spec.radius, 32, 20), new THREE.MeshStandardMaterial({color: spec.color, roughness: 0.85, metalness: 0}))
  body.position.x = spec.distance
  pivot.add(body)
  if (spec.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(spec.radius * 1.4, spec.radius * 2.2, 64),
      new THREE.MeshBasicMaterial({color: spec.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide})
    )
    ring.rotation.x = Math.PI / 2.4
    body.add(ring)
  }
  let clouds: THREE.Mesh | null = null
  if (spec.clouds) {
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(spec.radius * 1.04, 32, 20),
      new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false})
    )
    body.add(clouds)
  }
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(spec.distance - 0.015, spec.distance + 0.015, 160),
    new THREE.MeshBasicMaterial({color: orbitColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false})
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

export function buildBodies(colors: {sun: number; orbit: number}, random: () => number): Bodies {
  const group = new THREE.Group()
  group.name = 'bodies'
  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 16), new THREE.MeshBasicMaterial({color: colors.sun}))
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.6, 32, 16),
    new THREE.MeshBasicMaterial({color: colors.sun, transparent: true, opacity: 0.22, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending})
  )
  const planets = BODIES.map((spec) => ({spec, ...planet(spec, colors.orbit, random)}))
  const rocks = belt(colors.orbit, random)
  group.add(sun, halo, rocks, ...planets.map((p) => p.pivot))

  const byName = new Map(planets.map((p) => [p.spec.name, p]))
  const anchors = STOP_BODIES.map((name, i) => {
    const o = name === 'sun' ? sun : byName.get(name)!.body
    o.name = `galaxy-anchor-${i}`
    o.userData.body = name
    return o
  })
  const radii = STOP_BODIES.map((name) => (name === 'sun' ? SUN_RADIUS : byName.get(name)!.spec.radius))

  return {
    group,
    sun,
    halo,
    earth: byName.get('earth')!.body,
    anchors,
    radii,
    update(dt) {
      for (const p of planets) {
        p.pivot.rotation.y += dt * p.speed * ORBIT_SLOWDOWN
        p.body.rotation.y += dt * SPIN
        if (p.clouds) p.clouds.rotation.y += dt * CLOUD_SPIN
      }
      rocks.rotation.y += dt * BELT.spin
    }
  }
}
