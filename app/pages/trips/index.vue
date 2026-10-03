<template>
  <div class="w-full">
    <HeaderContent :title="t('trips.title')" :description="t('trips.description')"/>
    <TripPlanner/>
    <ol class="trip-list">
      <li v-for="trip in TRIPS" :key="trip.slug" class="trip-row">
        <svg class="trip-shape" :viewBox="`0 0 ${SHAPE} ${SHAPE}`" aria-hidden="true">
          <path :d="routePath(trip.variants[trip.vehicle]!.route, SHAPE)"/>
        </svg>
        <div class="trip-text">
          <h2 class="trip-title font-display">{{ trip.title[lang] }}</h2>
          <p class="trip-summary">{{ trip.summary[lang] }}</p>
          <p class="trip-meta">
            {{ t(`trips.vehicle.${trip.vehicle}`) }} · {{ t('trips.distance', {km: trip.variants[trip.vehicle]!.distanceKm}) }} ·
            {{ tripDuration(t, trip.variants[trip.vehicle]!.durationMin) }}
          </p>
          <NuxtLinkLocale :to="`/trips/${trip.slug}`" class="link">{{ t('trips.open') }}</NuxtLinkLocale>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import {TRIPS} from '~/data/trips'
import {routePath} from '~/utils/routePath'
import {tripDuration} from '~/utils/tripDuration'

const SHAPE = 96 // px, the route thumbnail
const {t, locale} = useI18n()
const lang = computed(() => (locale.value === 'en' ? 'en' : 'vi'))

useSeoMeta({title: () => t('trips.metaTitle'), description: () => t('trips.description')})
</script>

<style scoped>
/* Hallmark · macrostructure: Long Document (list of trips) · tone: playful · anchor hue: per vibe accent
 * enrichment: E5 hand-built SVG — each trip's real road as a thumbnail · design-system: design.md · designed-as-app */
.trip-list {
  display: grid;
  gap: 0;
  max-width: 48rem;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-sm) var(--space-2xl);
  list-style: none;
}

.trip-row {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr);
  gap: var(--space-md);
  padding: var(--space-lg) 0;
  border-bottom: var(--rule-hair) solid var(--color-rule);
  color: var(--color-ink);
}

.trip-shape {
  width: 4rem;
  height: 4rem;
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trip-text {
  display: grid;
  gap: var(--space-2xs);
  justify-items: start;
  min-width: 0;
}

.trip-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.trip-summary {
  margin: 0;
  max-width: 60ch;
}

.trip-meta {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-sm);
}

@media (width >= 40rem) {
  .trip-row {
    grid-template-columns: 6rem minmax(0, 1fr);
  }

  .trip-shape {
    width: 6rem;
    height: 6rem;
  }
}
</style>
