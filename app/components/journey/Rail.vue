<template>
  <nav class="rail" :aria-label="t('about.stops')">
    <ol class="rail-list">
      <li v-for="(label, i) in labels" :key="i">
        <a :href="`#stop-${i}`" class="rail-link" :aria-current="i === active ? 'step' : undefined">
          <span class="rail-dot" aria-hidden="true"/>
          <span class="rail-label font-mono">{{ label }}</span>
        </a>
        <!-- Which project is picked inside the projects stop; the picker itself is the accessible control. -->
        <span v-if="sub && sub.stop === i" class="rail-sub" aria-hidden="true">
          <span v-for="k in sub.count" :key="k" class="rail-sub-dot" :class="{'is-on': sub.active === k - 1}"/>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{labels: readonly string[]; active: number; sub?: {stop: number; count: number; active: number | null}}>()

const {t} = useI18n()
</script>

<style scoped>
/* N3 side-rail of section names (short labels from useJourneyLabels) used as
   in-page navigation. Hidden below the layout breakpoint and on short
   viewports, where each panel's title carries the orientation. Desktop
   pointer only, so the 44 px touch floor does not apply here. */
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
    justify-items: start;
    gap: var(--space-3xs);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .rail-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    min-height: 2rem;
    padding: 0 var(--space-xs) 0 var(--space-2xs);
    border-radius: var(--radius-pill);
    color: var(--color-muted);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
  }

  .rail-link:hover {
    color: var(--color-ink);
  }

  .rail-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  .rail-link[aria-current="step"] {
    color: var(--color-ink);
    background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  }

  .rail-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentcolor;
    transition: transform var(--dur-micro) var(--ease-out);
  }

  .rail-link[aria-current="step"] .rail-dot {
    background: var(--color-accent);
    transform: scale(1.5);
  }

  .rail-label {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }

  .rail-sub {
    display: grid;
    gap: 3px;
    padding: var(--space-3xs) 0 var(--space-3xs) calc(var(--space-2xs) + 1px);
  }

  .rail-sub-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-rule);
  }

  .rail-sub-dot.is-on {
    background: var(--color-ink);
  }
}
</style>
