import {describe, expect, test} from 'vitest'
import * as THREE from 'three'
import {fitBoard, smoothPath} from '~/scenes/trip/board'

describe('fitBoard', () => {
  // 1° east then 2° north, around latitude 21.
  const route: [number, number][] = [[105, 21], [106, 21], [106, 23]]
  const board = fitBoard(route, 60)

  test('centres the route and fits its longest side to the board', () => {
    const xs = board.points.map((p) => p.x)
    const zs = board.points.map((p) => p.z)
    expect(Math.max(...zs) - Math.min(...zs)).toBeCloseTo(60, 6)
    expect(Math.max(...xs) + Math.min(...xs)).toBeCloseTo(0, 6)
    expect(Math.max(...zs) + Math.min(...zs)).toBeCloseTo(0, 6)
  })

  test('puts north at −z and east at +x, keeping true proportions', () => {
    const [start, corner, end] = board.points
    expect(corner.x).toBeGreaterThan(start.x)
    expect(end.z).toBeLessThan(corner.z)
    // A degree of longitude at 21–23° N is ~0.93 of a degree of latitude.
    expect((corner.x - start.x) / (corner.z - end.z)).toBeCloseTo(Math.cos((22 * Math.PI) / 180) / 2, 2)
  })

  test('projects any other place onto the same board, and back', () => {
    expect(board.project(106, 23).distanceTo(board.points[2])).toBeCloseTo(0, 6)
    const [lng, lat] = board.unproject(board.points[1].x, board.points[1].z)
    expect(lng).toBeCloseTo(106, 9)
    expect(lat).toBeCloseTo(21, 9)
  })
})

describe('smoothPath', () => {
  test('irons out a zigzag but keeps both ends and the heights', () => {
    const zigzag = [0, 1, 0, 1, 0].map((z, x) => new THREE.Vector3(x, x * 10, z))
    const out = smoothPath(zigzag, 1)
    expect(out[0]).toEqual(zigzag[0])
    expect(out[4]).toEqual(zigzag[4])
    expect(out[2].z).toBeCloseTo(2 / 3, 6)
    expect(out[2].y).toBe(20)
  })
})
