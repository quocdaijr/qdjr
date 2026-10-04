<template>
  <NuxtLink
    :to="switchLocalePath(target.code)"
    class="lang-switch"
    :hreflang="target.language"
    :lang="target.code"
    :aria-label="t('lang.switchTo', {language: target.name})"
  >
    <span>{{ target.code.toUpperCase() }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
// Links to the current page in the other language. Two locales, so the
// "other" one is unambiguous; with more, this becomes a menu.
const {locale, locales, t} = useI18n()
const switchLocalePath = useSwitchLocalePath()

const target = computed(() => {
  const all = locales.value as Array<{code: 'vi' | 'en'; language?: string; name?: string}>
  return all.find((l) => l.code !== locale.value) ?? all[0]
})
</script>

<style scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  font-family: var(--vibe-font-mono);
  letter-spacing: 0.06em;
}
</style>
