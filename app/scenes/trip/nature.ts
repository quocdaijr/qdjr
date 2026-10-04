import * as THREE from 'three'
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js'
import {faceted, type Kit} from '../cartoon/kit'
import {SEA_LEVEL, type Terrain} from './terrain'

// What grows on the board, chosen by where it stands: pines on the highlands
// (Da Lat's pine forests), coconut palms along the coast, round broadleaf
// trees on the plains and hills, rice paddies on flat lowland beside the
// road, bare rocks on steep mountainsides, and fishing boats bobbing offshore.
// A city board (a trip across town) is mostly buildings: blocks of every
// height on the land, a few trees for parks, no paddies.

const COUNTS = {
  high: {trees: 650, rocks: 90, paddies: 150, boats: 8},
  low: {trees: 260, rocks: 40, paddies: 60, boats: 4}
}
const ZONE = {pineAbove: 850, palmBelow: 25, paddyAbove: 2, paddyBelow: 120, rockAbove: 150} // metres
const SLOPE = {rock: 0.9, paddy: 0.25} // height change per unit
const CLEAR = {road: 2.2, tree: 0.8, paddyFrom: 2.4, paddyTo: 9, boatFromRoad: 3}
const BOB = {height: 0.06, speed: 1.6}
const CITY = {blocks: {high: 520, low: 200}, treeShare: 0.3, gap: 0.95, width: [0.55, 1] as const, height: [0.5, 2.6] as const, clearRoad: 1.5}

export interface Nature {
  group: THREE.Group
  update(elapsed: number): void
}

interface Spot {
  x: number
  y: number
  z: number
  turn: number
  size: number
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, spots: Spot[], tints?: readonly number[]): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, spots.length))
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const c = new THREE.Color()
  mesh.count = spots.length
  spots.forEach((s, i) => {
    q.setFromAxisAngle(up, s.turn)
    mesh.setMatrixAt(i, m.compose(new THREE.Vector3(s.x, s.y, s.z), q, new THREE.Vector3(s.size, s.size, s.size)))
    if (tints) mesh.setColorAt(i, c.setHex(tints[i % tints.length]))
  })
  return mesh
}

const at = (geometry: THREE.BufferGeometry, x: number, y: number, z: number) => geometry.translate(x, y, z)

function pines(kit: Kit, spots: Spot[]): THREE.Object3D[] {
  const trunk = at(new THREE.CylinderGeometry(0.06, 0.09, 0.5, 5), 0, 0.25, 0)
  const crown = faceted(mergeGeometries([at(new THREE.ConeGeometry(0.42, 1, 6), 0, 0.85, 0), at(new THREE.ConeGeometry(0.32, 0.8, 6), 0, 1.35, 0)]))
  return [instanced(trunk, kit.material(kit.colors.trunk), spots), instanced(crown, kit.swayMaterial(kit.colors.leafDark, 0.35, 1.4), spots)]
}

function broadleaf(kit: Kit, spots: Spot[]): THREE.Object3D[] {
  const trunk = at(new THREE.CylinderGeometry(0.07, 0.1, 0.55, 5), 0, 0.27, 0)
  const crown = faceted(mergeGeometries([at(new THREE.IcosahedronGeometry(0.5, 0), 0, 0.9, 0), at(new THREE.IcosahedronGeometry(0.34, 0), 0.25, 1.15, 0.1)]))
  return [
    instanced(trunk, kit.material(kit.colors.trunk), spots),
    instanced(crown, kit.swayMaterial(0xffffff, 0.4, 1.1), spots, [kit.colors.leaf, kit.colors.grass, kit.colors.leafDark])
  ]
}

function palms(kit: Kit, spots: Spot[]): THREE.Object3D[] {
  const trunk = at(new THREE.CylinderGeometry(0.05, 0.08, 1.4, 5), 0, 0.7, 0)
  const fronds = mergeGeometries(
    Array.from({length: 6}, (_, k) => {
      const frond = new THREE.BoxGeometry(0.7, 0.03, 0.16)
      frond.translate(0.35, 0, 0)
      frond.rotateZ(-0.45) // drooping
      frond.rotateY((k / 6) * Math.PI * 2)
      return frond.translate(0, 1.42, 0)
    })
  )
  return [instanced(trunk, kit.material(kit.colors.trunk), spots), instanced(faceted(fronds), kit.swayMaterial(kit.colors.leaf, 1.2, 0.4), spots)]
}

function boats(kit: Kit, spots: Spot[]): THREE.Group[] {
  return spots.map((s) => {
    const hull = kit.mesh(new THREE.BoxGeometry(0.9, 0.18, 0.34), kit.material(kit.colors.accent))
    hull.position.y = 0.09
    const sail = kit.mesh(new THREE.ConeGeometry(0.22, 0.6, 3), kit.material(kit.colors.wall))
    sail.position.set(0.05, 0.48, 0)
    const boat = new THREE.Group()
    boat.add(hull, sail)
    boat.position.set(s.x, SEA_LEVEL, s.z)
    boat.rotation.y = s.turn
    boat.name = 'boat'
    return boat
  })
}

