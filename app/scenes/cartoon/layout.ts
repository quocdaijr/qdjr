// Where the island's landscape sits (island spans x −20..20, z −16..16; the
// track loops at about x ±16, z ±12.5; station buildings stand 3.7 inside it).
// One place for it, because the track (the bridge), the world (keep props
// off the water and the hills) and the water itself all need the same map;
// test/cartoonLayout.spec.ts checks it stays clear of the track and stations.

/** The lake inside the loop: an ellipse, wobbled a little at the edges. */
export const LAKE = {x: 3, z: 1.2, rx: 4.2, rz: 2.7} as const

/** The river: out of the lake's east shore, under the bridge, over the island's edge (x = 20). */
export const RIVER: ReadonlyArray<readonly [number, number]> = [
  [6.8, 1.0], [9, 0.4], [11.5, 0.6], [13.8, 1.2], [16, 1.1], [18.2, 1.0], [20.2, 1.0]
]
export const RIVER_HALF_WIDTH = 0.85

/** Where the track crosses the river (normalised arc length); the bridge spans it and the ballast stops. */
export const BRIDGE_U = {from: 0.452, to: 0.49} as const

/** Rounded green hills, rock on top. */
export const HILLS: ReadonlyArray<{x: number; z: number; r: number; h: number}> = [
  {x: -6, z: 4.8, r: 2.6, h: 2.4},
  {x: 3.6, z: -4.9, r: 2.2, h: 1.8}
]

/** Village cottages with smoking chimneys, and the way each faces. */
export const COTTAGES: ReadonlyArray<{x: number; z: number; turn: number}> = [
  {x: 9, z: 4.4, turn: 2.6},
  {x: 9.6, z: -2.6, turn: -0.4},
  {x: -9.2, z: 0.6, turn: 1.2},
  {x: -2.4, z: 6.6, turn: 3.4}
]

/** Distance from (x, z) to the river's centre line. */
export function riverDistance(x: number, z: number): number {
  let best = Infinity
  for (let i = 1; i < RIVER.length; i++) {
    const [ax, az] = RIVER[i - 1]!
    const [bx, bz] = RIVER[i]!
    const dx = bx - ax
    const dz = bz - az
    const t = Math.min(1, Math.max(0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    best = Math.min(best, Math.hypot(x - (ax + dx * t), z - (az + dz * t)))
  }
  return best
}

/** Inside the lake's ellipse, grown by `margin`. */
export const inLake = (x: number, z: number, margin = 0) =>
  ((x - LAKE.x) / (LAKE.rx + margin)) ** 2 + ((z - LAKE.z) / (LAKE.rz + margin)) ** 2 <= 1
