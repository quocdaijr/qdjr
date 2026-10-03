<template>
  <section class="trip">
    <div class="trip-panel">
      <NuxtLinkLocale :to="back.to" class="link trip-back">{{ back.label }}</NuxtLinkLocale>
      <h1 class="trip-title font-display">{{ trip.title[lang] }}</h1>
      <p v-if="trip.summary[lang]" class="trip-summary">{{ trip.summary[lang] }}</p>
      <slot name="intro" />

      <fieldset class="seg">
        <legend class="seg-legend">{{ t('trips.vehicleLegend') }}</legend>
        <label v-for="v in VEHICLES" :key="v" class="seg-option">
          <input :checked="v === vehicle" type="radio" name="vehicle" :value="v" class="seg-input" @change="emit('update:vehicle', v)">
          <span>{{ t(`trips.vehicle.${v}`) }}</span>
        </label>
      </fieldset>
      <fieldset class="seg">
        <legend class="seg-legend">{{ t('trips.viewLegend') }}</legend>
        <label v-for="v in VIEWS" :key="v" class="seg-option">
          <input v-model="view" type="radio" name="view" :value="v" class="seg-input">
          <span>{{ t(`trips.view.${v}`) }}</span>
        </label>
      </fieldset>
      <p v-if="shown !== vehicle" class="trip-status" role="status">{{ t('trips.planning', {vehicle: t(`trips.vehicle.${vehicle}`)}) }}</p>
      <p class="trip-meta">
        {{ t('trips.distance', {km: variant.distanceKm}) }} · {{ tripDuration(t, variant.durationMin) }}
      </p>
      <p v-if="detour" class="trip-note">{{ t('trips.noMotorway', detour) }}</p>

      <h2 class="trip-heading">{{ t('trips.itinerary') }}</h2>
      <p v-if="status" class="trip-status" role="status">
        {{ status }}
        <button v-if="progress.parked" type="button" class="link trip-resume" @click="resume">{{ t('trips.resume') }}</button>
      </p>
      <ol class="itinerary">
        <li
          v-for="(mark, i) in marks"
          :key="`${shown}-${i}`"
          :class="[mark.kind === 'stop' ? 'it-stop' : 'it-place', {'is-current': i === progress.mark}]"
          :aria-current="i === progress.mark ? 'step' : undefined"
        >
          <button type="button" class="it-go" :aria-label="t('trips.goTo', {place: nameOf(mark)})" @click="driveTo(i)">{{ nameOf(mark) }}</button>
        </li>
      </ol>

      <i18n-t keypath="trips.credit" tag="p" scope="global" class="trip-credit">
        <template #valhalla>
          <a href="https://valhalla.github.io/valhalla/" class="link" target="_blank" rel="noopener">{{ t('trips.valhalla') }}</a>
        </template>
        <template #osm>
          <a href="https://www.openstreetmap.org/copyright" class="link" target="_blank" rel="noopener">{{ t('trips.osm') }}</a>
        </template>
      </i18n-t>
    </div>
  </section>
</template>

<script setup lang="ts">
import {VEHICLES, type Trip, type Vehicle} from '~/data/trips'
import {tripMarks, type TripMarkRef} from '~/scenes/trip/timeline'
import {tripDuration} from '~/utils/tripDuration'
import type {ActiveTrip} from '~/composables/useTripScene'

// The panel of a trip page — curated (/trips/[slug]) or planned (/trips/plan) —
// and its hand-off to the layout's scene, which draws this road instead of
// the vibe scene. A trip may not have the picked vehicle's road yet (a planned
// trip fetches it): the panel keeps showing the road it has until it arrives.
const props = defineProps<{trip: Trip; vehicle: Vehicle; back: {to: string; label: string}}>()
const emit = defineEmits<{'update:vehicle': [vehicle: Vehicle]}>()

const {t, locale} = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'vi'))
const VIEWS = ['overview', 'driver'] as const
const shown = computed<Vehicle>(() => (props.trip.variants[props.vehicle] ? props.vehicle : props.trip.vehicle))
const control = useTripControl()
const view = computed({get: () => control.value.view, set: (v) => (control.value = {...control.value, view: v})})
const variant = computed(() => props.trip.variants[shown.value]!)
const marks = computed(() => tripMarks(variant.value))
const progress = useTripProgress()
const activeTrip = useActiveTrip()

