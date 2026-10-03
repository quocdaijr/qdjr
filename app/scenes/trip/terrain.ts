import * as THREE from 'three'
import type {Kit} from '../cartoon/kit'

// The ground of the trip board, from the real elevation grid: plains,
// plateaus and mountains where they really are, the seabed below a flat sea.
// A corridor along the road is levelled to the road (it never floats or
// sinks), a mound covers each tunnel, a meandering river runs under each
// bridge, and named lakes lie at their own level. The block is cut out of the
// world like a diorama, with earth walls round the edge.

export interface RoadSample {
  x: number
  z: number
  /** Road surface height. */
  y: number
  tunnel: boolean
}

/** A river where it passes under a bridge; it meanders away on both sides. */
export interface River {
  x: number
  z: number
  /** Unit direction it flows, across the road. */
  dx: number
  dz: number
  halfWidth: number
  /** Riverbed height. */
  bed: number
}

export interface Lake {
  /** Outline on the board, x and z. */
  ring: THREE.Vector2[]
  /** Water surface height. */
  level: number
}

export interface TerrainInput {
  samples: readonly RoadSample[]
  rivers: readonly River[]
  lakes: readonly Lake[]
  size: {width: number; depth: number}
  /** Ground height in world units at a board point (negative under the sea), before the road and water shape it. */
  ground(x: number, z: number): number
  /** Land near the sea (beaches). */
  coastal(x: number, z: number): boolean
  /** A city trip: paved ground rather than meadow. */
  urban: boolean
}

export interface Terrain {
  mesh: THREE.Group
  heightAt(x: number, z: number): number
  /** Distance from (x, z) to the road centre line. */
  roadDistance(x: number, z: number): number
  /** Sea, lake or river there. */
  isWater(x: number, z: number): boolean
  coastal(x: number, z: number): boolean
}

// The sea is where the elevation model reads below 0 m; land is floored a little above it (see index.ts).
export const SEA_LEVEL = 0
const LAND_MIN = 0.004 // the bumps never sink low land under the sea
const CELL = {high: 0.4, low: 0.75} // grid spacing, world units
const ROAD_CLEAR = 1.4 // flat shoulder either side of the road centre
const CORRIDOR = 3.5 // the road's level blends into the real ground over this distance
const TEXTURE = {base: 0.12, perUnit: 0.12} // small bumps, rougher on high ground
const TUNNEL = {cover: 2.3, reach: 3.4} // over the bore (road.ts), with earth to spare
const RIVER = {length: 18, bank: 1.1, wiggle: 1.4, wave: 0.35, water: 0.3, points: 28}
const LAKE_DEPTH = 0.3
// The elevation grid is a few km coarse: it loses the strip of land a coast road runs on. Keep land under and beside the road.
const SHORE = {keep: 2.5, fade: 4, above: 0.12}
const SINK = 0.15 // ground under the road surface, deep enough that a steep slope never pokes through
const SKIRT_DEPTH = 2.4
const STEEP = 0.35 // 1 − normal.y beyond which a slope shows bare rock
const URBAN_GREEN = 0.3 // a city's ground: paving with a little green

const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Rolling value noise in 0..1; deterministic, no texture. */
function bumps(x: number, z: number): number {
  const a = Math.sin(x * 0.61 + Math.cos(z * 0.47) * 1.3) * Math.cos(z * 0.53 - Math.sin(x * 0.43) * 1.1)
  const b = Math.sin(x * 1.37 + z * 0.97) * Math.cos(z * 1.21 - x * 0.79)
  return 0.5 + a * 0.35 + b * 0.15
}

/** The river's course: straight under the bridge, meandering further out. */
export function riverPath(r: River): THREE.Vector2[] {
  return Array.from({length: RIVER.points + 1}, (_, i) => {
    const t = (i / RIVER.points) * 2 - 1 // −1 … 1 along the flow
    const along = t * RIVER.length
    const wiggle = Math.sin(along * RIVER.wave + r.x) * RIVER.wiggle * Math.abs(t)
    return new THREE.Vector2(r.x + r.dx * along - r.dz * wiggle, r.z + r.dz * along + r.dx * wiggle)
  })
}

function segmentDistance(p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2): number {
  const abx = b.x - a.x
  const abz = b.y - a.y
  const t = THREE.MathUtils.clamp(((p.x - a.x) * abx + (p.y - a.y) * abz) / (abx * abx + abz * abz || 1), 0, 1)
  return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + abz * t))
}

