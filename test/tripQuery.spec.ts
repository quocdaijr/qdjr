import {describe, expect, test} from 'vitest'
import {readPlanQuery, writePlanQuery} from '~/utils/tripQuery'

const STOPS = [
  {name: 'Chợ Bến Thành', lat: 10.77253, lng: 106.69804},
  {name: 'Landmark 81, Bình Thạnh', lat: 10.7949, lng: 106.7218}
]

describe('trip plan query', () => {
  test('round-trips stops (names with commas too) and the vehicle', () => {
    const query = writePlanQuery(STOPS, 'coach')
    expect(readPlanQuery(query)).toEqual({stops: STOPS, vehicle: 'coach'})
  })

  test('reads a single stop param as a list and defaults the vehicle', () => {
    expect(readPlanQuery({stop: '10.7,106.6,A'})).toEqual({stops: [{name: 'A', lat: 10.7, lng: 106.6}], vehicle: 'motorbike'})
  })

  test('drops malformed stops and unknown vehicles', () => {
    expect(readPlanQuery({stop: ['x,y,A', '10,106,', '10.7,106.6,B'], v: 'plane'})).toEqual({stops: [{name: 'B', lat: 10.7, lng: 106.6}], vehicle: 'motorbike'})
  })
})
