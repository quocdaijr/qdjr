import {createPinia, defineStore, setActivePinia} from 'pinia'
import {computed, reactive, ref, watch} from 'vue'
import {beforeEach, vi} from 'vitest'

// Nuxt auto-imports these at build time. Under a plain Vitest run there is no
// Nuxt build, so the few that the units under test rely on are stubbed onto
// globalThis here. Anything needing the real Nuxt runtime belongs in the
// Playwright suite instead — see the note in vitest.config.ts.

// The object returned by useNuxtApp(). Tests overwrite `$api` per case via
// setMockApi() below.
const nuxtApp: Record<string, unknown> = {$api: {enabled: false}}

export function setMockApi(api: unknown) {
  nuxtApp.$api = api
}

vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('useNuxtApp', () => nuxtApp)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('watch', watch)

beforeEach(() => {
  // Fresh Pinia per test: these stores are session singletons in the real app,
  // and leaking state between cases would mask exactly the stale-error bug the
  // store tests are here to pin.
  setActivePinia(createPinia())
  setMockApi({enabled: false})
})
