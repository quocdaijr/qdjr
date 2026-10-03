import * as THREE from 'three'

// Shooting stars: a small pool of streaks, each a short bright line whose
// head runs from `from` to `to` and whose tail fades into the background.
export type Vec3 = [number, number, number]

export interface Streak {
  from: Vec3
  to: Vec3
  start: number // scene time, seconds
  duration: number
}

const AMBIENT_DELAY = {min: 2.5, spread: 3.5}
const TAIL = 0.35 // tail trails this fraction of the path behind the head
export const PICK_DURATION = 0.9
export const AMBIENT_DURATION = 1.2

const easeOut = (t: number) => 1 - (1 - t) ** 3

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const progressOf = (s: Streak, t: number) => THREE.MathUtils.clamp((t - s.start) / s.duration, 0, 1)

/** Head position at scene time t (eased: fast start, soft landing). */
export function streakPoint(s: Streak, t: number): Vec3 {
  const p = progressOf(s, t)
  if (p === 0) return [...s.from]
  if (p === 1) return [...s.to]
  return lerp3(s.from, s.to, easeOut(p))
}

export const isDone = (s: Streak, t: number) => t >= s.start + s.duration

/** Seconds until the next ambient shooting star. */
export const nextAmbientDelay = (random: () => number) => AMBIENT_DELAY.min + random() * AMBIENT_DELAY.spread

export interface Streaks {
  group: THREE.Group
  launch(from: Vec3, to: Vec3, now: number, duration: number): void
  update(now: number): void
}

export function createStreaks(head: number, background: number, pool = 6): Streaks {
  const group = new THREE.Group()
  group.name = 'streaks'
  group.userData.launched = 0
  const headColor = new THREE.Color(head)
  const tailColor = new THREE.Color(background) // the tail dissolves into the sky
  const slots = Array.from({length: pool}, () => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array([...headColor.toArray(), ...tailColor.toArray()]), 3))
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({vertexColors: true, transparent: true, depthWrite: false}))
    line.visible = false
    line.frustumCulled = false
    group.add(line)
    return {line, streak: null as Streak | null}
  })

  return {
    group,
    launch(from, to, now, duration) {
      // Reuse a free slot, or the oldest streak if every slot is busy.
      const slot = slots.find((s) => !s.streak) ?? slots.reduce((a, b) => ((a.streak?.start ?? 0) <= (b.streak?.start ?? 0) ? a : b))
      slot.streak = {from, to, start: now, duration}
      slot.line.userData.from = from
      slot.line.userData.to = to
      slot.line.visible = true
      group.userData.launched += 1
    },
    update(now) {
      for (const slot of slots) {
        const s = slot.streak
        if (!s) continue
        // Keep the line until its tail has caught up with the landed head.
        if (now - (s.start + s.duration) > s.duration * TAIL) {
          slot.streak = null
          slot.line.visible = false
          continue
        }
        const headAt = streakPoint(s, now)
        const tailAt = streakPoint(s, Math.max(s.start, now - s.duration * TAIL))
        const positions = slot.line.geometry.attributes.position as THREE.BufferAttribute
        positions.setXYZ(0, ...headAt)
        positions.setXYZ(1, ...tailAt)
        positions.needsUpdate = true
      }
    }
  }
}
