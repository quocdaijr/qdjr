// Pure helpers for the bilingual blog. Originals (Vietnamese) and machine
// translations (English) share the same content path, /blog/<slug>.

export function stripLocalePrefix(path: string, locale: string, defaultLocale = 'vi'): string {
  if (locale === defaultLocale) return path
  const prefix = `/${locale}`
  if (path === prefix) return '/'
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path
}

interface HasPath {
  path: string
}

/**
 * The English list: every original appears once, in the originals' order,
 * replaced by its translation when there is one and flagged otherwise.
 */
export function mergeTranslations<O extends HasPath, T extends HasPath>(
  originals: readonly O[],
  translations: readonly T[]
): Array<T | (O & {originalOnly: true})> {
  const byPath = new Map(translations.map((t) => [t.path, t]))
  return originals.map((original) => byPath.get(original.path) ?? {...original, originalOnly: true as const})
}
