import * as THREE from 'three'
import type {RoadSpan, TripPlace} from '~/data/trips'
import type {Kit} from '../cartoon/kit'
import {sideAt} from '../cartoon/track'
import {monoLabel} from '../labels'
import {buildNature} from './nature'
import {buildRoad} from './road'
import {buildTerrain, type Lake, type RoadSample} from './terrain'

// Everything on the board but the vehicle: terrain and water, the road, a
// town at every stop, a block of buildings along every town the road
// passes, a pin at every pass and sight, name labels, and what grows.

const MARGIN = 7 // board beyond the route's extent
const SAMPLE_STEP = 0.6 // road samples for the terrain, world units
const TOWN = {houses: 6, radius: 3.4, clear: 1.6, endClear: 2.6}
const CITY = {every: 0.8, near: 1.5, far: 3.4, height: [0.6, 1.9] as const, gaps: 0.35}
const PIN = {side: 2, height: 2.2, bob: 0.15}
const LABEL = {stop: 1, place: 0.7, rise: 3.4, apart: 7, stack: 1.6}
const CLEAR_TOWN = 4 // nothing grows this close to a town or a city block

export interface Scenery {
  group: THREE.Group
  /** Tunnel insides, for the driver's seat. */
  bores: THREE.Object3D[]
  /** Clickable towns and pins: the vehicle drives to the stop or place they stand for. */
  targets: {object: THREE.Object3D; kind: 'stop' | 'place'; index: number}[]
  update(elapsed: number): void
}

/** The real land under the board, in world units. */
export interface Land {
  ground(x: number, z: number): number
  coastal(x: number, z: number): boolean
  lakes: Lake[]
  /** World units per metre. */
  scale: number
  /** Most of the road runs through town (a city trip): paved ground, blocks of buildings, few trees, no paddies. */
  urban: boolean
}

export interface NamedAt {
  label: string
  at: number
}

function house(kit: Kit, roofColor: number, size: number): THREE.Group {
  const body = kit.mesh(new THREE.BoxGeometry(1, 0.8, 0.9), kit.material(kit.colors.wall))
  body.position.y = 0.4
  const roof = kit.mesh(new THREE.ConeGeometry(0.8, 0.6, 4), kit.material(roofColor))
  roof.rotation.y = Math.PI / 4
  roof.position.y = 1.1
  const pane = kit.mesh(new THREE.BoxGeometry(0.26, 0.26, 0.04), kit.windowMaterial())
  pane.position.set(0, 0.45, 0.46)
  const g = new THREE.Group()
  g.add(body, roof, pane)
  g.scale.setScalar(size)
  return g
}

function tower(kit: Kit, height: number, color: number): THREE.Group {
  const body = kit.mesh(new THREE.BoxGeometry(0.8, height, 0.8), kit.material(color))
  body.position.y = height / 2
  const band = kit.mesh(new THREE.BoxGeometry(0.82, height * 0.6, 0.3), kit.windowMaterial())
  band.position.set(0, height * 0.55, 0.26)
  const g = new THREE.Group()
  g.add(body, band)
  return g
}

function pin(kit: Kit): {group: THREE.Group; head: THREE.Group} {
  const pole = kit.mesh(new THREE.CylinderGeometry(0.05, 0.05, PIN.height, 6), kit.material(kit.colors.trunk))
  pole.position.y = PIN.height / 2
  const head = new THREE.Group()
  const flag = kit.mesh(new THREE.ConeGeometry(0.3, 0.55, 6), kit.material(kit.colors.accent))
  flag.rotation.z = Math.PI
  const knob = kit.mesh(new THREE.SphereGeometry(0.28, 10, 8), kit.material(kit.colors.accent))
  knob.position.y = 0.38
  head.add(flag, knob)
  head.position.y = PIN.height + 0.3
  const group = new THREE.Group()
  group.add(pole, head)
  return {group, head}
}

