import * as THREE from 'three'
import type {Kit} from './kit'

// Life on and over the island: a flock of birds wheeling overhead by day
// (fireflies take over at night), and sheep grazing, now and then shuffling
// round to a new patch.

const BIRDS = {high: 9, low: 4, radius: [13, 21] as const, height: [6.5, 10] as const, speed: 0.16, flap: 7}
const SHEEP = {high: 5, low: 2, shuffle: 0.25}

export interface Fauna {
  /** The sheep, on the island. */
  group: THREE.Group
  /** The birds, wheeling beyond the island's edges: kept out of its framing. */
  air: THREE.Group
  update(dt: number, elapsed: number): void
}

function bird(kit: Kit): {group: THREE.Group; wings: THREE.Object3D[]} {
  const body = kit.mesh(new THREE.ConeGeometry(0.08, 0.36, 4), kit.material(kit.colors.trainDark))
  body.rotation.z = -Math.PI / 2
  const wings = [-1, 1].map((side) => {
    const pivot = new THREE.Group()
    const wing = kit.mesh(new THREE.BoxGeometry(0.16, 0.02, 0.42), kit.material(kit.colors.trainDark))
    wing.position.z = side * 0.21
    pivot.add(wing)
    pivot.userData.side = side
    return pivot
  })
  const group = new THREE.Group()
  group.add(body, ...wings)
  group.name = 'bird'
  return {group, wings}
}

function sheep(kit: Kit): THREE.Group {
  const body = kit.mesh(new THREE.IcosahedronGeometry(0.32, 0), kit.material(kit.colors.cloud))
  body.scale.set(1.25, 0.9, 0.9)
  body.position.y = 0.4
  const head = kit.mesh(new THREE.BoxGeometry(0.2, 0.2, 0.18), kit.material(kit.colors.trainDark))
  head.position.set(0.42, 0.42, 0)
  const legs = [-0.18, 0.18].flatMap((x) => [-0.12, 0.12].map((z) => {
    const leg = kit.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 4), kit.material(kit.colors.trainDark))
    leg.position.set(x, 0.11, z)
    return leg
  }))
  const g = new THREE.Group()
  g.add(body, head, ...legs)
  g.name = 'sheep'
  return g
}

export function buildFauna(kit: Kit, pastures: THREE.Vector2[], detail: 'high' | 'low'): Fauna {
  const group = new THREE.Group()
  group.name = 'fauna'
  const between = ([a, b]: readonly [number, number]) => a + kit.random() * (b - a)
  const flock = kit.isDark
    ? [] // night: the fireflies are the life in the air
    : Array.from({length: BIRDS[detail]}, () => ({...bird(kit), radius: between(BIRDS.radius), height: between(BIRDS.height), phase: kit.random() * Math.PI * 2, flap: kit.random() * Math.PI}))
  const herd = pastures.slice(0, SHEEP[detail]).map((at) => {
    const model = sheep(kit)
    model.position.set(at.x, 0, at.y)
    model.rotation.y = kit.random() * Math.PI * 2
    return {model, home: at, phase: kit.random() * Math.PI * 2}
  })
  const air = new THREE.Group()
  air.name = 'birds'
  // Object3D.add() with nothing to add logs an error: the flock is empty at night, the herd when no pasture is free.
  if (flock.length) air.add(...flock.map((b) => b.group))
  if (herd.length) group.add(...herd.map((s) => s.model))

  const update = (_dt: number, elapsed: number) => {
    for (const b of flock) {
      const a = b.phase + elapsed * BIRDS.speed
      b.group.position.set(Math.cos(a) * b.radius, b.height + Math.sin(elapsed * 0.7 + b.phase) * 0.4, Math.sin(a) * b.radius)
      b.group.rotation.y = -a - Math.PI / 2 // nose along the circle
      for (const w of b.wings) w.rotation.x = w.userData.side * Math.sin(elapsed * BIRDS.flap + b.flap) * 0.7
    }
    // Sheep: graze (head bob), and every so often turn and amble a step.
    for (const s of herd) {
      const t = elapsed * SHEEP.shuffle + s.phase
      s.model.position.set(s.home.x + Math.cos(t) * 0.4, 0, s.home.y + Math.sin(t) * 0.4)
      s.model.rotation.y = -t
      s.model.children[1]!.position.y = 0.42 - Math.max(0, Math.sin(elapsed * 1.3 + s.phase)) * 0.14
    }
  }
  update(0, 0)
  return {group, air, update}
}
