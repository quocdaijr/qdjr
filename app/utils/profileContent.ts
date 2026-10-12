import type {ProfileContent} from '~/data/profile'

const SECTIONS: ReadonlyArray<keyof ProfileContent> = ['profile', 'quote', 'skills', 'otherSkills', 'timeline', 'projects', 'contact']

/**
 * The ProfileContent for a locale out of the API's opaque `profile.content`
 * blob ({"vi": …, "en": …}), or null when it is missing or not shaped like one.
 * Callers fall back to the bundled copy on null, so a half-edited blob in the
 * admin can never blank the home page.
 */
export function pickProfileContent(content: unknown, locale: string): ProfileContent | null {
  if (!content || typeof content !== 'object') return null
  const entry = (content as Record<string, unknown>)[locale]
  if (!entry || typeof entry !== 'object') return null
  const hasAll = SECTIONS.every((key) => key in (entry as Record<string, unknown>))
  return hasAll ? (entry as ProfileContent) : null
}
