// test/journeyStations.spec.ts
import {describe, expect, test} from 'vitest'
import {journeyStations, projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'

const {vi, en} = PROFILE_CONTENT

describe('journeyStations', () => {
  test('one station per /about stop, in stop order', () => {
    const stations = journeyStations(en)
    expect(stations).toHaveLength(2 + en.timeline.length + 1 + 1)
    expect(stations[0].kind).toBe('home')
    expect(stations[1].kind).toBe('workshop')
    expect(stations.at(-1)?.kind).toBe('post')
  })

  test('career stages: school for education, a tower for the current job', () => {
    const kinds = journeyStations(en).slice(2, 2 + en.timeline.length).map((s) => s.kind)
    expect(kinds).toEqual(['school', 'office', 'press', 'tower'])
  })

  test('all projects share one yard station that shows every logo', () => {
    const stations = journeyStations(en)
    const yard = stations[2 + en.timeline.length]
    expect(yard.kind).toBe('yard')
    expect(yard.images).toEqual(en.projects.map((p) => p.image))
    expect(stations.filter((s) => s.kind === 'yard')).toHaveLength(1)
  })

  test('both languages produce the same stations', () => {
    expect(journeyStations(vi)).toEqual(journeyStations(en))
  })

  test('the projects stop is the yard, after the career stages', () => {
    expect(projectsStopIndex(en)).toBe(2 + en.timeline.length)
    expect(projectsStopIndex(vi)).toBe(projectsStopIndex(en))
  })
})
