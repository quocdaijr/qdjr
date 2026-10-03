import * as THREE from 'three'
import type {RoadSpan} from '~/data/trips'
import type {DrawnSpan} from './spans'
import type {Kit} from '../cartoon/kit'
import {sideAt} from '../cartoon/track'
import type {River} from './terrain'

// The road itself, following the curve (which already carries the road's
// height): a grey ribbon with a dashed centre line, a wider darker
// expressway with a double line, bridges with railings and piers over their
// river, and stone portals at both ends of a tunnel.

const ROAD = {half: 0.6, color: 'stone'} as const
const MOTORWAY = {half: 0.95, lift: 0.012, lane: 0.16}
const DASH = {every: 1.2, length: 0.5}
const RAIL = {height: 0.28, post: 0.6}
const PIER_EVERY = 0.9 // world units
const RIVER_DROP = 1.4 // riverbed below the bridge deck
const PORTAL = {radius: 0.85, tube: 0.2}
const BORE = {radius: 1.15, lift: 0.5} // the tunnel's inside, seen from the driver's seat
const STEP = 0.4 // ribbon sample spacing, world units
const PASS = {reach: 3, every: 0.5, height: 0.3} // guard rail posts along a pass, either side of its name

export interface Road {
  group: THREE.Group
  rivers: River[]
  /** Tunnel insides: shown only from the driver's seat (from outside, their far wall peeks over the mound). */
  bores: THREE.Object3D[]
}

type Curve = THREE.Curve<THREE.Vector3>

function ribbon(curve: Curve, from: number, to: number, half: number, lift: number, material: THREE.Material): THREE.Mesh {
  const length = curve.getLength() * (to - from)
  const steps = Math.max(2, Math.ceil(length / STEP))
  const positions: number[] = []
  const indices: number[] = []
  const side = new THREE.Vector3()
  for (let i = 0; i <= steps; i++) {
    const u = from + ((to - from) * i) / steps
    const p = curve.getPointAt(u)
    sideAt(curve, u, side)
    positions.push(p.x + side.x * half, p.y + lift, p.z + side.z * half, p.x - side.x * half, p.y + lift, p.z - side.z * half)
  }
  for (let i = 0; i < steps; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, material)
}

/** Boxes laid along the curve between from and to, `offsets` across it. */
function along(curve: Curve, from: number, to: number, every: number, size: [number, number, number], offsets: number[], lift: number, material: THREE.Material): THREE.InstancedMesh {
  const length = curve.getLength() * (to - from)
  const count = Math.max(1, Math.floor(length / every))
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), material, count * offsets.length)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const one = new THREE.Vector3(1, 1, 1)
  const side = new THREE.Vector3()
  let k = 0
  for (let i = 0; i < count; i++) {
    const u = from + ((to - from) * (i + 0.5)) / count
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    sideAt(curve, u, side)
    q.setFromAxisAngle(up, Math.atan2(-t.z, t.x))
    for (const o of offsets) mesh.setMatrixAt(k++, m.compose(p.clone().addScaledVector(side, o).setY(p.y + lift), q, one))
  }
  return mesh
}

function bridge(kit: Kit, curve: Curve, span: DrawnSpan): {group: THREE.Group; river: River | null} {
  const group = new THREE.Group()
  group.name = 'bridge'
  const deck = curve.getPointAt(span.from).y
  const bed = deck - RIVER_DROP
  const rail = kit.material(kit.colors.wall)
  group.add(
    along(curve, span.from, span.to, 0.12, [0.14, 0.06, 0.06], [-ROAD.half - 0.05, ROAD.half + 0.05], RAIL.height, rail),
    along(curve, span.from, span.to, RAIL.post, [0.06, RAIL.height, 0.06], [-ROAD.half - 0.05, ROAD.half + 0.05], RAIL.height / 2, rail)
  )
  // Piers from the deck down into the riverbed.
  const pierHeight = RIVER_DROP + 0.2
  group.add(along(curve, span.from, span.to, PIER_EVERY, [0.22, pierHeight, ROAD.half * 1.6], [0], -pierHeight / 2, kit.material(kit.colors.stone)))
  // The river (drawn by the terrain) flows across the road under the middle of the bridge.
  const mid = (span.from + span.to) / 2
  const centre = curve.getPointAt(mid)
  const flow = sideAt(curve, mid, new THREE.Vector3())
  const halfWidth = Math.max(0.5, (curve.getLength() * (span.to - span.from)) / 2 - 0.3)
  return {group, river: span.river ? {x: centre.x, z: centre.z, dx: flow.x, dz: flow.z, halfWidth, bed} : null}
}