export function buildScenery(
  kit: Kit,
  curve: THREE.Curve<THREE.Vector3>,
  extent: {width: number; depth: number},
  spans: readonly RoadSpan[],
  stops: NamedAt[],
  places: readonly (NamedAt & {kind: TripPlace['kind']})[],
  land: Land,
  detail: 'high' | 'low'
): Scenery {
  const group = new THREE.Group()
  group.name = 'trip-board'
  const length = curve.getLength()
  const count = Math.ceil(length / SAMPLE_STEP)
  const inSpan = (kind: RoadSpan['kind'], u: number) => spans.some((s) => s.kind === kind && u >= s.from && u <= s.to)
  const samples: RoadSample[] = Array.from({length: count + 1}, (_, i) => {
    const p = curve.getPointAt(i / count)
    return {x: p.x, z: p.z, y: p.y, tunnel: inSpan('tunnel', i / count)}
  })

  const passes = places.filter((p) => p.kind === 'pass').map((p) => p.at)
  const road = buildRoad(kit, curve, spans, passes)
  const size = {width: extent.width + MARGIN * 2, depth: extent.depth + MARGIN * 2}
  const terrain = buildTerrain(kit, {samples, rivers: road.rivers, lakes: land.lakes, size, ground: land.ground, coastal: land.coastal, urban: land.urban}, land.scale, detail)
  group.add(terrain.mesh, road.group)
  const targets: Scenery['targets'] = []

  const side = new THREE.Vector3()
  const occupied: THREE.Vector2[] = [] // town and city footprints, kept clear of trees
  // Labels close together stack upwards instead of overprinting each other.
  const signs: THREE.Vector3[] = []
  const sign = (text: string, height: number, at: THREE.Vector3) => {
    const sprite = monoLabel(text, kit.isDark ? '#f3ead3' : '#3f2a1f', height)
    if (!sprite) return
    const near = signs.filter((o) => Math.hypot(o.x - at.x, o.z - at.z) < LABEL.apart)
    let y = at.y
    for (const o of near) y = Math.max(y, o.y + LABEL.stack)
    sprite.position.copy(at).setY(y)
    sprite.renderOrder = 10 // after the transparent sea and lakes, which would otherwise veil it
    signs.push(sprite.position)
    group.add(sprite)
  }

  // Beyond each end of the road stays open: the driver's seat looks straight there.
  const ends = [curve.getPointAt(0).addScaledVector(curve.getTangentAt(0), -TOWN.endClear), curve.getPointAt(1).addScaledVector(curve.getTangentAt(1), TOWN.endClear)]
  const beyondEnd = (x: number, z: number) => ends.some((e) => Math.hypot(e.x - x, e.z - z) < TOWN.endClear)
  stops.forEach((stop, i) => {
    const centre = curve.getPointAt(stop.at)
    const town = new THREE.Group()
    town.name = `town-${i}`
    for (let k = 0, placed = 0; k < 50 && placed < TOWN.houses; k++) {
      const angle = kit.random() * Math.PI * 2
      const r = TOWN.clear + kit.random() * (TOWN.radius - TOWN.clear)
      const x = centre.x + Math.cos(angle) * r
      const z = centre.z + Math.sin(angle) * r
      if (terrain.roadDistance(x, z) < TOWN.clear || terrain.isWater(x, z) || beyondEnd(x, z)) continue
      const h = house(kit, placed % 2 ? kit.colors.roof : kit.colors.accent, 0.8 + kit.random() * 0.5)
      h.position.set(x, terrain.heightAt(x, z), z)
      h.rotation.y = kit.random() * Math.PI * 2
      town.add(h)
      placed++
    }
    occupied.push(new THREE.Vector2(centre.x, centre.z))
    group.add(town)
    targets.push({object: town, kind: 'stop', index: i})
    sign(stop.label, LABEL.stop, centre.clone().setY(centre.y + LABEL.rise))
  })

  // Towns the road passes through: buildings lining both sides.
  const palette = [kit.colors.wall, kit.colors.platform, kit.colors.stone, kit.colors.roof]
  for (const span of spans.filter((s) => s.kind === 'city')) {
    const city = new THREE.Group()
    city.name = 'city'
    const steps = Math.max(1, Math.floor(((span.to - span.from) * length) / CITY.every))
    for (let i = 0; i <= steps; i++) {
      const u = span.from + ((span.to - span.from) * i) / steps
      const p = curve.getPointAt(u)
      sideAt(curve, u, side)
      for (const dir of [-1, 1]) {
        if (kit.random() < CITY.gaps) continue // gaps between buildings, not a wall
        const off = CITY.near + kit.random() * (CITY.far - CITY.near)
        const x = p.x + side.x * off * dir
        const z = p.z + side.z * off * dir
        if (terrain.roadDistance(x, z) < CITY.near - 0.2 || terrain.isWater(x, z)) continue
        const t = tower(kit, CITY.height[0] + kit.random() * (CITY.height[1] - CITY.height[0]), palette[(i + (dir > 0 ? 1 : 0)) % palette.length])
        t.position.set(x, terrain.heightAt(x, z), z)
        t.rotation.y = Math.atan2(side.x * dir, side.z * dir)
        city.add(t)
      }
      occupied.push(new THREE.Vector2(p.x, p.z))
    }
    group.add(city)
  }

  // Passes and sights get a pin beside the road; every place gets its name.
  const pins: THREE.Group[] = []
  places.forEach((place, i) => {
    const p = curve.getPointAt(place.at)
    if (place.kind === 'pass' || place.kind === 'sight') {
      const {group: marker, head} = pin(kit)
      const at = p.clone().addScaledVector(sideAt(curve, place.at, side), i % 2 ? PIN.side : -PIN.side)
      marker.position.set(at.x, terrain.heightAt(at.x, at.z), at.z)
      marker.name = `place-${i}`
      group.add(marker)
      targets.push({object: marker, kind: 'place', index: i})
      pins.push(head)
      sign(place.label, LABEL.place, new THREE.Vector3(at.x, marker.position.y + PIN.height + 1.2, at.z))
    } else {
      sign(place.label, LABEL.place, p.clone().setY(p.y + (place.kind === 'city' ? CITY.height[1] + 1 : 1.8)))
    }
  })

  const taken = (x: number, z: number) => occupied.some((o) => (o.x - x) ** 2 + (o.y - z) ** 2 < CLEAR_TOWN ** 2)
  const nature = buildNature(kit, terrain, size, land.scale, taken, detail, land.urban)
  group.add(nature.group)

  return {
    group,
    targets,
    bores: road.bores,
    update(elapsed) {
      pins.forEach((head, i) => (head.position.y = PIN.height + 0.3 + Math.sin(elapsed * 2 + i) * PIN.bob))
      nature.update(elapsed)
    }
  }
}
