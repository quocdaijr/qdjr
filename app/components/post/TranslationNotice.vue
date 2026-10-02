<template>
  <aside v-if="kind" class="translation-notice" role="note" data-translation-notice :data-kind="kind">
    <p>
      {{ kind === 'machine' ? t('translation.machineNotice') : t('translation.originalOnlyNotice') }}
      <NuxtLink v-if="kind === 'machine'" :to="originalHref" hreflang="vi-VN" class="link">{{ t('translation.readOriginal') }}</NuxtLink>
    </p>
  </aside>
</template>

<script setup lang="ts">
// Shown above an English post so nobody mistakes a machine translation (or an
// untranslated original) for something written that way, with a way back.
const props = defineProps<{post: {path: string; machineTranslated?: boolean; originalOnly?: boolean}}>()
const {t} = useI18n()
const localePath = useLocalePath()

const kind = computed(() => {
  if (props.post.originalOnly) return 'original-only'
  if (props.post.machineTranslated) return 'machine'
  return null
})
const originalHref = computed(() => localePath(props.post.path, 'vi'))
</script>

<style scoped>
.translation-notice {
  margin: 0 0 var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-inline-start: 3px solid var(--color-accent);
  border-radius: var(--radius-card);
  background: var(--color-paper-2);
  color: var(--color-ink);
  font-size: var(--text-sm);
}

.translation-notice p {
  margin: 0;
}

.translation-notice .link {
  white-space: normal;
}
</style>
