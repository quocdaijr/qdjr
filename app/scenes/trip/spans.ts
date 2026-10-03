import type {RoadSpan, TripVariant} from '~/data/trips'

// Which stretches of road the board draws specially. At board scale a 1 km
// bridge on a 600 km trip would be a sliver, so named bridges and tunnels
// (the ones the itinerary lists) and every town are stretched to a length you
// can see; unnamed bridges and tunnels are drawn only when already that long.
// Only a named bridge crosses a river: unnamed ones are mostly flyovers over
// other roads (in a city, dozens of them).

const MIN_LENGTH = {bridge: 1.8, tunnel: 2.4, city: 4} // world units
type Drawn = RoadSpan['kind']

/** A drawn stretch; `river` marks a bridge with water under it. */
export type DrawnSpan = RoadSpan & {river?: boolean}

export function visualSpans(variant: Pick<TripVariant, 'spans' | 'places'>, roadLength: number): DrawnSpan[] {
  const around = (kind: 'bridge' | 'tunnel' | 'city', from: number, to: number): DrawnSpan => {
    const min = MIN_LENGTH[kind] / roadLength
    const pad = Math.max(0, (min - (to - from)) / 2)
    const round = (x: number) => Math.round(x * 1e4) / 1e4
    return {kind, from: round(Math.max(0, from - pad)), to: round(Math.min(1, to + pad))}
  }
  const drawn: DrawnSpan[] = []
  for (const s of variant.spans) {
    if (s.kind === 'motorway') drawn.push(s)
    else if (s.kind === 'city') drawn.push(around('city', s.from, s.to))
    else if ((s.to - s.from) * roadLength >= MIN_LENGTH[s.kind]) drawn.push(s)
  }
  for (const p of variant.places) {
    if (p.kind === 'bridge') drawn.push({...around('bridge', p.at, p.at), river: true})
    if (p.kind === 'tunnel') drawn.push(around('tunnel', p.at, p.at))
  }
  return merge(drawn)
}

function merge(spans: DrawnSpan[]): DrawnSpan[] {
  const out: DrawnSpan[] = []
  for (const kind of ['motorway', 'bridge', 'tunnel', 'city'] as Drawn[]) {
    const runs = spans.filter((s) => s.kind === kind).sort((a, b) => a.from - b.from)
    const merged: DrawnSpan[] = []
    for (const s of runs) {
      const last = merged.at(-1)
      if (last && s.from <= last.to) merged[merged.length - 1] = {...last, to: Math.max(last.to, s.to), ...(last.river || s.river ? {river: true} : {})}
      else merged.push({...s})
    }
    out.push(...merged)
  }
  return out
}

export const spanAt = (spans: readonly RoadSpan[], kind: Drawn, u: number): RoadSpan | undefined =>
  spans.find((s) => s.kind === kind && u >= s.from && u <= s.to)
