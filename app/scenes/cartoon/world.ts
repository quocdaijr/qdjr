import * as THREE from 'three'
import {faceted, type Kit} from './kit'
import type {StationAnchor} from './stations'
import type {Track} from './track'

const ISLAND = {width: 40, depth: 32, radius: 7, thickness: 2.4}
const EDGE_MARGIN = 1.2
const POND = {x: -1, z: 1.5, radius: 2.4}
const WINDMILL = {x: -6.5, z: -1.5}
const BALLOON = {x: 13, y: 7, z: -8}
const COUNTS = {high: {trees: 90, flowers: 160, rocks: 26}, low: {trees: 40, flowers: 60, rocks: 12}}
const CLEAR = {track: 1.8, building: 2.6, platform: 1.6}
const CLOUDS: ReadonlyArray<readonly [number, number, number]> = [
  [-20, 10, -10], [-9, 12, 6], [2, 9, -14], [12, 11, 8], [22, 10, -4], [-2, 13, 14], [16, 12, -16]
]
const CLOUD_SPEED = 0.6
const CLOUD_WRAP = 30
const BLADE_SPEED = 0.9

export interface World {
  group: THREE.Group
  update(dt: number, elapsed: number): void
}

type IsFree = (x: number, z: number, margin: number) => boolean

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** Grass top with cliff sides, floating on an inverted rock. */
function island(kit: Kit): THREE.Group {
  const geometry = new THREE.ExtrudeGeometry(roundedRect(ISLAND.width, ISLAND.depth, ISLAND.radius), {
    depth: ISLAND.thickness,
    bevelEnabled: false,
    curveSegments: 6
  })
  geometry.rotateX(-Math.PI / 2) // extrusion now runs up +y; shape y maps to −z
  const top = new THREE.Mesh(geometry, [kit.material(kit.colors.grass), kit.material(kit.colors.cliff)])
  top.position.y = -ISLAND.thickness
  const under = kit.mesh(new THREE.CylinderGeometry(ISLAND.width * 0.42, 3, 9, 8), kit.material(kit.colors.ground))
  under.scale.z = ISLAND.depth / ISLAND.width
  under.position.y = -ISLAND.thickness - 4.5
  const g = new THREE.Group()
  g.add(top, under)
  return g
}

function insideIsland(x: number, z: number, margin: number): boolean {
  const r = ISLAND.radius
  const cx = THREE.MathUtils.clamp(x, -ISLAND.width / 2 + r, ISLAND.width / 2 - r)
  const cz = THREE.MathUtils.clamp(z, -ISLAND.depth / 2 + r, ISLAND.depth / 2 - r)
  return (x - cx) ** 2 + (z - cz) ** 2 <= (r - margin) ** 2
}

function freeSpace(track: Track, anchors: StationAnchor[]): IsFree {
  const blocked = [
    ...anchors.flatMap((a) => [{p: a.building, r: CLEAR.building}, {p: a.platform, r: CLEAR.platform}]),
    {p: new THREE.Vector3(POND.x, 0, POND.z), r: POND.radius + 0.8},
    {p: new THREE.Vector3(WINDMILL.x, 0, WINDMILL.z), r: 1.8}
  ]
  return (x, z, margin) => {
    if (!insideIsland(x, z, EDGE_MARGIN + margin)) return false
    const near = (p: THREE.Vector3, r: number) => (p.x - x) ** 2 + (p.z - z) ** 2 < (r + margin) ** 2
    return !track.samples.some((s) => near(s, CLEAR.track)) && !blocked.some((b) => near(b.p, b.r))
  }
}

function scatter(kit: Kit, count: number, isFree: IsFree, margin: number, gap: number): THREE.Vector2[] {
  const out: THREE.Vector2[] = []
  for (let i = 0; i < count * 14 && out.length < count; i++) {
    const x = (kit.random() - 0.5) * ISLAND.width
    const z = (kit.random() - 0.5) * ISLAND.depth
    if (isFree(x, z, margin) && out.every((o) => (o.x - x) ** 2 + (o.y - z) ** 2 > gap * gap)) out.push(new THREE.Vector2(x, z))
  }
  return out
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh {
  return new THREE.InstancedMesh(geometry, material, Math.max(1, count))
}

function forest(kit: Kit, spots: THREE.Vector2[]): THREE.Group {
  const trunks = instanced(faceted(new THREE.CylinderGeometry(0.12, 0.16, 0.6, 5)), kit.material(kit.colors.trunk), spots.length)
  const crowns = [kit.colors.leaf, kit.colors.leafDark].map((c) =>
    instanced(faceted(new THREE.ConeGeometry(0.62, 1.4, 6)), kit.material(c), spots.length)
  )
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0)
  spots.forEach((spot, i) => {
    const size = 0.75 + kit.random() * 0.6
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), kit.random() * Math.PI)
    s.setScalar(size)
    trunks.setMatrixAt(i, m.compose(new THREE.Vector3(spot.x, 0.3 * size, spot.y), q, s))
    const pick = i % 2
    crowns[pick].setMatrixAt(i, m.compose(new THREE.Vector3(spot.x, 1.25 * size, spot.y), q, s))
    crowns[1 - pick].setMatrixAt(i, hidden)
  })
  const g = new THREE.Group()
  g.add(trunks, ...crowns)
  return g
}

