import {describe, expect, test} from 'vitest'
import {formatPostDate} from '~/utils/formatPostDate'

// 09:00 in Vietnam is 02:00 UTC the same day; dates render in Vietnam time.
const PUBLISHED = '2026-04-19T09:00:00+07:00'

describe('formatPostDate', () => {
  test('English short and long', () => {
    expect(formatPostDate(PUBLISHED, 'en')).toBe('Apr 19, 2026')
    expect(formatPostDate(PUBLISHED, 'en', 'long')).toBe('April 19, 2026')
  })

  test('Vietnamese uses the Vietnamese month words', () => {
    expect(formatPostDate(PUBLISHED, 'vi')).toMatch(/19.*thg 4.*2026/)
    expect(formatPostDate(PUBLISHED, 'vi', 'long')).toMatch(/19.*tháng 4.*2026/)
  })

  test('an unknown locale falls back to Vietnamese', () => {
    expect(formatPostDate(PUBLISHED, 'fr')).toBe(formatPostDate(PUBLISHED, 'vi'))
  })

  test('empty or invalid input gives an empty string', () => {
    expect(formatPostDate(undefined, 'en')).toBe('')
    expect(formatPostDate('not a date', 'en')).toBe('')
  })

  test('renders the Vietnam calendar day near midnight UTC', () => {
    expect(formatPostDate('2026-04-18T20:30:00Z', 'en')).toBe('Apr 19, 2026')
  })
})
