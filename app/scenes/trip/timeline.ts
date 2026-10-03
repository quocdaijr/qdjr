// Where the trip vehicle is at any moment of its loop, in normalised arc
// length u ∈ [0, 1]. Pure: no three.js, no clock. The vehicle waits at each
// mark (stop or sight), eases away, cruises, and eases into the next one; at
// the end it pauses and the loop starts again.

export interface TimelineMark {
  at: number // 0..1 along the road
  dwell: number // seconds standing there
}

export interface TimelinePoint {
  u: number
  /** Index of the last mark reached. */
  mark: number
  /** World units per second, for spinning wheels. */
  speed: number
}

export interface Timeline {
  total: number // seconds per loop
  at(time: number): TimelinePoint
  /** When the loop arrives at mark i (its wait begins): autoplay resumes there. */
  timeOf(mark: number): number
}

interface Phase {
  kind: 'dwell' | 'drive'
  start: number
  end: number
  mark: number
}

export interface TimelineConfig {
  length: number // world units of road
  cruise: number // top speed, units/s
  /** Longest drive between two marks, s: long stretches go faster instead of dragging on. */
  maxDrive?: number
}

/** `marks` sorted by `at`, the first at 0 and the last at 1. */
export function buildTimeline(marks: readonly TimelineMark[], {length, cruise, maxDrive = Infinity}: TimelineConfig): Timeline {
  const phases: Phase[] = []
  let clock = 0
  marks.forEach((m, i) => {
    phases.push({kind: 'dwell', start: clock, end: (clock += m.dwell), mark: i})
    const next = marks[i + 1]
    if (!next) return
    // A sine ease peaks at π/2 × its average speed: size the drive so the peak is `cruise`.
    const seconds = Math.min(maxDrive, ((Math.PI / 2) * (next.at - m.at) * length) / cruise)
    if (seconds > 0) phases.push({kind: 'drive', start: clock, end: (clock += seconds), mark: i})
  })
  const total = clock

  return {
    total,
    timeOf: (mark) => phases.find((p) => p.kind === 'dwell' && p.mark === mark)?.start ?? 0,
    at(time) {
      // Times already inside the loop are used as they are: the wrap would nudge a boundary into the previous phase.
      const t = time >= 0 && time < total ? time : ((time % total) + total) % total
      const phase = phases.find((p) => t < p.end) ?? phases.at(-1)!
      const from = marks[phase.mark]
      if (phase.kind === 'dwell') return {u: from.at, mark: phase.mark, speed: 0}
      const span = marks[phase.mark + 1].at - from.at
      const seconds = phase.end - phase.start
      const s = (t - phase.start) / seconds
      return {
        u: from.at + (span * (1 - Math.cos(Math.PI * s))) / 2,
        mark: phase.mark,
        speed: ((span * length * Math.PI) / (2 * seconds)) * Math.sin(Math.PI * s)
      }
    }
  }
}

/** Which leg (vehicle) runs at u, given each stop's position along the road. */
export function legAt(stops: readonly number[], u: number): number {
  let leg = 0
  for (let i = 1; i < stops.length - 1; i++) if (u >= stops[i]) leg = i
  return leg
}

export interface TripMarkRef {
  kind: 'stop' | 'place'
  index: number
  at: number
}

const DWELL = {first: 2, stop: 2.5, place: 1.6, last: 4} // seconds

/** Stops and places in road order, as the scene drives past them; the page maps a mark index back to its place. */
export function tripMarks(variant: {stopsAt: readonly number[]; places: readonly {at: number}[]}): TripMarkRef[] {
  const stops = variant.stopsAt.map((at, index) => ({kind: 'stop' as const, index, at}))
  const places = variant.places.map((p, index) => ({kind: 'place' as const, index, at: p.at}))
  // Stable sort: at the same spot a stop comes first.
  return [...stops, ...places].sort((a, b) => a.at - b.at)
}

export function markDwell(mark: TripMarkRef, i: number, count: number): number {
  if (i === 0) return DWELL.first
  if (i === count - 1) return DWELL.last
  return mark.kind === 'stop' ? DWELL.stop : DWELL.place
}

/** A drive from u = from to u = to over `seconds`, eased at both ends; speed in world units/s. */
export function driveBetween(from: number, to: number, seconds: number, t: number, length: number): {u: number; speed: number; done: boolean} {
  if (seconds <= 0 || t >= seconds) return {u: to, speed: 0, done: true}
  const s = Math.max(0, t) / seconds
  return {
    u: from + ((to - from) * (1 - Math.cos(Math.PI * s))) / 2,
    speed: ((Math.abs(to - from) * length * Math.PI) / (2 * seconds)) * Math.sin(Math.PI * s),
    done: false
  }
}
