import {describe, expect, test} from 'vitest'
import {isNightInVietnam, vietnamHour} from '~/utils/vnTime'

// Dates are built in UTC; Vietnam is UTC+7 with no DST.
const utc = (h: number, m = 0) => new Date(Date.UTC(2026, 9, 1, h, m))

describe('vietnamHour', () => {
  test('adds seven hours to the UTC hour', () => {
    expect(vietnamHour(utc(5))).toBe(12)
  })

  test('wraps past midnight', () => {
    expect(vietnamHour(utc(23, 30))).toBe(6)
  })
})

describe('isNightInVietnam', () => {
  test('is day at noon in Vietnam', () => {
    expect(isNightInVietnam(utc(5))).toBe(false)
  })

  test('is day at exactly 06:00 (night ends)', () => {
    expect(isNightInVietnam(utc(23))).toBe(false)
  })

  test('is night at 05:59', () => {
    expect(isNightInVietnam(utc(22, 59))).toBe(true)
  })

  test('is night at exactly 18:00 (night starts)', () => {
    expect(isNightInVietnam(utc(11))).toBe(true)
  })

  test('is day at 17:59', () => {
    expect(isNightInVietnam(utc(10, 59))).toBe(false)
  })

  test('is night at midnight', () => {
    expect(isNightInVietnam(utc(17))).toBe(true)
  })
})