/** City blocks: boxes of varied footprint and height, tinted in the town palette. */
function blocks(kit: Kit, terrain: Terrain, area: {width: number; depth: number}, taken: (x: number, z: number) => boolean, count: number): THREE.InstancedMesh {
  const placed: {x: number; z: number}[] = []
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), kit.material(0xffffff), count)
  const tints = [kit.colors.wall, kit.colors.platform, kit.colors.stone, kit.colors.roof, kit.colors.wall]
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const up = new THREE.Vector3(0, 1, 0)
  const c = new THREE.Color()
  const between = ([a, b]: readonly [number, number]) => a + kit.random() * (b - a)
  for (let i = 0; i < count * 6 && placed.length < count; i++) {
    const x = (kit.random() - 0.5) * (area.width - 1)
    const z = (kit.random() - 0.5) * (area.depth - 1)
    if (terrain.isWater(x, z) || terrain.roadDistance(x, z) < CITY.clearRoad || taken(x, z) || placed.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < CITY.gap ** 2)) continue
    const w = between(CITY.width)
    q.setFromAxisAngle(up, kit.random() * Math.PI)
    mesh.setMatrixAt(placed.length, m.compose(new THREE.Vector3(x, terrain.heightAt(x, z), z), q, new THREE.Vector3(w, between(CITY.height), w)))
    mesh.setColorAt(placed.length, c.setHex(tints[placed.length % tints.length]))
    placed.push({x, z})
  }
  mesh.count = placed.length
  mesh.name = 'city-blocks'
  return mesh
}

export function buildNature(kit: Kit, terrain: Terrain, area: {width: number; depth: number}, scale: number, taken: (x: number, z: number) => boolean, detail: 'high' | 'low', urban = false): Nature {
  const base = COUNTS[detail]
  const counts = urban ? {...base, trees: Math.round(base.trees * CITY.treeShare), paddies: 0} : base
  const zones = {pine: [] as Spot[], broadleaf: [] as Spot[], palm: [] as Spot[], rock: [] as Spot[], paddy: [] as Spot[], boat: [] as Spot[]}
  const trees: Spot[] = []
  const tries = (counts.trees + counts.rocks + counts.paddies) * 5
  for (let i = 0; i < tries; i++) {
    const x = (kit.random() - 0.5) * (area.width - 1)
    const z = (kit.random() - 0.5) * (area.depth - 1)
    const road = terrain.roadDistance(x, z)
    const spot: Spot = {x, y: 0, z, turn: kit.random() * Math.PI * 2, size: 0.75 + kit.random() * 0.55}
    if (terrain.isWater(x, z)) {
      if (zones.boat.length < counts.boats && road > CLEAR.boatFromRoad && terrain.heightAt(x, z) < SEA_LEVEL - 0.15) zones.boat.push(spot)
      continue
    }
    if (road < CLEAR.road || taken(x, z)) continue
    const h = terrain.heightAt(x, z)
    spot.y = h
    const metres = h / scale
    const slope = Math.hypot(terrain.heightAt(x + 0.5, z) - terrain.heightAt(x - 0.5, z), terrain.heightAt(x, z + 0.5) - terrain.heightAt(x, z - 0.5))
    if (slope > SLOPE.rock && metres > ZONE.rockAbove) {
      if (zones.rock.length < counts.rocks) zones.rock.push(spot)
      continue
    }
    if (metres > ZONE.paddyAbove && metres < ZONE.paddyBelow && !terrain.coastal(x, z) && slope < SLOPE.paddy && road > CLEAR.paddyFrom && road < CLEAR.paddyTo && zones.paddy.length < counts.paddies) {
      zones.paddy.push(spot)
      continue
    }
    if (trees.length >= counts.trees || trees.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < CLEAR.tree ** 2)) continue
    trees.push(spot)
    if (metres > ZONE.pineAbove) zones.pine.push(spot)
    else if (terrain.coastal(x, z) && metres < ZONE.palmBelow) zones.palm.push(spot)
    else zones.broadleaf.push(spot)
  }

  const group = new THREE.Group()
  group.name = 'nature'
  if (urban) group.add(blocks(kit, terrain, area, taken, CITY.blocks[detail]))
  group.add(...pines(kit, zones.pine), ...broadleaf(kit, zones.broadleaf), ...palms(kit, zones.palm))
  group.add(instanced(new THREE.DodecahedronGeometry(0.35, 0), kit.material(kit.colors.stone), zones.rock))
  const paddy = instanced(new THREE.BoxGeometry(1.1, 0.04, 0.75), kit.material(0xffffff), zones.paddy, [kit.colors.paddy, kit.colors.grass, kit.colors.paddy, kit.colors.leaf])
  paddy.name = 'paddies'
  group.add(paddy)
  const fleet = boats(kit, zones.boat)
  if (fleet.length) group.add(...fleet) // no sea on the board, no boats; add() with nothing logs an error
  return {
    group,
    update(elapsed) {
      fleet.forEach((b, i) => {
        b.position.y = SEA_LEVEL + Math.sin(elapsed * BOB.speed + i) * BOB.height
        b.rotation.z = Math.sin(elapsed * BOB.speed * 0.8 + i) * 0.06
      })
    }
  }
}
