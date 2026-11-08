<template>
  <fieldset v-if="variant === 'segmented'" class="seg mode-switch">
    <legend class="seg-legend">{{ t('mode.legend') }}</legend>
    <label v-for="mode in MODES" :key="mode" class="seg-option">
      <input
        class="seg-input"
        type="radio"
        name="mode"
        :value="mode"
        :checked="store.mode === mode"
        @change="store.setMode(mode)"
      >
      {{ LABEL[mode] }}
    </label>
  </fieldset>

  <button
    v-else
    type="button"
    class="mode-switch-icon"
    :aria-label="t('mode.current', {current: LABEL[store.mode], next: LABEL[next]})"
    :title="t('mode.title', {current: LABEL[store.mode]})"
    @click="store.toggleMode()"
  >
    <!-- cv mode: a document; vibes mode: a sparkle. -->
    <svg v-if="store.mode === 'cv'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 12h6 M10 16h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" fill="currentColor"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import {MODES, useThemeStore, type Mode} from '~/stores/theme'

withDefaults(defineProps<{variant?: 'segmented' | 'icon'}>(), {variant: 'icon'})

const store = useThemeStore()
const {t} = useI18n()
const LABEL = computed<Record<Mode, string>>(() => ({cv: t('mode.cv'), vibes: t('mode.vibes')}))
const next = computed<Mode>(() => (store.mode === 'cv' ? 'vibes' : 'cv'))
</script>

<style scoped>
/* States: default · hover · focus-visible · active (pressed). The segmented
   variant reuses main.css .seg. */
.mode-switch-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  background: var(--color-paper);
  transition: border-color var(--dur-micro) var(--ease-out), transform var(--dur-micro) var(--ease-out);
}

.mode-switch-icon:hover {
  border-color: var(--color-accent);
}

.mode-switch-icon:active {
  transform: translateY(1px);
}

.mode-switch-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
