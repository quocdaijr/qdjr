import * as THREE from 'three'
import type {Kit} from './kit'

// Petals drifting on the breeze by day; fireflies hovering over the meadow at
// night. Plain Points updated on the CPU: a few dozen particles at most.
const BOUNDS = {x: 20, yMin: 0.3, yMax: 6, z: 16}
const COUNTS = {high: {petals: 80, fireflies: 60}, low: {petals: 30, fireflies: 24}}
const PETAL = {size: 0.2, drift: 0.9, fall: 0.25, flutter: 0.35}
const FIREFLY = {size: 0.22, wander: 0.35, groups: 3, twinkle: 1.6}

export interface Particles {
  object: THREE.Object3D
  update(dt: number, elapsed: number): void
}

function seeded(kit: Kit, count: number): Float32Array {
  const p = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    p[i * 3] = (kit.random() * 2 - 1) * BOUNDS.x
    p[i * 3 + 1] = BOUNDS.yMin + kit.random() * (BOUNDS.yMax - BOUNDS.yMin)
    p[i * 3 + 2] = (kit.random() * 2 - 1) * BOUNDS.z
  }
  return p
}

function wrap(v: number, min: number, max: number): number {
  const span = max - min
  return v < min ? v + span : v > max ? v - span : v
}

function petals(kit: Kit, count: number): Particles {
  const positions = seeded(kit, count)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({color: kit.colors.petal, size: PETAL.size, transparent: true, opacity: 0.85, depthWrite: false})
  const points = new THREE.Points(geometry, material)
  points.name = 'petals'
  return {
    object: points,
    update(dt, elapsed) {
      if (dt === 0) return
      for (let i = 0; i < count; i++) {
        const k = i * 3
        positions[k] = wrap(positions[k] + dt * PETAL.drift, -BOUNDS.x, BOUNDS.x)
        positions[k + 1] = wrap(positions[k + 1] - dt * PETAL.fall + Math.sin(elapsed * 2 + i) * dt * PETAL.flutter, BOUNDS.yMin, BOUNDS.yMax)
        positions[k + 2] = wrap(positions[k + 2] + Math.cos(elapsed + i * 1.3) * dt * PETAL.flutter, -BOUNDS.z, BOUNDS.z)
      }
      geometry.attributes.position.needsUpdate = true
    }
  }
}

function fireflies(kit: Kit, count: number): Particles {
  const group = new THREE.Group()
  group.name = 'fireflies'
  // A few groups with their own material so they twinkle out of phase.
  const swarms = Array.from({length: FIREFLY.groups}, (_, g) => {
    const n = Math.ceil(count / FIREFLY.groups)
    const positions = seeded(kit, n).map((v, i) => (i % 3 === 1 ? BOUNDS.yMin + (v % 2) : v)) // keep them low
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: kit.colors.firefly,
      size: FIREFLY.size,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    group.add(new THREE.Points(geometry, material))
    return {positions, geometry, material, phase: (g / FIREFLY.groups) * Math.PI * 2}
  })
  return {
    object: group,
    update(dt, elapsed) {
      if (dt === 0) return
      for (const s of swarms) {
        s.material.opacity = 0.35 + 0.6 * (0.5 + 0.5 * Math.sin(elapsed * FIREFLY.twinkle + s.phase))
        for (let i = 0; i < s.positions.length; i += 3) {
          s.positions[i] = wrap(s.positions[i] + Math.sin(elapsed * 0.7 + i) * dt * FIREFLY.wander, -BOUNDS.x, BOUNDS.x)
          s.positions[i + 1] = THREE.MathUtils.clamp(s.positions[i + 1] + Math.cos(elapsed + i) * dt * FIREFLY.wander * 0.5, BOUNDS.yMin, 2.5)
          s.positions[i + 2] = wrap(s.positions[i + 2] + Math.cos(elapsed * 0.6 + i * 0.7) * dt * FIREFLY.wander, -BOUNDS.z, BOUNDS.z)
        }
        s.geometry.attributes.position.needsUpdate = true
      }
    }
  }
}

export function buildParticles(kit: Kit, detail: 'high' | 'low'): Particles {
  const counts = COUNTS[detail]
  return kit.isDark ? fireflies(kit, counts.fireflies) : petals(kit, counts.petals)
}
