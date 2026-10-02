// Train motion along the closed track, in normalised arc length u ∈ [0, 1).
// Pure: no three.js, no clock. Speeds and accelerations are in world units so
// they read the same whatever the track length; velocity is stored in u/s.

export interface TrainMotion {
  u: number
  velocity: number
}

export interface MotionConfig {
  length: number // world units around the loop
  cruise: number // home-page looping speed, units/s
  maxSpeed: number // top speed between stations, units/s
  accel: number // acceleration and braking, units/s²
}

export const DEFAULT_MOTION = {cruise: 2.2, maxSpeed: 9, accel: 5} as const

const ARRIVE_DISTANCE = 0.03 // units
const ARRIVE_SPEED = 0.2 // units/s

// Values already in range are returned untouched, so a parked train sits exactly on its station's u.
export const wrapU = (u: number) => (u >= 0 && u < 1 ? u : ((u % 1) + 1) % 1)

/** Shortest signed distance in u from `from` to `to` around the loop, in (−0.5, 0.5]. */
export function signedLoopDistance(from: number, to: number): number {
  const d = wrapU(to - from)
  return d > 0.5 ? d - 1 : d
}

function approachSpeed(current: number, desired: number, maxDelta: number): number {
  const delta = desired - current
  return Math.abs(delta) <= maxDelta ? desired : current + Math.sign(delta) * maxDelta
}

/**
 * One frame of motion. `target` is the station's u on /about, or null on the
 * home page (loop forward at cruising speed).
 */
export function stepTrain(
  state: TrainMotion,
  target: number | null,
  dt: number,
  config: MotionConfig,
  reduceMotion = false
): TrainMotion {
  const {length, cruise, maxSpeed, accel} = config
  if (target === null) {
    if (reduceMotion || dt === 0) return state
    const velocity = approachSpeed(state.velocity, cruise / length, (accel / length) * dt)
    return {u: wrapU(state.u + velocity * dt), velocity}
  }
  if (reduceMotion) return {u: wrapU(target), velocity: 0}
  if (dt === 0) return state

  const d = signedLoopDistance(state.u, target)
  if (Math.abs(d * length) < ARRIVE_DISTANCE && Math.abs(state.velocity * length) < ARRIVE_SPEED) {
    return {u: wrapU(target), velocity: 0}
  }

  // Braking curve: the fastest speed from which the train can still stop at the station.
  const braking = Math.sqrt(2 * accel * Math.abs(d * length))
  const desired = (Math.sign(d) * Math.min(maxSpeed, braking)) / length
  const velocity = approachSpeed(state.velocity, desired, (accel / length) * dt)
  const u = state.u + velocity * dt

  // Never run past the station in a single frame.
  const after = signedLoopDistance(wrapU(u), target)
  if (after !== 0 && Math.sign(after) !== Math.sign(d)) return {u: wrapU(target), velocity: 0}
  return {u: wrapU(u), velocity}
}
