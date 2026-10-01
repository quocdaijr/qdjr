<template>
  <nav class="rail" aria-label="Journey stops">
    <ol class="rail-list">
      <li v-for="(label, i) in labels" :key="label">
        <a :href="`#stop-${i}`" class="rail-dot" :aria-current="i === active ? 'step' : undefined">
          <span class="rail-num font-mono">{{ String(i).padStart(2, '0') }}</span>
          <span class="sr-only">{{ label }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{labels: readonly string[]; active: number}>()
</script>

<style scoped>
/* N3 side-rail used as in-page navigation. Hidden below the layout breakpoint:
   on a phone the stop numbers inside each panel carry the orientation. */
.rail {
  display: none;
}

@media (width >= 60rem) {
  .rail {
    position: fixed;
    top: 50%;
    left: var(--space-md);
    z-index: 20;
    display: block;
    transform: translateY(-50%);
  }

  .rail-list {
    display: grid;
    gap: var(--space-2xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rail-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--radius-pill);
    color: var(--color-muted);
    text-decoration: none;
    transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
  }

  .rail-dot:hover {
    color: var(--color-ink);
  }

  .rail-dot[aria-current="step"] {
    color: var(--color-paper);
    background: var(--color-ink);
  }

  .rail-num {
    font-size: var(--text-sm);
  }
}
</style>
