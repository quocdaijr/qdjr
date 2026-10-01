<template>
  <fieldset v-if="variant === 'segmented'" class="vibe-switch">
    <legend class="sr-only">Vibe</legend>
    <label v-for="vibe in VIBES" :key="vibe" class="vibe-switch-option">
      <input
        class="sr-only"
        type="radio"
        name="vibe"
        :value="vibe"
        :checked="store.vibe === vibe"
        @change="store.setVibe(vibe)"
      >
      <span class="vibe-switch-label">{{ LABELS[vibe] }}</span>
    </label>
  </fieldset>

  <button
    v-else
    type="button"
    class="vibe-switch-icon"
    :aria-label="`Vibe: ${LABELS[store.vibe]}. Switch to ${LABELS[nextVibe]}`"
    :title="`Switch vibe (now: ${LABELS[store.vibe]})`"
    @click="store.nextVibe()"
  >
    <svg v-if="store.vibe === 'terminal'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6l6 6-6 6M12 18h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg v-else-if="store.vibe === 'cartoon'" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.2 3.5 3.5 0 0 0 7 18z" fill="currentColor"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor"/>
      <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-20 12 12)"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import {VIBES, useThemeStore, type Vibe} from '~/stores/theme'

withDefaults(defineProps<{variant?: 'segmented' | 'icon'}>(), {variant: 'icon'})

const LABELS: Record<Vibe, string> = {
  terminal: 'Terminal',
  cartoon: 'Cartoon',
  galaxy: 'Galaxy'
}

const store = useThemeStore()
const nextVibe = computed(() => VIBES[(VIBES.indexOf(store.vibe) + 1) % VIBES.length])
</script>

<style scoped>
/* States: default · hover · focus-visible · active (pressed) · checked.
   disabled / loading / error / success do not apply to a theme control. */
.vibe-switch {
  display: inline-flex;
  gap: var(--space-3xs);
  padding: var(--space-3xs);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: var(--color-paper);
}

.vibe-switch-option {
  display: inline-flex;
}

.vibe-switch-label {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 var(--space-sm);
  border-radius: var(--radius-pill);
  font-family: var(--vibe-font-mono);
  font-size: var(--text-sm);
  color: var(--color-muted);
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
}

.vibe-switch-label:hover {
  color: var(--color-ink);
}

input:checked + .vibe-switch-label {
  background: var(--color-ink);
  color: var(--color-paper);
}

input:focus-visible + .vibe-switch-label {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.vibe-switch-option:active .vibe-switch-label {
  transform: translateY(1px);
}

.vibe-switch-icon {
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

.vibe-switch-icon:hover {
  border-color: var(--color-accent);
}

.vibe-switch-icon:active {
  transform: translateY(1px);
}

.vibe-switch-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