function insideRing(x: number, z: number, ring: readonly THREE.Vector2[]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [a, b] = [ring[i], ring[j]]
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export function terrainShape({samples, rivers, lakes, ground}: Pick<TerrainInput, 'samples' | 'rivers' | 'lakes' | 'ground'>) {
  const courses = rivers.map((r) => ({river: r, path: riverPath(r)}))
  const p = new THREE.Vector2()
  const nearest = (x: number, z: number) => {
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < samples.length; i++) {
      const d = (samples[i].x - x) ** 2 + (samples[i].z - z) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return {sample: samples[best], d: Math.sqrt(bestD)}
  }
  const riverDistance = (x: number, z: number, path: THREE.Vector2[]) => {
    p.set(x, z)
    let d = Infinity
    for (let i = 1; i < path.length; i++) d = Math.min(d, segmentDistance(p, path[i - 1], path[i]))
    return d
  }
  const lakeAt = (x: number, z: number) => lakes.find((l) => insideRing(x, z, l.ring))

  const heightAt = (x: number, z: number) => {
    const raw = ground(x, z)
    let h = raw > SEA_LEVEL ? Math.max(LAND_MIN, raw + (bumps(x, z) - 0.5) * (TEXTURE.base + TEXTURE.perUnit * raw)) : raw
    const lake = lakeAt(x, z)
    if (lake) h = Math.min(h, lake.level - LAKE_DEPTH)
    const {sample, d} = nearest(x, z)
    if (h < SEA_LEVEL + SHORE.above) h = THREE.MathUtils.lerp(SEA_LEVEL + SHORE.above, h, smoothstep(SHORE.keep, SHORE.keep + SHORE.fade, d))
    h = THREE.MathUtils.lerp(sample.y - SINK, h, smoothstep(ROAD_CLEAR, ROAD_CLEAR + CORRIDOR, d))
    // On low land (Saigon is 1–5 m) the sunk shoulder would dip under the sea plane and flood the roadside.
    if (d < ROAD_CLEAR + CORRIDOR) h = Math.max(h, LAND_MIN)
    if (sample.tunnel) h = Math.max(h, sample.y + TUNNEL.cover * (1 - smoothstep(0, TUNNEL.reach, d)))
    for (const {river, path} of courses) {
      const across = riverDistance(x, z, path)
      if (across > river.halfWidth + RIVER.bank) continue
      h = THREE.MathUtils.lerp(h, Math.min(h, river.bed), 1 - smoothstep(river.halfWidth, river.halfWidth + RIVER.bank, across))
    }
    return h
  }
  const isWater = (x: number, z: number) =>
    heightAt(x, z) < SEA_LEVEL || !!lakeAt(x, z) || courses.some(({river, path}) => riverDistance(x, z, path) < river.halfWidth)
  return {heightAt, isWater, roadDistance: (x: number, z: number) => nearest(x, z).d, courses}
}

function waterMaterial(kit: Kit): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({color: kit.colors.water, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide})
}

/** Colour by height, slope and coast: sand by the sea, meadow, forest, dark highland, bare rock on steep ground. */
function shade(kit: Kit, h: number, slope: number, coast: boolean, urban: boolean, scale: number, target: THREE.Color): THREE.Color {
  const {grass, leaf, leafDark, stone, platform, ballast} = kit.colors
  const metres = h / scale
  if (h < SEA_LEVEL) return target.setHex(ballast)
  if (coast && metres < 8) return target.setHex(platform)
  if (urban && metres < 60) return target.setHex(stone).lerp(new THREE.Color(grass), URBAN_GREEN)
  if (metres < 60) target.setHex(grass)
  else if (metres < 400) target.setHex(grass).lerp(new THREE.Color(leaf), (metres - 60) / 340)
  else if (metres < 1100) target.setHex(leaf).lerp(new THREE.Color(leafDark), (metres - 400) / 700)
  else target.setHex(leafDark)
  return slope > STEEP ? target.lerp(new THREE.Color(stone), Math.min(1, (slope - STEEP) * 3)) : target
}

