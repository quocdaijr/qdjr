<template>
  <form class="planner" :aria-labelledby="`${uid}-title`" @submit.prevent="submit">
    <h2 :id="`${uid}-title`" class="planner-title font-display">{{ t('trips.planner.title') }}</h2>
    <p class="planner-intro">{{ t('trips.planner.intro') }}</p>

    <ol class="planner-stops">
      <li v-for="(stop, i) in stops" :key="stop.key" class="planner-stop">
        <label :for="`${uid}-${stop.key}`" class="planner-label">{{ i === 0 ? t('trips.planner.from') : t('trips.planner.to', {n: i}) }}</label>
        <PlaceInput :id="`${uid}-${stop.key}`" v-model="stop.place"/>
        <div class="planner-tools">
          <button type="button" class="planner-tool" :disabled="i === 0" :aria-label="t('trips.planner.up', {place: labelOf(i)})" @click="swap(i, i - 1)">↑</button>
          <button type="button" class="planner-tool" :disabled="i === stops.length - 1" :aria-label="t('trips.planner.down', {place: labelOf(i)})" @click="swap(i, i + 1)">↓</button>
          <button type="button" class="planner-tool" :disabled="stops.length <= MIN_STOPS" :aria-label="t('trips.planner.remove', {place: labelOf(i)})" @click="remove(i)">×</button>
        </div>
      </li>
    </ol>
    <button v-if="stops.length < MAX_STOPS" type="button" class="link planner-add" @click="add">+ {{ t('trips.planner.add') }}</button>

    <fieldset class="seg">
      <legend class="seg-legend">{{ t('trips.vehicleLegend') }}</legend>
      <label v-for="v in VEHICLES" :key="v" class="seg-option">
        <input v-model="vehicle" type="radio" :name="`${uid}-vehicle`" :value="v" class="seg-input">
        <span>{{ t(`trips.vehicle.${v}`) }}</span>
      </label>
    </fieldset>

    <div class="planner-submit">
      <button type="submit" class="link planner-go" :aria-describedby="ready ? undefined : `${uid}-need`">{{ t('trips.planner.submit') }}</button>
      <p v-if="tried && !ready" :id="`${uid}-need`" class="planner-need" role="alert">{{ t('trips.planner.needAll') }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import {VEHICLES, type Vehicle} from '~/data/trips'
import {readPlanQuery, writePlanQuery} from '~/utils/tripQuery'
import PlaceInput, {type PlaceChoice} from './PlaceInput.vue'

// "Plan your own trip": an origin, one to five more stops in order, a
// vehicle; submitting opens /trips/plan with the trip in its URL. Arriving
// from "Edit the trip" (/trips?stop=…&v=…) fills the form back in.
const MIN_STOPS = 2
const MAX_STOPS = 6

const {t} = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const uid = useId()
let nextKey = 0
const entry = (place: PlaceChoice | null) => ({key: nextKey++, place})

const prefill = readPlanQuery(route.query)
const stops = ref(prefill.stops.length >= MIN_STOPS ? prefill.stops.slice(0, MAX_STOPS).map(entry) : [entry(null), entry(null)])
const vehicle = ref<Vehicle>(prefill.vehicle)
const tried = ref(false)
const ready = computed(() => stops.value.every((s) => s.place))

const labelOf = (i: number) => stops.value[i]?.place?.name ?? (i === 0 ? t('trips.planner.from') : t('trips.planner.to', {n: i}))
const add = () => stops.value.push(entry(null))
const remove = (i: number) => stops.value.splice(i, 1)
function swap(a: number, b: number) {
  const list = [...stops.value]
  ;[list[a], list[b]] = [list[b]!, list[a]!]
  stops.value = list
}

function submit() {
  tried.value = true
  if (!ready.value) return
  const chosen = stops.value.map((s) => ({name: s.place!.name, lat: s.place!.lat, lng: s.place!.lng}))
  navigateTo({path: localePath('/trips/plan'), query: writePlanQuery(chosen, vehicle.value)})
}
</script>

<style scoped>
/* Hallmark · component: form (planner) · genre: per design.md · theme: active vibe
 * states: default · hover · focus · active · disabled (tools at the ends) · error (needAll) · loading/success: on /trips/plan */
.planner {
  display: grid;
  gap: var(--space-sm);
  max-width: 48rem;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-sm);
  color: var(--color-ink);
}

.planner-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.planner-intro {
  margin: 0;
  max-width: 60ch;
}

.planner-stops {
  display: grid;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.planner-stop {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3xs) var(--space-2xs);
  align-items: start;
}

.planner-label {
  grid-column: 1 / -1;
  font-size: var(--text-sm);
  font-weight: 600;
}

.planner-tools {
  display: flex;
  gap: var(--space-3xs);
}

.planner-tool {
  width: 44px;
  height: 44px;
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-pill);
  background: color-mix(in oklch, var(--color-paper) 85%, transparent);
  color: var(--color-ink);
  font: inherit;
  cursor: pointer;
  transition: background-color var(--dur-micro) var(--ease-out);
}

.planner-add,
.planner-go {
  justify-self: start;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.planner-go {
  font-weight: 700;
}

.planner-tool:disabled {
  opacity: 0.4;
  cursor: default;
}

.planner-tool:focus-visible,
.planner-add:focus-visible,
.planner-go:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.planner-tool:hover:not(:disabled) {
  background: var(--color-paper-2);
}

.planner-tool:active:not(:disabled) {
  transform: translateY(1px);
}

.planner-submit {
  display: grid;
  gap: var(--space-2xs);
}

.planner-need {
  margin: 0;
  font-size: var(--text-sm);
}

@media (prefers-reduced-motion: reduce) {
  .planner-tool {
    transition-duration: 0ms;
  }
}
</style>
