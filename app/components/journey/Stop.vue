<template>
  <section :id="`stop-${index}`" :data-stop="index" class="stop" :aria-labelledby="`stop-${index}-title`">
    <div class="stop-panel">
      <p class="stop-stage font-mono" aria-hidden="true">{{ stage }}</p>
      <component :is="`h${level}`" :id="`stop-${index}-title`" class="stop-title font-display">
        {{ title }}
      </component>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{index: number; title: string; level?: 1 | 2}>(), {level: 2})

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

/* Opaque paper panel (glass is banned); the canvas shows around it. */
.stop-panel {
  max-width: 65ch;
  padding: var(--space-lg) var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
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
</style>