export function buildTerrain(kit: Kit, input: TerrainInput, scale: number, detail: 'high' | 'low'): Terrain {
  const {size} = input
  const shape = terrainShape(input)
  const cell = CELL[detail]
  const nx = Math.max(2, Math.round(size.width / cell))
  const nz = Math.max(2, Math.round(size.depth / cell))
  const geometry = new THREE.PlaneGeometry(size.width, size.depth, nx, nz)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.getAttribute('position') as THREE.BufferAttribute
  let hasSea = false
  for (let i = 0; i < position.count; i++) {
    const h = shape.heightAt(position.getX(i), position.getZ(i))
    hasSea ||= h < SEA_LEVEL
    position.setY(i, h)
  }
  geometry.computeVertexNormals()
  const normal = geometry.getAttribute('normal') as THREE.BufferAttribute
  const colors = new Float32Array(position.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < position.count; i++) {
    const [x, z] = [position.getX(i), position.getZ(i)]
    shade(kit, position.getY(i), 1 - normal.getY(i), input.coastal(x, z), input.urban, scale, c).toArray(colors, i * 3)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const groundMesh = new THREE.Mesh(geometry, kit.vertexColorMaterial())
  groundMesh.name = 'terrain'

  const mesh = new THREE.Group()
  mesh.add(groundMesh, skirt(kit, position, nx, nz))
  const water = waterMaterial(kit)
  if (hasSea) {
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(size.width, size.depth), water)
    sea.rotation.x = -Math.PI / 2
    sea.position.y = SEA_LEVEL
    sea.name = 'sea'
    mesh.add(sea)
  }
  for (const lake of input.lakes) {
    const outline = new THREE.Shape(lake.ring.map((v) => new THREE.Vector2(v.x, -v.y)))
    const surface = new THREE.Mesh(new THREE.ShapeGeometry(outline), water)
    surface.rotation.x = -Math.PI / 2
    surface.position.y = lake.level
    surface.name = 'lake'
    mesh.add(surface)
  }
  for (const {river, path} of shape.courses) mesh.add(riverRibbon(path, river, water))
  return {mesh, heightAt: shape.heightAt, roadDistance: shape.roadDistance, isWater: shape.isWater, coastal: input.coastal}
}

function riverRibbon(path: THREE.Vector2[], river: River, material: THREE.Material): THREE.Mesh {
  const positions: number[] = []
  const indices: number[] = []
  const y = river.bed + RIVER.water
  const w = river.halfWidth + 0.15
  path.forEach((pt, i) => {
    const prev = path[Math.max(0, i - 1)]
    const next = path[Math.min(path.length - 1, i + 1)]
    const dir = new THREE.Vector2(next.x - prev.x, next.y - prev.y).normalize()
    positions.push(pt.x - dir.y * w, y, pt.y + dir.x * w, pt.x + dir.y * w, y, pt.y - dir.x * w)
    if (i > 0) indices.push((i - 1) * 2, (i - 1) * 2 + 1, i * 2, (i - 1) * 2 + 1, i * 2 + 1, i * 2)
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'river'
  return mesh
}

/** Earth walls: one quad per border cell, from the ground edge (or the sea surface) down to the skirt depth. */
function skirt(kit: Kit, position: THREE.BufferAttribute, nx: number, nz: number): THREE.Group {
  const walls: number[] = []
  const at = (ix: number, iz: number) => iz * (nx + 1) + ix
  const ring = [
    ...Array.from({length: nx}, (_, i) => [at(i, 0), at(i + 1, 0)]),
    ...Array.from({length: nz}, (_, i) => [at(nx, i), at(nx, i + 1)]),
    ...Array.from({length: nx}, (_, i) => [at(nx - i, nz), at(nx - i - 1, nz)]),
    ...Array.from({length: nz}, (_, i) => [at(0, nz - i), at(0, nz - i - 1)])
  ]
  for (const [a, b] of ring) {
    const top = (i: number) => Math.max(SEA_LEVEL, position.getY(i))
    const [ax, ay, az, bx, by, bz] = [position.getX(a), top(a), position.getZ(a), position.getX(b), top(b), position.getZ(b)]
    walls.push(ax, ay, az, ax, -SKIRT_DEPTH, az, bx, by, bz, bx, by, bz, ax, -SKIRT_DEPTH, az, bx, -SKIRT_DEPTH, bz)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(walls, 3))
  geometry.computeVertexNormals()
  const wall = new THREE.Mesh(geometry, kit.material(kit.colors.cliff, THREE.DoubleSide))
  const width = Math.abs(position.getX(at(nx, 0)) - position.getX(at(0, 0)))
  const depth = Math.abs(position.getZ(at(0, nz)) - position.getZ(at(0, 0)))
  const under = kit.mesh(new THREE.CylinderGeometry(width * 0.4, 3, 9, 8), kit.material(kit.colors.ground))
  under.scale.z = depth / width
  under.position.y = -SKIRT_DEPTH - 4.5
  const g = new THREE.Group()
  g.add(wall, under)
  return g
}
