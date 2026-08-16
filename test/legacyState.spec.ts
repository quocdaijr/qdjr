import {describe, expect, test} from 'vitest'
import {isBackendUnavailable, isResourceNotFound} from '~/utils/legacyState'

const notFound = {message: 'Not Found', statusCode: 404}
const serverError = {message: 'Boom', statusCode: 500}
const networkError = {message: 'Unknown Error', statusCode: 0}

describe('isBackendUnavailable', () => {
  test('is true when no API is configured, regardless of error state', () => {
    // This is the shipping default: API_URL is unset because api.qdjr.me
    // no longer resolves.
    expect(isBackendUnavailable(false, null)).toBe(true)
    expect(isBackendUnavailable(false, notFound)).toBe(true)
  })

  test('is false when the API is configured and nothing failed', () => {
    expect(isBackendUnavailable(true, null)).toBe(false)
    expect(isBackendUnavailable(true, undefined)).toBe(false)
  })

  test('is true for a 5xx from a configured API', () => {
    expect(isBackendUnavailable(true, serverError)).toBe(true)
  })

  test('is true for a network failure, which the store records as status 0', () => {
    expect(isBackendUnavailable(true, networkError)).toBe(true)
  })

  test('is FALSE for a 404, which is a resource problem rather than a backend one', () => {
    // The distinction the whole surface hangs on: a reachable API saying "no
    // such post" must not be reported as the archive being offline.
    expect(isBackendUnavailable(true, notFound)).toBe(false)
  })
})

describe('isResourceNotFound', () => {
  test('is true when a reachable API returned nothing for this resource', () => {
    expect(isResourceNotFound(true, notFound, false, null)).toBe(true)
    expect(isResourceNotFound(true, null, false, null)).toBe(true)
  })

  test('is false while the request is still in flight', () => {
    // data is legitimately empty during loading; 404-ing here would be a race.
    expect(isResourceNotFound(true, null, true, null)).toBe(false)
  })

  test('is false when data arrived', () => {
    expect(isResourceNotFound(true, null, false, {id: 1})).toBe(false)
  })

  test('is false whenever the backend is unavailable', () => {
    // Critical: with no backend, every legacy URL would otherwise throw a 404
    // and the offline panel would never render.
    expect(isResourceNotFound(false, null, false, null)).toBe(false)
    expect(isResourceNotFound(true, serverError, false, null)).toBe(false)
    expect(isResourceNotFound(true, networkError, false, null)).toBe(false)
  })

  test('the two states are mutually exclusive', () => {
    const cases: Array<[boolean, typeof notFound | null, boolean, unknown]> = [
      [false, null, false, null],
      [true, null, false, null],
      [true, notFound, false, null],
      [true, serverError, false, null],
      [true, null, true, null],
      [true, null, false, {id: 1}]
    ]

    for (const [enabled, error, pending, data] of cases) {
      const unavailable = isBackendUnavailable(enabled, error)
      const missing = isResourceNotFound(enabled, error, pending, data)
      expect(unavailable && missing).toBe(false)
    }
  })
})
