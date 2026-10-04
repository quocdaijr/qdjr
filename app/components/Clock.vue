<template>
  <section class="text-center text-gray-600 dark:text-gray-300">
    <div class="my-auto">
      <p class="tracking-widest">{{ date || NBSP }}</p>
      <p class="tracking-wider pt-2">{{ time || NBSP }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Weekday follows the page language. The old Options API version started a
// setInterval in created() and never cleared it. The visitor's own clock:
// blank in the server render (the server's time and zone are not theirs), set once mounted.
const {locale} = useI18n()

const TICK_MS = 1000
const NBSP = '\u00A0' // keeps the two lines' height before the first tick
const now = ref<Date | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = new Date()
  timer = setInterval(() => {
    now.value = new Date()
  }, TICK_MS)
})
onBeforeUnmount(() => clearInterval(timer))

const pad = (n: number) => String(n).padStart(2, '0')

const time = computed(() => (now.value ? `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}` : ''))

const date = computed(() => {
  const d = now.value
  if (!d) return ''
  const weekday = d.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'vi-VN', {weekday: 'short'}).toUpperCase()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${weekday}`
})
</script>