const nameOf = (mark: TripMarkRef) => (mark.kind === 'stop' ? props.trip.stops[mark.index] : variant.value.places[mark.index]).name[lang.value]
const driveTo = (mark: number) => (control.value = {...control.value, target: mark})
const resume = () => (control.value = {...control.value, target: null})
const status = computed(() => {
  const target = control.value.target
  if (target === null || !marks.value[target]) return ''
  const place = nameOf(marks.value[target])
  return progress.value.parked ? t('trips.parkedAt', {place}) : t('trips.drivingTo', {place})
})

// A motorbike's road differs where the car takes an expressway: say so, with both lengths (when the car's road is known).
const detour = computed(() => {
  const car = props.trip.variants.car?.distanceKm
  return shown.value === 'motorbike' && car !== undefined && variant.value.distanceKm !== car ? {km: variant.value.distanceKm, car} : null
})

// The next trip page mounts before this one unmounts: clear only what this panel set.
let mine: ActiveTrip | null = null
watch(
  [lang, shown, () => props.trip.slug],
  ([l, v, slug], previous) => {
    progress.value = {leg: 0, mark: 0, parked: false}
    // A new road: picked places index another itinerary. The view stays as the reader set it, except on arrival.
    control.value = {view: previous ? control.value.view : 'overview', target: null}
    activeTrip.value = mine = {slug, vehicle: v, locale: l}
  },
  {immediate: true}
)
onBeforeUnmount(() => {
  // useState hands back a reactive proxy of what was stored: compare the raw object.
  if (toRaw(activeTrip.value) === mine) activeTrip.value = null
})
</script>

<style scoped>
/* Hallmark · macrostructure: Marquee Hero (the scene is the statement) · tone: playful · anchor hue: per vibe accent
 * one glass panel (design.md § Surfaces) over the trip scene · vehicle and view pickers: segmented radios · design-system: design.md · designed-as-app
 * Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V4 */
.trip {
  display: grid;
  align-content: end;
  min-height: 100svh;
  padding: 42svh 0 var(--space-xl);
}

.trip-panel {
  display: grid;
  gap: var(--space-sm);
  justify-items: start;
  max-width: 26rem;
  padding: var(--space-lg) var(--space-md);
  border: var(--rule-hair) solid var(--color-rule);
  border-radius: var(--radius-card);
  background: color-mix(in oklch, var(--color-paper) 50%, transparent);
  backdrop-filter: blur(18px) saturate(1.3);
  color: var(--color-ink);
}

@supports not (backdrop-filter: blur(1px)) {
  .trip-panel {
    background: var(--color-paper);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .trip-panel {
    background: var(--color-paper);
  }
}

.trip-back {
  font-size: var(--text-sm);
}

.trip-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  min-width: 0;
}

.trip-summary,
.trip-meta,
.trip-note {
  margin: 0;
}

.trip-meta {
  font-weight: 600;
}

.trip-note {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.trip-status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs) var(--space-sm);
  align-items: baseline;
  margin: 0;
  font-size: var(--text-sm);
}

.trip-resume {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.trip-heading {
  margin: var(--space-xs) 0 0;
  font-size: var(--text-base);
  font-weight: 600;
}

/* A vertical line through the stops; the places passed between them hang off it. */
.itinerary {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0 0 0 var(--space-md);
  border-left: 2px solid var(--color-rule);
  list-style: none;
}

.it-stop,
.it-place {
  position: relative;
}

.it-stop {
  font-weight: 600;
}

.it-place {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

/* The accent rides on a dot beside ink text: small accent text fails AA on glass. */
.it-stop::before,
.it-place::before {
  content: "";
  position: absolute;
  top: calc(22px - 6px);
  left: calc(-1 * var(--space-md) - 7px);
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-rule);
  border-radius: 50%;
  background: var(--color-paper);
}

.it-place::before {
  top: calc(22px - 3px);
  left: calc(-1 * var(--space-md) - 4px);
  width: 6px;
  height: 6px;
  border-width: 0;
  background: var(--color-rule);
}

/* Each place is a button: the vehicle drives there. It reads as the list item it was. */
.it-go {
  min-height: 44px; /* design.md: hit targets ≥ 44 px */
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.it-go:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-underline-offset: 0.2em;
}

.it-go:focus-visible,
.trip-resume:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.is-current::before {
  border-color: var(--color-accent);
  background: var(--color-accent);
}

.it-place.is-current {
  color: var(--color-ink);
  font-weight: 600;
}

.trip-credit {
  margin: var(--space-xs) 0 0;
  color: var(--color-muted);
  font-size: var(--text-sm);
}

@media (width >= 60rem) {
  .trip {
    align-content: center;
    padding: var(--space-xl) 0;
  }

  .trip-panel {
    padding: var(--space-xl) var(--space-lg);
  }
}

</style>
