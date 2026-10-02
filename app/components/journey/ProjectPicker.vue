<template>
  <div class="picker">
    <nav class="picker-list" :aria-label="t('about.projectList')">
      <template v-for="group in groups" :key="group.name">
        <p class="picker-group font-mono">{{ group.name }}</p>
        <ul role="list">
          <li v-for="i in group.indices" :key="i">
            <button
              :ref="(el) => (buttons[i] = el as HTMLButtonElement)"
              type="button"
              class="picker-item"
              :aria-pressed="i === selected"
              :aria-controls="detailId"
              :tabindex="i === selected ? 0 : -1"
              @click="select(i)"
              @keydown="onKey"
            >
              <img :src="projects[i].image" alt="" width="28" height="28" loading="lazy" class="picker-thumb">
              <span class="picker-name">{{ projects[i].alt }}</span>
            </button>
          </li>
        </ul>
      </template>
    </nav>

    <div :id="detailId" class="picker-detail" aria-live="polite">
      <Transition name="pick" mode="out-in">
        <article :key="selected" class="picker-card">
          <p class="project-kicker font-mono">
            {{ project.group }}
            <span v-if="!project.url" class="project-internal">· {{ t('about.internal') }}</span>
          </p>
          <img :src="project.image" :alt="project.alt" width="72" height="72" class="project-logo">
          <h3 class="picker-title font-display">{{ project.name }}</h3>
          <p class="project-description">{{ project.description }}</p>
          <p class="project-role">{{ project.role }}</p>
          <a v-if="project.url" :href="project.url" target="_blank" rel="noopener noreferrer" class="link">{{ t('about.visitLive') }}</a>
        </article>
      </Transition>
      <div class="picker-step">
        <button type="button" class="picker-arrow" :aria-label="t('about.prevProject')" @click="select(wrap(selected - 1))">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="font-mono">{{ t('about.projectCount', {n: String(selected + 1).padStart(2, '0'), total: projects.length}) }}</span>
        <button type="button" class="picker-arrow" :aria-label="t('about.nextProject')" @click="select(wrap(selected + 1))">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {Project} from '~/data/profile'
import {nextPick} from '~/utils/pickerKeys'

const props = defineProps<{projects: readonly Project[]}>()

const {t} = useI18n()
const focus = useJourneyFocus()
const detailId = useId()
const selected = ref(0)
const buttons: HTMLButtonElement[] = []

const project = computed(() => props.projects[selected.value])

// Contiguous runs of the same employer, in data order.
const groups = computed(() =>
  props.projects.reduce<Array<{name: string; indices: number[]}>>((runs, p, i) => {
    const last = runs.at(-1)
    return last?.name === p.group ? [...runs.slice(0, -1), {...last, indices: [...last.indices, i]}] : [...runs, {name: p.group, indices: [i]}]
  }, [])
)

const wrap = (i: number) => (i + props.projects.length) % props.projects.length

function select(i: number) {
  selected.value = i
  focus.value = i
}

function onKey(event: KeyboardEvent) {
  const next = nextPick(selected.value, event.key, props.projects.length)
  if (next === null) return
  event.preventDefault()
  select(next)
  nextTick(() => buttons[next]?.focus())
}

onMounted(() => (focus.value = selected.value))
onBeforeUnmount(() => (focus.value = null))
</script>

<style scoped>
/* Hallmark · component: picker (grouped list + detail) · genre: per design.md · theme: active vibe
 * states: default · hover · focus · active · pressed. disabled / loading / error / success do not
 * apply: the list is static profile data. */
.picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-md);
}

.picker-list ul {
  display: flex;
  gap: var(--space-2xs);
  margin: 0 0 var(--space-sm);
  padding: 0 0 var(--space-3xs);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  list-style: none;
}

.picker-list li {
  flex: 0 0 auto;
  scroll-snap-align: start;
}

.picker-group {
  margin: 0 0 var(--space-3xs);
  font-size: var(--text-sm);
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.picker-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  min-height: 2.75rem;
  padding: 0 var(--space-sm) 0 var(--space-2xs);
  border: var(--rule-hair) solid transparent;
  border-radius: var(--radius-card);
  color: var(--color-muted);
  text-align: start;
  white-space: nowrap;
  transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
}

.picker-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  transition: border-color var(--dur-micro) var(--ease-out);
}

.picker-arrow:hover {
  border-color: var(--color-accent);
}

.picker-arrow svg {
  width: 1.25rem;
  height: 1.25rem;
}

.picker-item:hover {
  color: var(--color-ink);
  background: var(--color-paper-2);
}

.picker-item:focus-visible,
.picker-arrow:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.picker-item:active,
.picker-arrow:active {
  transform: translateY(1px);
}

.picker-item[aria-pressed="true"] {
  color: var(--color-ink);
  border-color: var(--color-rule);
  background: var(--color-paper-2);
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.picker-thumb {
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  object-fit: contain;
}

.picker-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-detail {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 24rem;
}

.picker-title {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-lg);
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.project-kicker {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-sm);
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

.project-internal {
  color: var(--color-accent);
}

.project-logo {
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: var(--space-sm);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper-2);
  object-fit: contain;
}

.project-description {
  margin: 0 0 var(--space-sm);
  font-size: var(--text-md);
  line-height: 1.45;
}

.project-role {
  margin: 0 0 var(--space-md);
  color: var(--color-muted);
}

.picker-step {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: var(--rule-hair) solid var(--color-rule);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.pick-enter-active,
.pick-leave-active {
  transition: opacity var(--dur-short) var(--ease-out), transform var(--dur-short) var(--ease-out);
}

.pick-enter-from,
.pick-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Wide: the list becomes a column beside the detail. */
@media (width >= 48rem) {
  .picker {
    grid-template-columns: minmax(0, 12.5rem) minmax(0, 1fr);
    gap: var(--space-md);
  }

  .picker-list ul {
    display: grid;
    gap: 0;
    overflow: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pick-enter-active,
  .pick-leave-active {
    transition-duration: 150ms;
  }

  .pick-enter-from,
  .pick-leave-to {
    transform: none;
  }
}
</style>
