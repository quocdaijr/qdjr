// Which /about stop is centred in the viewport. One IntersectionObserver with a
// zero-height root band at the viewport centre: exactly one stop intersects at
// any scroll position regardless of stop height (a `threshold: 0.5` observer
// never fires for a stop taller than two viewports).
const CENTRE_BAND = '-50% 0px -50% 0px'

export function useJourney(stopCount: number) {
  const activeStop = ref(0)
  const progress = useJourneyProgress()
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.stop)
          if (Number.isNaN(index)) return
          activeStop.value = index
          progress.value = stopCount > 1 ? index / (stopCount - 1) : 0
        })
      },
      {rootMargin: CENTRE_BAND, threshold: 0}
    )
    document.querySelectorAll<HTMLElement>('[data-stop]').forEach((el) => observer?.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    progress.value = 0 // back on /, the scene returns to waypoint 0
  })

  return {activeStop}
}
