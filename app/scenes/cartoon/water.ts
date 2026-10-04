import * as THREE from 'three'
import type {Kit} from './kit'
import {LAKE, RIVER, RIVER_HALF_WIDTH} from './layout'

// The island's water: a lake inside the loop with a sandy shore and ducks,
// the river running out of it under the bridge with glints drifting down
// it, and a waterfall pouring off the island's edge into the open sky.

const Y = {water: 0.035, bank: 0.018} // just above the meadow, so nothing z-fights
const BANK = 0.45 // sandy margin round the lake and along the river
const LAKE_POINTS = 48
const RIVER_STEPS = 80
const GLINTS = {high: 26, low: 10, speed: 0.6, size: 0.13}
const FALL = {width: 1.6, height: 10, drops: {high: 40, low: 16}, speed: 4.5}
const DUCKS = {count: 3, orbit: 0.55, speed: 0.12}

export interface Water {
  group: THREE.Group
  update(dt: number, elapsed: number): void
}

/** The lake's outline: an ellipse with a gentle wobble, so it reads as a pond, not a disc. */
function lakeShape(grow: number): THREE.Shape {
  const points = Array.from({length: LAKE_POINTS}, (_, i) => {
    const a = (i / LAKE_POINTS) * Math.PI * 2
    const wobble = 1 + Math.sin(a * 3 + 0.7) * 0.06 + Math.sin(a * 5) * 0.03
    // Shape y maps to −z once the shape is laid flat (rotateX −90°).
    return new THREE.Vector2(LAKE.x + Math.cos(a) * (LAKE.rx + grow) * wobble, -(LAKE.z + Math.sin(a) * (LAKE.rz + grow) * wobble))
  })
  return new THREE.Shape(points)
}

function flat(shape: THREE.Shape, y: number, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = y
  return mesh
}

function ribbon(curve: THREE.Curve<THREE.Vector3>, half: number, y: number, material: THREE.Material): THREE.Mesh {
  const positions: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= RIVER_STEPS; i++) {
    const u = i / RIVER_STEPS
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    const sx = -t.z
    const sz = t.x
    positions.push(p.x + sx * half, y, p.z + sz * half, p.x - sx * half, y, p.z - sz * half)
    if (i > 0) indices.push((i - 1) * 2, (i - 1) * 2 + 1, i * 2, (i - 1) * 2 + 1, i * 2 + 1, i * 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, material)
}

function duck(kit: Kit): THREE.Group {
  const body = kit.mesh(new THREE.SphereGeometry(0.16, 8, 6), kit.material(kit.colors.wall))
  body.scale.set(1.3, 0.8, 1)
  const head = kit.mesh(new THREE.SphereGeometry(0.09, 8, 6), kit.material(kit.colors.leafDark))
  head.position.set(0.16, 0.13, 0)
  const beak = kit.mesh(new THREE.ConeGeometry(0.035, 0.1, 4), kit.material(kit.colors.glow))
  beak.rotation.z = -Math.PI / 2
  beak.position.set(0.27, 0.12, 0)
  const g = new THREE.Group()
  g.add(body, head, beak)
  g.name = 'duck'
  return g
}

export function buildWater(kit: Kit, detail: 'high' | 'low'): Water {
  const group = new THREE.Group()
  group.name = 'water'
  const water = kit.material(kit.colors.water, THREE.DoubleSide)
  const sand = kit.material(kit.colors.platform, THREE.DoubleSide)
  const course = new THREE.CatmullRomCurve3(RIVER.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal')
  group.add(flat(lakeShape(BANK), Y.bank, sand), flat(lakeShape(0), Y.water, water), ribbon(course, RIVER_HALF_WIDTH + BANK, Y.bank, sand), ribbon(course, RIVER_HALF_WIDTH, Y.water, water))

  // Glints drifting downstream: small flat diamonds, each at its own place along the river.
  const glintCount = GLINTS[detail]
  const glints = new THREE.InstancedMesh(new THREE.PlaneGeometry(GLINTS.size, GLINTS.size * 0.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: kit.colors.cloud, transparent: true, opacity: kit.isDark ? 0.35 : 0.8}), glintCount)
  glints.name = 'glints'
  const glintState = Array.from({length: glintCount}, (_, i) => ({u: i / glintCount, across: (kit.random() - 0.5) * RIVER_HALF_WIDTH * 1.4}))

  // The waterfall: a sheet down the cliff face, and drops falling with it into the sky.
  const edge = course.getPointAt(1)
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(FALL.width, FALL.height), new THREE.MeshToonMaterial({color: kit.colors.water, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false}))
  sheet.rotation.y = Math.PI / 2
  sheet.position.set(edge.x + 0.05, -FALL.height / 2 + Y.water, edge.z)
  sheet.name = 'waterfall'
  const dropCount = FALL.drops[detail]
  const drops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshBasicMaterial({color: kit.colors.cloud, transparent: true, opacity: 0.85}), dropCount)
  const dropState = Array.from({length: dropCount}, (_, i) => ({fall: (i / dropCount) * FALL.height, along: (kit.random() - 0.5) * FALL.width, out: 0.1 + kit.random() * 0.5}))

  const ducks = Array.from({length: DUCKS.count}, (_, i) => ({model: duck(kit), phase: (i / DUCKS.count) * Math.PI * 2}))
  group.add(glints, sheet, drops, ...ducks.map((d) => d.model))

  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const one = new THREE.Vector3(1, 1, 1)
  const at = new THREE.Vector3()
  const place = (elapsed: number, dt: number) => {
    glintState.forEach((g, i) => {
      g.u = (g.u + (dt * GLINTS.speed) / course.getLength()) % 1
      const p = course.getPointAt(g.u)
      const t = course.getTangentAt(g.u)
      q.setFromAxisAngle(up, Math.atan2(-t.z, t.x))
      glints.setMatrixAt(i, m.compose(at.set(p.x - t.z * g.across, Y.water + 0.01, p.z + t.x * g.across), q, one))
    })
    glints.instanceMatrix.needsUpdate = true
    dropState.forEach((d, i) => {
      d.fall = (d.fall + dt * FALL.speed) % FALL.height
      drops.setMatrixAt(i, m.compose(at.set(edge.x + d.out + d.fall * 0.04, Y.water - d.fall, edge.z + d.along), q.identity(), one))
    })
    drops.instanceMatrix.needsUpdate = true
    // Ducks paddle slow loops round the middle of the lake, each bobbing a little.
    ducks.forEach((d) => {
      const a = d.phase + elapsed * DUCKS.speed
      d.model.position.set(LAKE.x + Math.cos(a) * LAKE.rx * DUCKS.orbit, Y.water + 0.05 + Math.sin(elapsed * 2 + d.phase) * 0.02, LAKE.z + Math.sin(a) * LAKE.rz * DUCKS.orbit)
      d.model.rotation.y = -a - Math.PI / 2 // facing along the loop
    })
  }
  place(0, 0)
  return {group, update: (dt, elapsed) => place(elapsed, dt)}
}
