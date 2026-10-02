import * as THREE from 'three'
import type {JourneyStation} from '~/data/journeyStations'
import {BUILDERS} from './buildings'
import type {Rect} from './footprint'
import type {Kit} from './kit'
import {sideAt, type Track} from './track'

// Calibration knobs: how far platform and building sit from the track centre.
const PLATFORM_OFFSET = 1.5
const BUILDING_OFFSET = 3.7
const LAMP_ALONG = 1.1
const SIGN_ALONG = -1.1

export interface StationAnchor {
  u: number
  platform: THREE.Vector3
  building: THREE.Vector3
  /** Ground-plane unit vector from the track towards the building (island-inward). */
  side: THREE.Vector3
  /** Billboard centres of the project yard, in project order (empty for other stations). */
  targets: THREE.Vector3[]
}

// Calibration knob: shifts every station along the loop (in station gaps) so
// the wide project yard lands on a straight; test/scenes.spec.ts pins the fit.
const STATION_PHASE = 0.25

/** Stations sit at even arc-length spacing, STATION_PHASE gaps in from the loop seam. */
export const stationU = (index: number, count: number) => (index + STATION_PHASE) / count

function numberSign(label: string, loadAssets: boolean): THREE.Material | null {
  if (!loadAssets || typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#fbf4e2'
  ctx.fillRect(0, 0, 128, 64)
  ctx.fillStyle = '#3f2a1f'
  ctx.font = 'bold 40px Fraunces, Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 64, 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshBasicMaterial({map: texture, toneMapped: false})
}

function lamp(kit: Kit, at: THREE.Vector3): THREE.Group {
  const pole = kit.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 5), kit.material(kit.colors.metal))
  pole.position.y = 0.87
  const bulb = kit.mesh(new THREE.SphereGeometry(0.1, 6, 4), kit.glowMaterial())
  bulb.position.y = 1.56
  const g = new THREE.Group()
  g.add(pole, bulb)
  g.position.copy(at)
  return g
}

function sign(kit: Kit, label: string, at: THREE.Vector3, facing: number, loadAssets: boolean): THREE.Group {
  const pole = kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 5), kit.material(kit.colors.metal))
  pole.position.y = 0.72
  const face = numberSign(label, loadAssets) ?? kit.material(kit.colors.wall)
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), face)
  board.position.y = 1.3
  const g = new THREE.Group()
  g.add(pole, board)
  g.position.copy(at)
  g.rotation.y = facing
  return g
}

export interface Footprint {
  station: number
  label: 'platform' | 'building'
  rect: Rect
}

const PLATFORM_SIZE = {width: 0.9, length: 2.6}

/** The building's ground footprint, measured from its own meshes (origin at its base centre). */
function buildingRect(building: THREE.Object3D, at: THREE.Vector3, angle: number): Rect {
  building.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(building, true)
  const centre = box.getCenter(new THREE.Vector3())
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return {
    x: at.x + centre.x * c + centre.z * s,
    z: at.z - centre.x * s + centre.z * c,
    angle,
    hx: (box.max.x - box.min.x) / 2,
    hz: (box.max.z - box.min.z) / 2
  }
}

interface Placement {
  platformAt: THREE.Vector3
  buildingAt: THREE.Vector3
  facing: number
  rects: [Rect, Rect]
}

function placeOn(curve: THREE.CatmullRomCurve3, u: number, side: THREE.Vector3, building: THREE.Object3D): Placement {
  const p = curve.getPointAt(u)
  const t = curve.getTangentAt(u)
  const platformAt = p.clone().addScaledVector(side, PLATFORM_OFFSET).setY(0)
  const buildingAt = p.clone().addScaledVector(side, BUILDING_OFFSET).setY(0)
  const facing = Math.atan2(-side.x, -side.z)
  const platform: Rect = {x: platformAt.x, z: platformAt.z, angle: Math.atan2(t.x, t.z), hx: PLATFORM_SIZE.width / 2, hz: PLATFORM_SIZE.length / 2}
  return {platformAt, buildingAt, facing, rects: [platform, buildingRect(building, buildingAt, facing)]}
}

export function buildStations(
  kit: Kit,
  track: Track,
  list: readonly JourneyStation[],
  loadAssets: boolean
): {group: THREE.Group; anchors: StationAnchor[]; footprints: Footprint[]} {
  const group = new THREE.Group()
  group.name = 'stations'

  const footprints: Footprint[] = []
  const anchors = list.map((station, i) => {
    const u = stationU(i, list.length)
    const t = track.curve.getTangentAt(u)
    const building = BUILDERS[station.kind](kit, station, loadAssets)
    const p = track.curve.getPointAt(u)
    const side = sideAt(track.curve, u)
    if (side.dot(new THREE.Vector3(-p.x, 0, -p.z)) < 0) side.negate() // island-inward
    const {platformAt, buildingAt, facing, rects} = placeOn(track.curve, u, side, building)
    footprints.push({station: i, label: 'platform', rect: rects[0]}, {station: i, label: 'building', rect: rects[1]})

    const platform = kit.mesh(new THREE.BoxGeometry(PLATFORM_SIZE.width, 0.22, PLATFORM_SIZE.length), kit.material(kit.colors.platform))
    platform.position.copy(platformAt).setY(0.11)
    platform.rotation.y = rects[0].angle
    platform.name = `platform-${i}`

    building.position.copy(buildingAt)
    building.rotation.y = facing
    building.name = `station-${i}`

    group.add(
      platform,
      building,
      lamp(kit, platformAt.clone().addScaledVector(t, LAMP_ALONG)),
      sign(kit, String(i).padStart(2, '0'), platformAt.clone().addScaledVector(t, SIGN_ALONG), facing, loadAssets)
    )
    building.updateMatrixWorld(true)
    const targets = building.children
      .filter((child) => child.name.startsWith('billboard-'))
      .map((board) => board.getWorldPosition(new THREE.Vector3()).setY(board.userData.boardHeight as number))
    return {u, platform: platformAt, building: buildingAt, side, targets}
  })

  return {group, anchors, footprints}
}
