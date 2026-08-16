/**
 * Search helpers for the @nuxt/content blog.
 *
 * Extracted from pages/blog/search.vue so the matching rules can be tested
 * directly rather than only through a browser.
 */

/**
 * Lowercase and strip combining diacritical marks.
 *
 * Not optional for this corpus: a post is titled "Claude Code — Trợ lý lập
 * trình…", so a reader typing unaccented "tro ly" has to match it.
 */
export function foldDiacritics(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export interface SearchablePost {
  title?: string
  description?: string
  tags?: string[]
  category?: string
}

/**
 * Whether a post matches a free-text query, across title, description, tags and
 * category. An empty or whitespace-only query matches nothing rather than
 * everything — the search page renders a prompt in that case.
 */
export function matchesQuery(post: SearchablePost, query: string): boolean {
  const needle = foldDiacritics(query).trim()
  if (!needle) return false

  return (
    foldDiacritics(post.title).includes(needle) ||
    foldDiacritics(post.description).includes(needle) ||
    (post.tags || []).some((tag) => foldDiacritics(tag).includes(needle)) ||
    foldDiacritics(post.category).includes(needle)
  )
}
