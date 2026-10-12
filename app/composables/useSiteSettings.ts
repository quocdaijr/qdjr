import type {ApiProfile, ApiSiteSettings} from '~/plugins/api'

export interface SiteShell {
  profile: ApiProfile | null
  settings: ApiSiteSettings | null
}

/** The profile + site settings app.vue fetched once for this request (null parts when the API was down). */
export function useSiteShell() {
  return useNuxtData<SiteShell>('site-shell').data
}

export function useSiteSettings() {
  const shell = useSiteShell()
  return computed(() => shell.value?.settings ?? null)
}
