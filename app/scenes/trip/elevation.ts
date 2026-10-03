import type {TripTerrain} from '~/data/trips'

// The trip's elevation grid (metres, the sea below 0) read at any [lng, lat].

const COAST_CELLS = 2 // land this many cells from the sea counts as coast

export interface ElevationGrid {
  /** Metres above sea level, bilinear between grid points, clamped to the box. */
  at(lng: number, lat: number): number
  /** Land within a couple of cells of the sea (beaches, palms, boats offshore). */
  coastal(lng: number, lat: number): boolean
}

export function elevationGrid({bbox, cols, rows, heights}: TripTerrain): ElevationGrid {
  const [lngMin, latMin, lngMax, latMax] = bbox
  const cell = (c: number, r: number) => heights[Math.min(rows - 1, Math.max(0, r)) * cols + Math.min(cols - 1, Math.max(0, c))]
  const toGrid = (lng: number, lat: number) => [
    Math.min(cols - 1, Math.max(0, ((lng - lngMin) / (lngMax - lngMin || 1)) * (cols - 1))),
    Math.min(rows - 1, Math.max(0, ((lat - latMin) / (latMax - latMin || 1)) * (rows - 1)))
  ]
  const coast = new Uint8Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cell(c, r) < 0) continue
      outer: for (let dr = -COAST_CELLS; dr <= COAST_CELLS; dr++) {
        for (let dc = -COAST_CELLS; dc <= COAST_CELLS; dc++) {
          const [cc, rr] = [c + dc, r + dr]
          if (cc >= 0 && rr >= 0 && cc < cols && rr < rows && cell(cc, rr) < 0) {
            coast[r * cols + c] = 1
            break outer
          }
        }
      }
    }
  }
  return {
    at(lng, lat) {
      const [gx, gy] = toGrid(lng, lat)
      const [c, r] = [Math.floor(gx), Math.floor(gy)]
      const [fx, fy] = [gx - c, gy - r]
      const top = cell(c, r) * (1 - fx) + cell(c + 1, r) * fx
      const bottom = cell(c, r + 1) * (1 - fx) + cell(c + 1, r + 1) * fx
      return top * (1 - fy) + bottom * fy
    },
    coastal(lng, lat) {
      const [gx, gy] = toGrid(lng, lat)
      return coast[Math.round(gy) * cols + Math.round(gx)] === 1
    }
  }
}
