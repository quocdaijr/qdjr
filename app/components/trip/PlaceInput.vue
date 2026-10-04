<template>
  <div class="place">
    <input
      :id="id"
      v-model="query"
      class="place-input"
      type="text"
      role="combobox"
      autocomplete="off"
      spellcheck="false"
      :placeholder="t('trips.planner.placeholder')"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      :aria-activedescendant="active >= 0 ? `${id}-option-${active}` : undefined"
      :aria-invalid="state === 'error' || undefined"
      aria-autocomplete="list"
      @input="onInput"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter="onEnter"
      @keydown.esc="close"
      @blur="onBlur"
    >
    <ul v-show="open" :id="`${id}-list`" class="place-list" role="listbox">
      <li
        v-for="(place, i) in results"
        :id="`${id}-option-${i}`"
        :key="`${place.lat},${place.lng},${i}`"
        role="option"
        class="place-option"
        :class="{'is-active': i === active}"
        :aria-selected="i === active"
        @mousedown.prevent="choose(place)"
      >
        <span class="place-name">{{ place.name }}</span>
        <span v-if="place.detail" class="place-detail">{{ place.detail }}</span>
      </li>
    </ul>
    <p v-if="message" class="place-message" :class="{'is-error': state === 'error'}" role="status">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import type {PlanStop} from '~/utils/tripQuery'

// A place search box: suggestions from /api/trips/places as you type, picked
// with the mouse or the arrow keys and Enter. Typing again clears the pick.
export interface PlaceChoice extends PlanStop {
  detail?: string
}

defineProps<{id: string}>()
const model = defineModel<PlaceChoice | null>({required: true})
const {t, locale} = useI18n()

const DEBOUNCE_MS = 300
const MIN_QUERY = 2

const query = ref(model.value?.name ?? '')
const results = ref<PlaceChoice[]>([])
const active = ref(-1)
const state = ref<'idle' | 'loading' | 'empty' | 'error'>('idle')
const open = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let asked = 0 // the latest search wins; slower answers to older ones are dropped

const message = computed(() => ({idle: '', loading: t('trips.planner.searching'), empty: t('trips.planner.noMatch'), error: t('trips.planner.searchFailed')})[state.value])

watch(model, (place) => {
  if (place && place.name !== query.value) query.value = place.name
})

function onInput() {
  model.value = null
  clearTimeout(timer)
  const q = query.value.trim()
  if (q.length < MIN_QUERY) {
    close()
    state.value = 'idle'
    return
  }
  timer = setTimeout(() => search(q), DEBOUNCE_MS)
}

async function search(q: string) {
  const ticket = ++asked
  state.value = 'loading'
  try {
    const places = await $fetch<PlaceChoice[]>('/api/trips/places', {query: {q, lang: locale.value === 'en' ? 'en' : 'vi'}})
    if (ticket !== asked) return
    results.value = places
    active.value = places.length ? 0 : -1
    open.value = places.length > 0
    state.value = places.length ? 'idle' : 'empty'
  } catch {
    if (ticket !== asked) return
    results.value = []
    open.value = false
    state.value = 'error'
  }
}

function move(step: number) {
  if (!results.value.length) return
  open.value = true
  active.value = (active.value + step + results.value.length) % results.value.length
}

function choose(place: PlaceChoice) {
  model.value = place
  query.value = place.name
  close()
}

function onEnter(event: KeyboardEvent) {
  if (!open.value || active.value < 0) return
  event.preventDefault() // pick the place, don't submit the form
  choose(results.value[active.value]!)
}

function close() {
  open.value = false
  active.value = -1
}

function onBlur() {
  close()
  if (state.value === 'empty') state.value = 'idle'
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
/* Hallmark · component: combobox · genre: per design.md · theme: active vibe
 * states: default · hover · focus · active (option) · disabled n/a · loading · error · success (a place picked) */
.place {
  position: relative;
  min-width: 0;
}

.place-input {
  width: 100%;
  min-height: 44px;
  padding: 0 var(--space-sm);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  color: var(--color-ink);
  font: inherit;
  transition: border-color var(--dur-micro) var(--ease-out);
}

.place-input:hover {
  border-color: var(--color-muted);
}

.place-input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.place-input[aria-invalid="true"] {
  border-color: var(--color-accent);
}

.place-input::placeholder {
  color: var(--color-muted);
}

.place-list {
  position: absolute;
  top: calc(100% + var(--space-3xs));
  right: 0;
  left: 0;
  z-index: 20;
  max-height: 18rem;
  margin: 0;
  padding: var(--space-3xs);
  overflow-y: auto;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  list-style: none;
}

.place-option {
  display: grid;
  gap: 2px;
  min-height: 44px;
  padding: var(--space-2xs) var(--space-xs);
  border-radius: var(--radius-card);
  cursor: pointer;
}

.place-option:hover,
.place-option.is-active {
  background: var(--color-paper-2);
}

.place-name {
  font-weight: 600;
}

.place-detail,
.place-message {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.place-message {
  margin: var(--space-3xs) 0 0 var(--space-sm);
}

@media (prefers-reduced-motion: reduce) {
  .place-input {
    transition-duration: 0ms;
  }
}
</style>
