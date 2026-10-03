/** An SVG path of a [lng, lat] route fitted into a size × size box, north up (equirectangular). */
export function routePath(route: readonly [number, number][], size: number, pad = 4): string {
  const lat0 = (Math.min(...route.map((p) => p[1])) + Math.max(...route.map((p) => p[1]))) / 2
  const kx = Math.cos((lat0 * Math.PI) / 180)
  const xs = route.map((p) => p[0] * kx)
  const ys = route.map((p) => -p[1])
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)]
  const span = Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0, 1e-9)
  const k = (size - pad * 2) / span
  // Centre the shorter side.
  const dx = (size - pad * 2 - (Math.max(...xs) - x0) * k) / 2
  const dy = (size - pad * 2 - (Math.max(...ys) - y0) * k) / 2
  return xs.map((x, i) => `${i ? 'L' : 'M'}${(pad + dx + (x - x0) * k).toFixed(1)} ${(pad + dy + (ys[i] - y0) * k).toFixed(1)}`).join('')
}
