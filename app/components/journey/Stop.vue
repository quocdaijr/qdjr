<template>
  <section
    :id="`stop-${index}`"
    :data-stop="index"
    class="stop"
    :class="{'is-active': active}"
    :aria-labelledby="`stop-${index}-title`"
  >
    <div class="stop-panel" :class="{'is-wide': wide}">
      <p class="stop-stage font-mono" aria-hidden="true">{{ stage }}</p>
      <component :is="`h${level}`" :id="`stop-${index}-title`" class="stop-title font-display">
        {{ title }}
      </component>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{index: number; title: string; level?: 1 | 2; active?: boolean; wide?: boolean}>(), {
  level: 2,
  active: false,
  wide: false
})

const stage = computed(() => String(props.index).padStart(2, '0'))
</script>

<style scoped>
/* Hallmark · macrostructure: Narrative Workflow · F4 step knobs: numbering=01/02, layout=vertical stack, connector=none
 * section head: stacked stage number above heading (ordinal content) · design-system: design.md · designed-as-app */
.stop {
  display: grid;
  align-content: center;
  min-height: 100svh;
  padding: var(--space-xl) 0;
  scroll-margin-top: var(--space-xl);
}

/* Opaque paper panel (glass is banned); the canvas shows around it.
   A stop waits, dimmed and slightly low, until it is the centred one; then
   the panel settles and its contents follow in a short stagger. Only
   opacity and transform move. */
.stop-panel {
  max-width: 65ch;
  padding: var(--space-lg) var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
  opacity: 0.35;
  transform: translateY(16px);
  transition: opacity var(--dur-long) var(--ease-out), transform var(--dur-long) var(--ease-out);
}

/* A stop holding its own sub-navigation (the projects picker) needs the room. */
.stop-panel.is-wide {
  max-width: 46rem;
}

.stop-panel > * {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--dur-long) var(--ease-out), transform var(--dur-long) var(--ease-out);
}

.stop-panel > :nth-child(2) { transition-delay: 60ms; }
.stop-panel > :nth-child(3) { transition-delay: 120ms; }
.stop-panel > :nth-child(4) { transition-delay: 180ms; }
.stop-panel > :nth-child(5) { transition-delay: 240ms; }
.stop-panel > :nth-child(6) { transition-delay: 300ms; }
.stop-panel > :nth-child(n + 7) { transition-delay: 360ms; }

.stop.is-active .stop-panel,
.stop.is-active .stop-panel > * {
  opacity: 1;
  transform: none;
}

.stop-stage {
  margin: 0 0 var(--space-2xs);
  font-size: var(--text-sm);
  letter-spacing: 0.08em;
  color: var(--color-accent);
}

.stop-title {
  margin: 0 0 var(--space-md);
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  min-width: 0;
}

h1.stop-title {
  font-size: var(--text-2xl);
}

@media (width >= 60rem) {
  .stop-panel {
    padding: var(--space-xl) var(--space-lg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stop-panel,
  .stop-panel > * {
    transform: none;
    transition-duration: 150ms;
    transition-delay: 0ms;
  }
}
</style>
