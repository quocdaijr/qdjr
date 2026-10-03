import {describe, expect, test} from 'vitest'
import {buildStations} from '~/scenes/cartoon/stations'
import {buildTrack} from '~/scenes/cartoon/track'
import {createKit} from '~/scenes/cartoon/kit'
import {BRIDGE_U, COTTAGES, HILLS, inLake, LAKE, RIVER_HALF_WIDTH, riverDistance} from '~/scenes/cartoon/layout'
import {journeyStations} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'

// The landscape map must leave the railway and the stations alone.
const kit = createKit(false)
const track = buildTrack(kit)
const stations = buildStations(kit, track, journeyStations(PROFILE_CONTENT.en), false)
const samples = Array.from({length: 2000}, (_, i) => ({u: i / 2000, p: track.curve.getPointAt(i / 2000)}))
const TRACK_CLEAR = 1.2

describe('cartoon landscape layout', () => {
  test('the river crosses the track only where the bridge stands', () => {
    const wet = samples.filter(({p}) => riverDistance(p.x, p.z) < RIVER_HALF_WIDTH + 0.3)
    expect(wet.length).toBeGreaterThan(0)
    for (const {u} of wet) {
      expect(u).toBeGreaterThan(BRIDGE_U.from)
      expect(u).toBeLessThan(BRIDGE_U.to)
    }
  })

  test('the lake, hills and cottages keep off the track', () => {
    for (const {p} of samples) {
      expect(inLake(p.x, p.z, TRACK_CLEAR)).toBe(false)
      for (const h of HILLS) expect(Math.hypot(p.x - h.x, p.z - h.z)).toBeGreaterThan(h.r + TRACK_CLEAR)
      for (const c of COTTAGES) expect(Math.hypot(p.x - c.x, p.z - c.z)).toBeGreaterThan(TRACK_CLEAR + 0.8)
    }
  })

  test('nothing lands on a station or its platform', () => {
    for (const a of stations.anchors) {
      for (const at of [a.building, a.platform]) {
        expect(inLake(at.x, at.z, 1.5)).toBe(false)
        expect(riverDistance(at.x, at.z)).toBeGreaterThan(RIVER_HALF_WIDTH + 1.5)
        for (const h of HILLS) expect(Math.hypot(at.x - h.x, at.z - h.z)).toBeGreaterThan(h.r + 1.5)
        for (const c of COTTAGES) expect(Math.hypot(at.x - c.x, at.z - c.z)).toBeGreaterThan(2.5)
      }
    }
  })

  test('the river leaves the lake and runs off the island edge', () => {
    expect(inLake(LAKE.x + LAKE.rx - 0.5, LAKE.z)).toBe(true)
    expect(riverDistance(LAKE.x + LAKE.rx, LAKE.z)).toBeLessThan(1)
    expect(riverDistance(20, 1)).toBeLessThan(0.5)
  })
})
