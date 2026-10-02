import {describe, expect, test} from 'vitest'
import {DEFAULT_MOTION, signedLoopDistance, stepTrain, wrapU, type TrainMotion} from '~/scenes/cartoon/motion'

const CONFIG = {length: 120, ...DEFAULT_MOTION}
const DT = 1 / 60

function run(start: TrainMotion, target: number | null, seconds: number) {
  const trace: TrainMotion[] = []
  let state = start
  for (let i = 0; i < seconds * 60; i++) {
    state = stepTrain(state, target, DT, CONFIG)
    trace.push(state)
  }
  return {state, trace}
}

describe('loop geometry', () => {
  test('wrapU keeps u in [0, 1)', () => {
    expect(wrapU(1.25)).toBeCloseTo(0.25)
    expect(wrapU(-0.25)).toBeCloseTo(0.75)
  })

  test('signedLoopDistance takes the short way round', () => {
    expect(signedLoopDistance(0.1, 0.3)).toBeCloseTo(0.2)
    expect(signedLoopDistance(0.03, 0.97)).toBeCloseTo(-0.06)
  })
})

describe('stepTrain', () => {
  test('loops forward on the home page and stays in [0, 1)', () => {
    const {state, trace} = run({u: 0.9, velocity: 0}, null, 30)
    expect(trace.every((s) => s.u >= 0 && s.u < 1)).toBe(true)
    expect(state.velocity).toBeCloseTo(CONFIG.cruise / CONFIG.length)
  })

  test('reaches a station ahead and parks without overshooting', () => {
    const target = 0.3
    const {state, trace} = run({u: 0.03, velocity: 0}, target, 20)
    expect(trace.every((s) => signedLoopDistance(s.u, target) >= 0)).toBe(true)
    expect(state.u).toBe(target)
    expect(state.velocity).toBe(0)
  })

  test('gets there in a few seconds, not a crawl', () => {
    const {trace} = run({u: 0.03, velocity: 0}, 0.3, 20)
    const arrived = trace.findIndex((s) => s.u === 0.3 && s.velocity === 0)
    expect(arrived).toBeGreaterThan(0)
    expect(arrived / 60).toBeLessThan(9)
  })

  test('takes the short way across the loop seam', () => {
    const {state, trace} = run({u: 0.03, velocity: 0}, 0.97, 10)
    expect(trace[30].u).toBeLessThan(0.03) // set off backwards…
    expect(trace.some((s) => s.u > 0.9)).toBe(true) // …and crossed the seam
    expect(trace.every((s) => s.u < 0.03 || s.u >= 0.97)).toBe(true) // never went the long way
    expect(state.u).toBe(0.97)
  })

  test('reverses smoothly when the station is behind a moving train', () => {
    const {state, trace} = run({u: 0.5, velocity: 6 / CONFIG.length}, 0.45, 20)
    const velocities = trace.map((s) => s.velocity)
    expect(Math.min(...velocities)).toBeLessThan(0)
    expect(state.u).toBe(0.45)
    expect(state.velocity).toBe(0)
  })

  test('reduced motion jumps straight to the station; at home it stays put', () => {
    expect(stepTrain({u: 0.1, velocity: 0}, 0.6, DT, CONFIG, true)).toEqual({u: 0.6, velocity: 0})
    expect(stepTrain({u: 0.1, velocity: 0}, null, DT, CONFIG, true)).toEqual({u: 0.1, velocity: 0})
  })

  test('a zero-length frame changes nothing', () => {
    expect(stepTrain({u: 0.2, velocity: 0}, 0.4, 0, CONFIG)).toEqual({u: 0.2, velocity: 0})
  })
})
