<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// <html lang>, plus hreflang alternates for both languages on every page.
const i18nHead = useLocaleHead({seo: true})

useHead(() => ({
  htmlAttrs: {lang: i18nHead.value.htmlAttrs?.lang},
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])]
}))
</script>
