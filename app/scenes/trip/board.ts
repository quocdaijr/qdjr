import * as THREE from 'three'

// Real coordinates onto the toy board: an equirectangular projection around
// the route's centre (fine at country scale), scaled so the longest side of
// the route spans `size` world units. North is −z, east is +x.

export const BOARD_SIZE = 60

export interface Board {
  /** The route on the board, at ground level. */
  points: THREE.Vector3[]
  project(lng: number, lat: number): THREE.Vector3
  /** Board x, z back to [lng, lat]. */
  unproject(x: number, z: number): [number, number]
  /** Extent of the route on the board. */
  width: number
  depth: number
}

export function fitBoard(route: readonly [number, number][], size = BOARD_SIZE): Board {
  const lngs = route.map((p) => p[0])
  const lats = route.map((p) => p[1])
  const [lngMin, lngMax, latMin, latMax] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)]
  const lng0 = (lngMin + lngMax) / 2
  const lat0 = (latMin + latMax) / 2
  const kx = Math.cos(THREE.MathUtils.degToRad(lat0))
  const spanX = (lngMax - lngMin) * kx
  const spanZ = latMax - latMin
  const scale = size / Math.max(spanX, spanZ, 1e-6)
  const project = (lng: number, lat: number) => new THREE.Vector3((lng - lng0) * kx * scale, 0, -(lat - lat0) * scale)
  const unproject = (x: number, z: number): [number, number] => [x / (kx * scale) + lng0, -z / scale + lat0]
  return {points: route.map(([lng, lat]) => project(lng, lat)), project, unproject, width: spanX * scale, depth: spanZ * scale}
}

/**
 * A moving average across the ground plane, ends kept: at board scale a
 * mountain road's hairpins are tighter than the road is wide and would fold
 * the ribbon over itself.
 */
export function smoothPath(points: readonly THREE.Vector3[], window: number): THREE.Vector3[] {
  const last = points.length - 1
  return points.map((p, i) => {
    if (i === 0 || i === last) return p.clone()
    const reach = Math.min(window, i, last - i)
    const sum = new THREE.Vector3()
    for (let k = i - reach; k <= i + reach; k++) sum.add(points[k])
    return sum.divideScalar(reach * 2 + 1).setY(p.y)
  })
}
