// Ground-plane rectangles for keeping station props off the track and off
// each other. `angle` is the object's rotation.y, so a rect matches the mesh
// it describes: local x maps to world (cos, −sin), local z to (sin, cos).

export interface Rect {
  x: number
  z: number
  angle: number
  hx: number
  hz: number
}

function toLocal(r: Rect, x: number, z: number): [number, number] {
  const dx = x - r.x
  const dz = z - r.z
  const c = Math.cos(r.angle)
  const s = Math.sin(r.angle)
  return [dx * c - dz * s, dx * s + dz * c]
}

/** Is (x, z) inside the rect grown by `margin` on every side? */
export function pointInRect(r: Rect, x: number, z: number, margin = 0): boolean {
  const [lx, lz] = toLocal(r, x, z)
  return Math.abs(lx) <= r.hx + margin && Math.abs(lz) <= r.hz + margin
}

function axes(r: Rect): Array<[number, number]> {
  const c = Math.cos(r.angle)
  const s = Math.sin(r.angle)
  return [[c, -s], [s, c]]
}

function radius(r: Rect, [ax, az]: [number, number]): number {
  const [[xx, xz], [zx, zz]] = axes(r)
  return r.hx * Math.abs(xx * ax + xz * az) + r.hz * Math.abs(zx * ax + zz * az)
}

/** Separating-axis test for two rotated rectangles. */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  const dx = b.x - a.x
  const dz = b.z - a.z
  return [...axes(a), ...axes(b)].every((axis) => Math.abs(dx * axis[0] + dz * axis[1]) < radius(a, axis) + radius(b, axis))
}

