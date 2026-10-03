// One short label per /about stop, in stop order — the rail and the scene
// hover labels share it.
export function useJourneyLabels() {
  const {t} = useI18n()
  const content = useProfile()
  return computed(() => [
    t('about.hello'),
    t('about.whatIDo'),
    ...content.value.timeline.map((entry) => entry.short),
    t('about.projects'),
    t('about.sayHello')
  ])
}
