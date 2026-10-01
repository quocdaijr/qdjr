// Light/dark on qdjr.me follows the clock in Vietnam (UTC+7, no DST) instead
// of a manual toggle: visitors see the site the way the author does right now.

export const VN_UTC_OFFSET_HOURS = 7
export const NIGHT_START_HOUR = 18
export const NIGHT_END_HOUR = 6

const HOURS_PER_DAY = 24

/** Hour of day (0–23) in Vietnam for the given instant. */
export function vietnamHour(date: Date): number {
  return (date.getUTCHours() + VN_UTC_OFFSET_HOURS) % HOURS_PER_DAY
}

/** True from 18:00 up to (not including) 06:00 Vietnam time. */
export function isNightInVietnam(date: Date): boolean {
  const hour = vietnamHour(date)
  return hour < NIGHT_END_HOUR || hour >= NIGHT_START_HOUR
}
