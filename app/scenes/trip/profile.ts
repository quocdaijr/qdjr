import type {RoadSpan} from '~/data/trips'

// The road's height at each route point, in world units. The elevation model
// samples the ground, not the road: over a bridge it dips into the river and
// in a tunnel it climbs the mountain, so those stretches are levelled between
// their ends before a light moving-average smoothing.

export function roadProfile(elevation: readonly number[], spans: readonly RoadSpan[], {scale, window}: {scale: number; window: number}): number[] {
  const last = elevation.length - 1
  const levelled = [...elevation]
  for (const span of spans) {
    if (span.kind !== 'bridge' && span.kind !== 'tunnel') continue
    const a = Math.max(0, Math.floor(span.from * last))
    const b = Math.min(last, Math.ceil(span.to * last))
    for (let i = a + 1; i < b; i++) levelled[i] = levelled[a] + ((levelled[b] - levelled[a]) * (i - a)) / (b - a)
  }
  return levelled.map((_, i) => {
    let sum = 0
    let n = 0
    for (let k = Math.max(0, i - window); k <= Math.min(last, i + window); k++) {
      sum += levelled[k]
      n++
    }
    return (Math.max(0, sum / n)) * scale
  })
}
