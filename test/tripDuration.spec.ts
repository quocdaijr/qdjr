import {expect, test} from 'vitest'
import {tripDuration} from '~/utils/tripDuration'

const t = (key: string, v: Record<string, number>) => `${key}:${JSON.stringify(v)}`

test('drops the hours under an hour', () => {
  expect(tripDuration(t, 14)).toBe('trips.durationMin:{"m":14}')
  expect(tripDuration(t, 339)).toBe('trips.duration:{"h":5,"m":39}')
})
