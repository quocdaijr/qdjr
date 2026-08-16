/**
 * The decision that governs the whole legacy-blogs surface.
 *
 * Extracted from useLegacyResource so it can be tested directly: it is pure
 * logic, and getting it backwards is the difference between "archive offline"
 * and turning every legacy URL into an error page (which would also fail the
 * build outright if prerendering were ever enabled).
 */

export interface StoreError {
  message: string
  statusCode: number
}

/**
 * True when the backend itself is the problem: none configured, or one that
 * answered with anything other than a genuine 404.
 *
 * Callers must render a normal page with an offline panel in this state, and
 * must never call createError.
 */
export function isBackendUnavailable(
  apiEnabled: boolean,
  error: StoreError | null | undefined
): boolean {
  if (!apiEnabled) return true
  return !!error && error.statusCode !== 404
}

/**
 * True when a reachable backend has told us this specific resource is absent.
 * That is a real 404 and should be thrown as one.
 *
 * Deliberately false while a request is still in flight: `data` is legitimately
 * empty then, and 404-ing on it would be a race.
 */
export function isResourceNotFound(
  apiEnabled: boolean,
  error: StoreError | null | undefined,
  pending: boolean,
  data: unknown
): boolean {
  if (isBackendUnavailable(apiEnabled, error)) return false
  if (pending) return false
  return !data
}