/** The tunnel's inside: a dark tube along the road, drawn from within only (the mound hides it from outside). */
function bore(kit: Kit, curve: Curve, span: RoadSpan): THREE.Mesh {
  const steps = Math.max(4, Math.ceil((curve.getLength() * (span.to - span.from)) / STEP))
  const points = Array.from({length: steps + 1}, (_, i) => curve.getPointAt(span.from + ((span.to - span.from) * i) / steps).add(new THREE.Vector3(0, BORE.lift, 0)))
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), steps, BORE.radius, 10), new THREE.MeshToonMaterial({color: kit.colors.cliff, side: THREE.BackSide}))
  tube.name = 'tunnel-bore'
  return tube
}

function portal(kit: Kit, curve: Curve, u: number): THREE.Mesh {
  const arch = kit.mesh(new THREE.TorusGeometry(PORTAL.radius, PORTAL.tube, 6, 12, Math.PI), kit.material(kit.colors.stone))
  const p = curve.getPointAt(u)
  const t = curve.getTangentAt(u)
  arch.position.copy(p)
  arch.rotation.y = Math.atan2(-t.z, t.x) + Math.PI / 2 // the arch faces along the road
  arch.name = 'tunnel-portal'
  return arch
}

function guardRails(kit: Kit, curve: Curve, at: number): THREE.Group {
  const reach = PASS.reach / curve.getLength()
  const [from, to] = [Math.max(0, at - reach), Math.min(1, at + reach)]
  const edge = [-ROAD.half - 0.12, ROAD.half + 0.12]
  const g = new THREE.Group()
  g.name = 'guard-rail'
  g.add(
    along(curve, from, to, PASS.every, [0.07, PASS.height * 0.55, 0.07], edge, PASS.height * 0.28, kit.material(kit.colors.wall)),
    along(curve, from, to, PASS.every, [0.075, PASS.height * 0.45, 0.075], edge, PASS.height * 0.78, kit.material(kit.colors.accent)),
    along(curve, from, to, 0.15, [0.17, 0.05, 0.03], edge, PASS.height * 0.7, kit.material(kit.colors.metal))
  )
  return g
}

/** `passes`: where each mountain pass is named along the road (0..1). */
export function buildRoad(kit: Kit, curve: Curve, spans: readonly DrawnSpan[], passes: readonly number[]): Road {
  const group = new THREE.Group()
  group.name = 'road'
  const length = curve.getLength()
  const white = kit.material(kit.colors.wall)
  group.add(
    ribbon(curve, 0, 1, ROAD.half, 0, kit.material(kit.colors[ROAD.color], THREE.DoubleSide)),
    along(curve, 0, 1, DASH.every, [DASH.length, 0.02, 0.07], [0], 0.012, white)
  )
  const rivers: River[] = []
  const bores: THREE.Object3D[] = []
  for (const s of spans) {
    if (s.kind === 'motorway') {
      group.add(
        ribbon(curve, s.from, s.to, MOTORWAY.half, MOTORWAY.lift, kit.material(kit.colors.rail, THREE.DoubleSide)),
        along(curve, s.from, s.to, DASH.every * 0.8, [DASH.length, 0.02, 0.06], [-MOTORWAY.lane, MOTORWAY.lane], MOTORWAY.lift + 0.012, white)
      )
    } else if (s.kind === 'bridge') {
      const b = bridge(kit, curve, s)
      group.add(b.group)
      if (b.river) rivers.push(b.river)
    } else if (s.kind === 'tunnel' && (s.to - s.from) * length > 0.5) {
      const inside = bore(kit, curve, s)
      inside.visible = false
      bores.push(inside)
      group.add(portal(kit, curve, s.from), portal(kit, curve, s.to), inside)
    }
  }
  for (const at of passes) group.add(guardRails(kit, curve, at))
  return {group, rivers, bores}
}
