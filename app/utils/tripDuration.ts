/** "about 5 h 39 min", or "about 14 min" under an hour. `t` is vue-i18n's translate. */
export function tripDuration(t: (key: string, values: Record<string, number>) => string, minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? t('trips.duration', {h, m}) : t('trips.durationMin', {m})
}
