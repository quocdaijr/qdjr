import {describe, expect, test} from 'vitest'
import {elevationGrid} from '~/scenes/trip/elevation'

// 3 × 2 cells over lng 0..2, lat 0..1: sea in the west column, a hill in the east.
const grid = elevationGrid({bbox: [0, 0, 2, 1], cols: 3, rows: 2, heights: [-10, 20, 100, -10, 40, 300]})

describe('elevationGrid', () => {
  test('interpolates between the grid points', () => {
    expect(grid.at(1, 0)).toBe(20)
    expect(grid.at(1.5, 0)).toBe(60)
    expect(grid.at(1.5, 0.5)).toBe((20 + 100 + 40 + 300) / 4)
  })

  test('clamps outside the box', () => {
    expect(grid.at(5, 5)).toBe(300)
  })

  test('marks land next to the sea as coast', () => {
    expect(grid.coastal(1, 0)).toBe(true)
    expect(elevationGrid({bbox: [0, 0, 4, 0], cols: 5, rows: 1, heights: [-5, 3, 9, 50, 80]}).coastal(4, 0)).toBe(false)
  })
})
