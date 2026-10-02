import * as THREE from 'three'
import type {JourneyStation} from '~/data/journeyStations'
import {BUILDERS} from './buildings'
import type {Kit} from './kit'
import {sideAt} from './track'

// Calibration knobs: how far platform and building sit from the track centre.
const PLATFORM_OFFSET = 1.25
const BUILDING_OFFSET = 3.4
const LAMP_ALONG = 1.1
const SIGN_ALONG = -1.1

export interface StationAnchor {
  u: number
  platform: THREE.Vector3
  building: THREE.Vector3
  /** Ground-plane unit vector from the track towards the building (island-inward). */
  inward: THREE.Vector3
}

/** Stations sit at even arc-length spacing, half a gap in from the loop seam. */
export const stationU = (index: number, count: number) => (index + 0.5) / count

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

export function buildStations(
  kit: Kit,
  curve: THREE.CatmullRomCurve3,
  list: readonly JourneyStation[],
  loadAssets: boolean
): {group: THREE.Group; anchors: StationAnchor[]} {
  const group = new THREE.Group()
  group.name = 'stations'

  const anchors = list.map((station, i) => {
    const u = stationU(i, list.length)
    const p = curve.getPointAt(u)
    const t = curve.getTangentAt(u)
    const inward = sideAt(curve, u)
    if (inward.dot(new THREE.Vector3(-p.x, 0, -p.z)) < 0) inward.negate()
    const along = Math.atan2(t.x, t.z)
    const facingTrack = Math.atan2(-inward.x, -inward.z)

    const platformAt = p.clone().addScaledVector(inward, PLATFORM_OFFSET).setY(0)
    const buildingAt = p.clone().addScaledVector(inward, BUILDING_OFFSET).setY(0)

    const platform = kit.mesh(new THREE.BoxGeometry(0.9, 0.22, 2.6), kit.material(kit.colors.platform))
    platform.position.copy(platformAt).setY(0.11)
    platform.rotation.y = along
    platform.name = `platform-${i}`

    const building = BUILDERS[station.kind](kit, station, loadAssets)
    building.position.copy(buildingAt)
    building.rotation.y = facingTrack
    building.name = `station-${i}`

    group.add(
      platform,
      building,
      lamp(kit, platformAt.clone().addScaledVector(t, LAMP_ALONG)),
      sign(kit, String(i).padStart(2, '0'), platformAt.clone().addScaledVector(t, SIGN_ALONG), facingTrack, loadAssets)
    )
    return {u, platform: platformAt, building: buildingAt, inward}
  })

  return {group, anchors}
}
