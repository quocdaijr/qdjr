// Post dates render in Vietnam time (where the posts are written) in the
// reader's language. Replaces five copies of a hard-coded en-US formatter.
const LOCALE_TAGS: Record<string, string> = {vi: 'vi-VN', en: 'en-US'}
const TIME_ZONE = 'Asia/Ho_Chi_Minh'

export function formatPostDate(value: unknown, locale: string, style: 'short' | 'long' = 'short'): string {
  if (!value) return ''
  const date = new Date(value as string | number | Date)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(LOCALE_TAGS[locale] ?? LOCALE_TAGS.vi, {
    year: 'numeric',
    month: style,
    day: 'numeric',
    timeZone: TIME_ZONE
  })
}
