<template>
  <TripView :trip="trip" :vehicle="vehicle" :back="{to: '/trips', label: t('trips.back')}" @update:vehicle="vehicle = $event"/>
</template>

<script setup lang="ts">
import {findTrip, type Vehicle} from '~/data/trips'

const route = useRoute()
const {t, locale} = useI18n()
const trip = findTrip(String(route.params.slug))
if (!trip) throw createError({statusCode: 404, statusMessage: t('trips.notFound'), fatal: true})
const vehicle = ref<Vehicle>(trip.vehicle)
const lang = computed(() => (locale.value === 'en' ? 'en' : 'vi'))

useSeoMeta({
  title: () => `${trip.title[lang.value]} | ${t('trips.metaTitle')}`,
  description: () => trip.summary[lang.value]
})
</script>
