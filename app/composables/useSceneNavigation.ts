import {projectsStopIndex} from '~/data/journeyStations'
import {PROFILE_CONTENT} from '~/data/profile'

const PROJECTS_STOP = projectsStopIndex(PROFILE_CONTENT.en)

// Turns scene clicks into page navigation. On /about it scrolls to the stop
// (and picks the project); elsewhere it opens /about at that stop.
export function useSceneNavigation() {
  const action = useSceneAction()
  const focus = useJourneyFocus()
  const route = useRoute()
  const localePath = useLocalePath()
  const getRouteBaseName = useRouteBaseName()

  watch(action, async (current) => {
    if (!current || current.action.type === 'fun') return
    const stop = current.action.type === 'stop' ? current.action.stop : PROJECTS_STOP
    const project = current.action.type === 'project' ? current.action.project : null
    if (getRouteBaseName(route) !== 'about') {
      await navigateTo(`${localePath('/about')}#stop-${stop}`)
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`stop-${stop}`)?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'})
    if (project !== null) focus.value = project
  })
}
