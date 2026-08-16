interface StoreError {
  message: string
  statusCode: number
}

/**
 * Shared fetch wrapper for the legacy blog surface.
 *
 * The legacy backend (api.qdjr.me) no longer resolves, so these pages must
 * distinguish two very different failure modes:
 *
 *   unavailable — no backend configured, or it answered 5xx / not at all.
 *                 Render an "archive offline" panel at HTTP 200. Never throw:
 *                 createError here would turn every legacy URL into an error
 *                 page, and would fail the build outright if prerendering were
 *                 ever enabled.
 *
 *   notFound    — a reachable backend said this specific resource is absent.
 *                 That is a genuine 404 and should be thrown as one.
 */
export function useLegacyResource<T>(
  key: string,
  fetcher: () => Promise<void>,
  read: () => T | null,
  readError: () => StoreError | null
) {
  const {$api} = useNuxtApp()

  const {status} = useAsyncData(key, async () => {
    await fetcher()
    return true
  })

  const pending = computed(() => status.value === 'pending')
  const data = computed(read)
  const error = computed(readError)

  const unavailable = computed(
    () => !$api.enabled || (!!error.value && error.value.statusCode !== 404)
  )

  const notFound = computed(
    () => !unavailable.value && !pending.value && !data.value
  )

  return {data, pending, status, unavailable, notFound}
}
