// test/journeyStations.spec.ts
import {describe, expect, test} from 'vitest'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'

const {vi, en} = PROFILE_CONTENT

describe('journeyStations', () => {
  test('one station per /about stop, in stop order', () => {
    const stations = journeyStations(en)
    expect(stations).toHaveLength(2 + en.timeline.length + en.projects.length + 1)
    expect(stations[0].kind).toBe('home')
    expect(stations[1].kind).toBe('workshop')
    expect(stations.at(-1)?.kind).toBe('post')
  })

  test('career stages: school for education, a tower for the current job', () => {
    const kinds = journeyStations(en).slice(2, 2 + en.timeline.length).map((s) => s.kind)
    expect(kinds).toEqual(['school', 'office', 'press', 'tower'])
  })

  test('every project is a billboard showing its logo', () => {
    const kiosks = journeyStations(en).filter((s) => s.kind === 'kiosk')
    expect(kiosks.map((k) => k.image)).toEqual(en.projects.map((p) => p.image))
  })

  test('both languages produce the same stations', () => {
    expect(journeyStations(vi)).toEqual(journeyStations(en))
  })
})
