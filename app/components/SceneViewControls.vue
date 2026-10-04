<template>
  <div class="view-controls" role="group" :aria-label="t('scene.view')">
    <button type="button" class="view-button" :aria-label="t('scene.zoomOut')" @click="emit('zoom', 1 / STEP)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <button type="button" class="view-button" :aria-label="t('scene.zoomIn')" @click="emit('zoom', STEP)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <button v-if="moved" type="button" class="view-button" :aria-label="t('scene.resetView')" @click="emit('reset')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
// Zoom and reset for the 3D scene. Drag-to-orbit and wheel/pinch zoom are
// pointer shortcuts; these buttons are the keyboard-reachable equivalent.
defineProps<{moved: boolean}>()
const emit = defineEmits<{zoom: [factor: number]; reset: []}>()
const {t} = useI18n()
const STEP = 1.25
</script>

<style scoped>
/* Hallmark · component: icon button group · genre: per design.md · theme: active vibe
 * states: default · hover · focus · active. disabled / loading / error / success do not apply:
 * zoom is clamped silently and the actions are instant. */
.view-controls {
  position: fixed;
  bottom: var(--space-md);
  left: var(--space-md);
  z-index: 20;
  display: none;
  gap: var(--space-3xs);
  padding: var(--space-3xs);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  backdrop-filter: blur(8px);
}

/* Desktop-sized screens only: on a phone a swipe must keep scrolling the
   page, and the hero needs the room. */
@media (width >= 40rem) {
  .view-controls {
    display: flex;
  }
}

.view-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  transition: background-color var(--dur-micro) var(--ease-out);
}

.view-button:hover {
  background: var(--color-paper-2);
}

.view-button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.view-button:active {
  transform: translateY(1px);
}

.view-button svg {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
