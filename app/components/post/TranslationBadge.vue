<template>
  <span v-if="label" class="translation-badge font-mono">{{ label }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{post: {machineTranslated?: boolean; originalOnly?: boolean}}>()
const {t} = useI18n()

const label = computed(() => {
  if (props.post.originalOnly) return t('translation.badgeOriginalOnly')
  if (props.post.machineTranslated) return t('translation.badgeMachine')
  return ''
})
</script>

<style scoped>
.translation-badge {
  display: inline-block;
  margin: var(--space-2xs) 0;
  padding: 0 var(--space-2xs);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
}
</style>
