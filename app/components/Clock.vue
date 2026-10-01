<template>
  <section class="text-center text-gray-600 dark:text-gray-300">
    <div class="my-auto">
      <p class="tracking-widest">{{ date }}</p>
      <p class="tracking-wider pt-2">{{ time }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Weekday follows the page language. The old Options API version started a
// setInterval in created() and never cleared it.
const {locale} = useI18n()

const TICK_MS = 1000
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, TICK_MS)
})
onBeforeUnmount(() => clearInterval(timer))

const pad = (n: number) => String(n).padStart(2, '0')

const time = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`)

const date = computed(() => {
  const d = now.value
  const weekday = d.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'vi-VN', {weekday: 'short'}).toUpperCase()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${weekday}`
})
</script>
