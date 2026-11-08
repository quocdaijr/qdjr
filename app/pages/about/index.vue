<template>
  <CvSheet v-if="store.isCv"/>
  <JourneyAboutJourney v-else/>
</template>

<script setup lang="ts">
defineOptions({name: 'AboutPage'})

const {t} = useI18n()
const store = useThemeStore()
const localePath = useLocalePath()
const config = useRuntimeConfig()

useHead(() => ({
  title: t('about.meta.title'),
  // `keywords` is not a useSeoMeta key in Unhead v3; it belongs in raw meta.
  meta: [{name: 'keywords', content: t('about.meta.keywords')}]
}))

useSeoMeta({
  description: () => t('about.meta.description'),
  ogUrl: () => `${config.public.baseUrl}${localePath('/about')}`,
  ogTitle: () => t('about.meta.title'),
  ogDescription: () => t('about.meta.ogDescription'),
  ogImage: () => `${config.public.baseUrl}/profile.jpg`
})
</script>
