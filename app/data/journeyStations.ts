import type {ProfileContent, TimelineEntry} from './profile'

export type StationKind = 'home' | 'workshop' | 'school' | 'office' | 'press' | 'tower' | 'kiosk' | 'post'

export interface JourneyStation {
  kind: StationKind
  /** Project logo shown on a billboard station. */
  image?: string
}

/**
 * One station per /about stop, in stop order: Hello · What I do · one per
 * career stage · one per project · Say hello. The about page and the cartoon
 * scene both follow this order, so the train always has a station for the
 * centred stop.
 */
export function journeyStations(content: ProfileContent): JourneyStation[] {
  const jobs = content.timeline.filter((entry) => entry.kind === 'work')
  const careerKind = (entry: TimelineEntry): StationKind => {
    if (entry.kind === 'education') return 'school'
    const index = jobs.indexOf(entry)
    if (index === jobs.length - 1) return 'tower'
    return index % 2 === 0 ? 'office' : 'press'
  }

  return [
    {kind: 'home'},
    {kind: 'workshop'},
    ...content.timeline.map((entry) => ({kind: careerKind(entry)})),
    ...content.projects.map((project) => ({kind: 'kiosk' as const, image: project.image})),
    {kind: 'post'}
  ]
}