function scatterMesh(kit: Kit, geometry: THREE.BufferGeometry, color: number, spots: THREE.Vector2[], y: number, tint?: readonly number[]): THREE.InstancedMesh {
  const mesh = instanced(faceted(geometry), kit.material(tint ? 0xffffff : color), spots.length)
  const m = new THREE.Matrix4()
  const c = new THREE.Color()
  spots.forEach((spot, i) => {
    const size = 0.7 + kit.random() * 0.6
    mesh.setMatrixAt(i, m.makeScale(size, size, size).setPosition(spot.x, y * size, spot.y))
    if (tint) mesh.setColorAt(i, c.setHex(tint[i % tint.length]))
  })
  return mesh
}

function windmill(kit: Kit): {group: THREE.Group; blades: THREE.Group} {
  const {wall, roof, trunk} = kit.colors
  const tower = kit.mesh(new THREE.ConeGeometry(0.65, 2.6, 6), kit.material(wall))
  tower.position.y = 1.3
  const cap = kit.mesh(new THREE.ConeGeometry(0.55, 0.6, 6), kit.material(roof))
  cap.position.y = 2.85
  const blades = new THREE.Group()
  for (let k = 0; k < 4; k++) {
    const blade = kit.mesh(new THREE.BoxGeometry(0.16, 1.4, 0.04), kit.material(trunk))
    blade.position.y = 0.7
    const arm = new THREE.Group()
    arm.rotation.z = (k * Math.PI) / 2
    arm.add(blade)
    blades.add(arm)
  }
  blades.position.set(0, 2.4, 0.62)
  const group = new THREE.Group()
  group.add(tower, cap, blades)
  group.position.set(WINDMILL.x, 0, WINDMILL.z)
  group.rotation.y = 0.6
  return {group, blades}
}

function cloud(kit: Kit, [x, y, z]: readonly [number, number, number]): THREE.Group {
  const g = new THREE.Group()
  for (const [px, py, r] of [[0, 0, 0.9], [0.95, 0.15, 0.7], [-0.9, -0.05, 0.65], [0.3, 0.45, 0.6]] as const) {
    const puff = kit.mesh(new THREE.SphereGeometry(r, 8, 6), kit.material(kit.colors.cloud))
    puff.position.set(px, py, 0)
    g.add(puff)
  }
  g.position.set(x, y, z)
  return g
}

function balloon(kit: Kit): THREE.Group {
  const envelope = kit.mesh(new THREE.SphereGeometry(0.9, 10, 8), kit.material(kit.colors.accent))
  envelope.scale.y = 1.15
  const band = kit.mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.25, 10), kit.material(kit.colors.wall))
  band.position.y = -0.45
  const basket = kit.mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), kit.material(kit.colors.trunk))
  basket.position.y = -1.35
  const g = new THREE.Group()
  g.add(envelope, band, basket)
  g.position.set(BALLOON.x, BALLOON.y, BALLOON.z)
  return g
}

export function buildWorld(kit: Kit, track: Track, anchors: StationAnchor[], detail: 'high' | 'low'): World {
  const counts = COUNTS[detail]
  const isFree = freeSpace(track, anchors)
  const pond = kit.mesh(new THREE.CylinderGeometry(POND.radius, POND.radius, 0.08, 12), kit.material(kit.colors.water))
  pond.position.set(POND.x, 0.02, POND.z)
  const mill = windmill(kit)
  const clouds = CLOUDS.map((spot) => cloud(kit, spot))
  const air = balloon(kit)

  const group = new THREE.Group()
  group.name = 'world'
  group.add(
    island(kit),
    forest(kit, scatter(kit, counts.trees, isFree, 0.4, 1.1)),
    scatterMesh(kit, new THREE.IcosahedronGeometry(0.09, 0), 0, scatter(kit, counts.flowers, isFree, 0, 0.35), 0.09, kit.colors.flowers),
    scatterMesh(kit, new THREE.DodecahedronGeometry(0.28, 0), kit.colors.stone, scatter(kit, counts.rocks, isFree, 0.2, 1), 0.12),
    pond,
    mill.group,
    air,
    ...clouds
  )

  return {
    group,
    update(dt, elapsed) {
      mill.blades.rotation.z += dt * BLADE_SPEED
      air.position.y = BALLOON.y + Math.sin(elapsed * 0.6) * 0.4
      for (const c of clouds) {
        c.position.x += dt * CLOUD_SPEED
        if (c.position.x > CLOUD_WRAP) c.position.x = -CLOUD_WRAP
      }
    }
  }
}
