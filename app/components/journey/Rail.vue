<template>
  <nav class="rail" :aria-label="t('about.stops')">
    <ol class="rail-list">
      <li v-for="(label, i) in labels" :key="i">
        <a :href="`#stop-${i}`" class="rail-dot" :aria-current="i === active ? 'step' : undefined" :title="label">
          <span class="rail-num font-mono">{{ String(i).padStart(2, '0') }}</span>
          <span class="sr-only">{{ label }}</span>
        </a>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{labels: readonly string[]; active: number}>()

const {t} = useI18n()
</script>

<style scoped>
/* N3 side-rail used as in-page navigation. Hidden below the layout breakpoint
   and on short viewports: on a phone the stop numbers inside each panel carry
   the orientation. Dots are 2rem so seventeen of them fit a laptop viewport
   (desktop pointer only, so the 44 px touch floor does not apply here). */
.rail {
  display: none;
}

@media (width >= 60rem) and (height >= 42rem) {
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
    gap: var(--space-3xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rail-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
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
    font-size: 0.75rem;
  }
}
</style>
