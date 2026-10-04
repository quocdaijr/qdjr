<template>
  <TripView v-if="trip" :trip="trip" :vehicle="vehicle" :back="{to: editLink, label: t('trips.planner.edit')}" @update:vehicle="setVehicle">
    <template #intro>
      <p class="plan-note">{{ t('trips.planner.planned') }}</p>
      <p v-if="failure" class="plan-error" role="alert">
        {{ failure }}
        <button type="button" class="link plan-retry" @click="load">{{ t('trips.planner.retry') }}</button>
      </p>
    </template>
  </TripView>

  <section v-else class="plan">
    <div class="plan-panel">
      <NuxtLinkLocale :to="editLink" class="link plan-back">{{ t('trips.planner.edit') }}</NuxtLinkLocale>
      <h1 class="plan-title font-display">{{ title }}</h1>
      <template v-if="!valid">
        <p>{{ t('trips.planner.badStops') }}</p>
      </template>
      <template v-else-if="failure">
        <p class="plan-error" role="alert">{{ failure }}</p>
        <button type="button" class="link plan-retry" @click="load">{{ t('trips.planner.retry') }}</button>
      </template>
      <template v-else>
        <p class="plan-loading" role="status">
          {{ t('trips.planner.loading') }} <span aria-hidden="true">{{ t('trips.planner.seconds', {s: elapsed}) }}</span>
        </p>
        <p class="plan-hint">{{ t('trips.planner.loadingHint') }}</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import {rememberTrip, type Trip, type Vehicle} from '~/data/trips'
import {readPlanQuery, writePlanQuery} from '~/utils/tripQuery'

// A visitor's own trip: the stops and vehicle come from the URL, the road
// from /api/trips/plan (cached on the server). Switching vehicle asks again
// for that vehicle's road; the panel keeps the last road until it arrives.
const route = useRoute()
const router = useRouter()
const {t} = useI18n()
const localePath = useLocalePath()

const plan = computed(() => readPlanQuery(route.query))
const vehicle = computed(() => plan.value.vehicle)
const valid = computed(() => plan.value.stops.length >= 2)
const title = computed(() => (valid.value ? `${plan.value.stops[0]!.name} → ${plan.value.stops.at(-1)!.name}` : t('trips.planner.title')))
const editLink = computed(() => localePath({path: '/trips', query: writePlanQuery(plan.value.stops, vehicle.value)}))

const trip = shallowRef<Trip | null>(null)
const failure = ref('')
const elapsed = ref(0)
let clock: ReturnType<typeof setInterval> | undefined
let asked = 0 // the latest request wins

const ERRORS: Record<number, string> = {422: 'noRoute', 429: 'tooMany', 503: 'busy'}

async function load() {
  if (!valid.value) return
  const ticket = ++asked
  failure.value = ''
  elapsed.value = 0
  clearInterval(clock)
  clock = setInterval(() => elapsed.value++, 1000)
  try {
    const planned = await $fetch<Trip>('/api/trips/plan', {method: 'POST', body: {stops: plan.value.stops, vehicle: vehicle.value}})
    if (ticket !== asked) return
    rememberTrip(planned)
    trip.value = planned
  } catch (error) {
    if (ticket !== asked) return
    const status = (error as {statusCode?: number}).statusCode ?? 0
    failure.value = t(`trips.planner.errors.${ERRORS[status] ?? 'failed'}`)
  } finally {
    if (ticket === asked) clearInterval(clock)
  }
}

const setVehicle = (v: Vehicle) => router.replace({query: {...route.query, v}})

// In the browser only: a server render (or a crawler following a shared link)
// must not spend a plan on the OSM services; it shows the waiting panel.
onMounted(load)
watch(() => route.fullPath, load)
onBeforeUnmount(() => clearInterval(clock))

useSeoMeta({title: () => `${title.value} | ${t('trips.planner.metaTitle')}`, robots: 'noindex'})
</script>

<style scoped>
/* Hallmark · macrostructure: Marquee Hero (the trip scene, once planned) · tone: playful · anchor hue: per vibe accent
 * waiting state: the same glass panel as the trip page · design-system: design.md · designed-as-app */
.plan {
  display: grid;
  align-content: center;
  min-height: 80svh;
  padding: var(--space-xl) 0;
}

.plan-panel {
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
  .plan-panel {
    background: var(--color-paper);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .plan-panel {
    background: var(--color-paper);
  }
}

.plan-back {
  font-size: var(--text-sm);
}

.plan-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
  min-width: 0;
}

.plan-loading {
  margin: 0;
  font-weight: 600;
}

.plan-hint,
.plan-note {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.plan-error {
  margin: 0;
}

.plan-retry {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.plan-retry:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
</style>
