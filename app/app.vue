<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type {SiteShell} from '~/composables/useSiteSettings'

// <html lang>, plus hreflang alternates for both languages on every page.
const i18nHead = useLocaleHead({seo: true})

useHead(() => ({
  htmlAttrs: {lang: i18nHead.value.htmlAttrs?.lang},
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
}))

// Profile + site settings once per request; every page reads them through
// useProfile() / useSiteSettings() via useNuxtData('site-shell'). Each part
// degrades to null on its own so one failing call never blanks the page.
const {$api} = useNuxtApp()
async function quiet<T>(label: string, load: () => Promise<T | null>): Promise<T | null> {
  try {
    return await load()
  } catch (error) {
    console.error(`[site] ${label} failed:`, (error as Error).message)
    return null
  }
}
await useAsyncData<SiteShell>('site-shell', async () => {
  const [profile, settings] = await Promise.all([
    quiet('profile', () => $api.getProfile()),
    quiet('site-settings', () => $api.getSiteSettings())
  ])
  return {profile, settings}
})
</script>
