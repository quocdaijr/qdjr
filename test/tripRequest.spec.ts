import {describe, expect, test, vi} from 'vitest'
import {clientIp, createRateLimiter, createThrottle, parsePlanRequest, planKey, QueueFull} from '~~/server/utils/tripRequest'

const SAIGON = {name: 'Sài Gòn', lat: 10.7769, lng: 106.7009}
const DALAT = {name: 'Đà Lạt', lat: 11.9404, lng: 108.4583}

describe('parsePlanRequest', () => {
  test('accepts two to six named stops in Vietnam and a vehicle', () => {
    const parsed = parsePlanRequest({stops: [SAIGON, DALAT], vehicle: 'motorbike'})
    expect(parsed).toEqual({ok: true, value: {stops: [SAIGON, DALAT], vehicle: 'motorbike'}})
  })

  test('trims names and rounds coordinates', () => {
    const parsed = parsePlanRequest({stops: [{...SAIGON, name: '  Sài Gòn ', lat: 10.776912345}, DALAT], vehicle: 'car'})
    expect(parsed.ok && parsed.value.stops[0]).toEqual({name: 'Sài Gòn', lat: 10.77691, lng: 106.7009})
  })

  test.each([
    ['no body', undefined, 'stops'],
    ['one stop', {stops: [SAIGON], vehicle: 'car'}, 'stops'],
    ['seven stops', {stops: Array(7).fill(SAIGON), vehicle: 'car'}, 'stops'],
    ['an unknown vehicle', {stops: [SAIGON, DALAT], vehicle: 'plane'}, 'vehicle'],
    ['a stop abroad', {stops: [SAIGON, {name: 'Paris', lat: 48.85, lng: 2.35}], vehicle: 'car'}, 'outside'],
    ['an empty name', {stops: [{...SAIGON, name: ' '}, DALAT], vehicle: 'car'}, 'name'],
    ['a long name', {stops: [{...SAIGON, name: 'x'.repeat(81)}, DALAT], vehicle: 'car'}, 'name'],
    ['the same place twice', {stops: [SAIGON, {...SAIGON, name: 'again'}], vehicle: 'car'}, 'same'],
    ['a coordinate that is not a number', {stops: [{...SAIGON, lat: '10'}, DALAT], vehicle: 'car'}, 'outside']
  ])('rejects %s', (_label, body, word) => {
    const parsed = parsePlanRequest(body)
    expect(parsed.ok).toBe(false)
    expect(!parsed.ok && parsed.error).toContain(word)
  })
})

describe('planKey', () => {
  test('is the same for the same trip and differs by vehicle or stop', () => {
    const a = planKey({stops: [SAIGON, DALAT], vehicle: 'car'})
    expect(planKey({stops: [SAIGON, DALAT], vehicle: 'car'})).toBe(a)
    expect(planKey({stops: [SAIGON, DALAT], vehicle: 'coach'})).not.toBe(a)
    expect(planKey({stops: [DALAT, SAIGON], vehicle: 'car'})).not.toBe(a)
    expect(a).toMatch(/^[a-f0-9]{16}$/)
  })
})

describe('createRateLimiter', () => {
  test('allows `limit` requests per window and per key', () => {
    let now = 0
    const allow = createRateLimiter({limit: 2, windowMs: 1000, now: () => now})
    expect([allow('a'), allow('a'), allow('a'), allow('b')]).toEqual([true, true, false, true])
    now = 1001
    expect(allow('a')).toBe(true)
  })
})

describe('createThrottle', () => {
  test('runs tasks one at a time, a gap apart, and keeps going after a failure', async () => {
    vi.useFakeTimers()
    const throttle = createThrottle(1000)
    const started: number[] = []
    const run = (value: number, fail = false) =>
      throttle(async () => {
        started.push(Date.now())
        if (fail) throw new Error('boom')
        return value
      })
    const results = Promise.allSettled([run(1), run(2, true), run(3)])
    await vi.runAllTimersAsync()
    const settled = await results
    expect(settled.map((r) => r.status)).toEqual(['fulfilled', 'rejected', 'fulfilled'])
    expect(started[1] - started[0]).toBeGreaterThanOrEqual(1000)
    expect(started[2] - started[1]).toBeGreaterThanOrEqual(1000)
    vi.useRealTimers()
  })
})

describe('hardening', () => {
  test('planKey ignores the names: renaming a stop reuses the planned road', () => {
    expect(planKey({stops: [{...SAIGON, name: 'Home'}, DALAT], vehicle: 'car'})).toBe(planKey({stops: [SAIGON, DALAT], vehicle: 'car'}))
  })

  test('the rate limiter forgets visitors whose window has passed', () => {
    let now = 0
    const limiter = createRateLimiter({limit: 1, windowMs: 1000, now: () => now})
    for (let i = 0; i < 50; i++) limiter(`ip-${i}`)
    now = 5000
    limiter('late')
    expect(limiter.size()).toBe(1)
  })

  test('a full queue refuses new tasks instead of growing', async () => {
    vi.useFakeTimers()
    const throttle = createThrottle(1000, 2)
    const task = () => Promise.resolve(1)
    const queued = [throttle(task), throttle(task)]
    await expect(throttle(task)).rejects.toBeInstanceOf(QueueFull)
    await vi.runAllTimersAsync()
    await Promise.all(queued)
    const later = throttle(task) // room again once the queue has drained
    await vi.runAllTimersAsync()
    await expect(later).resolves.toBe(1)
    vi.useRealTimers()
  })

  test('clientIp trusts the proxy-added right end of X-Forwarded-For', () => {
    expect(clientIp('6.6.6.6, 203.0.113.9', '10.0.0.1')).toBe('203.0.113.9')
    expect(clientIp(undefined, '10.0.0.1')).toBe('10.0.0.1')
  })
})
